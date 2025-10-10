// ===================================================================
// HELPER FUNCTION TO GET STAGE STATUSES
// This must be defined outside the pipeline block.
// ===================================================================
def getStageStatuses() {
    def stages = [:]
    // Using a try-catch block to handle cases where the build object might not be fully available
    try {
        def build = currentBuild.rawBuild
        def walker = new org.jenkinsci.plugins.workflow.graph.FlowGraphWalker(build.getExecution())
        
        for (def node in walker) {
            if (node instanceof org.jenkinsci.plugins.workflow.cps.nodes.StepAtomNode && node.getDescriptor().getId() == 'stage') {
                def stageName = node.getArgument(0)
                def status = 'SUCCESS'
                def errorAction = node.getAction(org.jenkinsci.plugins.workflow.actions.ErrorAction.class)
                if (errorAction != null) {
                    status = 'FAILED'
                } else if (node.getExecution().isCancelled()) {
                    status = 'ABORTED'
                }
                stages[stageName] = status
            }
        }
        
        def foundFailure = false
        def finalStages = [:]
        stages.each { stageName, status ->
            if (foundFailure) {
                finalStages[stageName] = 'SKIPPED'
            } else {
                finalStages[stageName] = status
            }
            if (status == 'FAILED') {
                foundFailure = true
            }
        }
        return finalStages
    } catch (e) {
        // Return a default message if status parsing fails
        return ["Error": "Could not retrieve stage status"]
    }
}

// ===================================================================
// MAIN PIPELINE DEFINITION
// ===================================================================
pipeline {
    agent any
    tools { nodejs "node" }

    environment {
        DOCKER_IMAGE = "mightyshashank/spe-calculator"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Test Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Testing the frontend...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build and Deploy Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Building and Deploying frontend...'
                dir('frontend') {
                    sh 'node --version'
                    sh 'npm install'
                    sh 'npm run build'
                    withCredentials([string(credentialsId: 'netlify-pat-token-spe-calculator', variable: 'NETLIFY_AUTH_TOKEN'),
                                     string(credentialsId: 'netlify-site-id-spe-calculator', variable: 'NETLIFY_SITE_ID')]) {
                        sh '''
                            npm install netlify-cli -g
                            netlify deploy --prod --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                dir('backend') {
                    sh 'echo "Running backend build..."'
                    sh 'npm install'
                }
            }
        }

        stage('Test Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                dir('backend') {
                    sh 'echo "Running backend tests..."'
                }
            }
        }

        stage('Build Docker Image') {
            when {
                changeset "backend/**"
            }
            steps {
                script {
                    dir('backend') {
                        sh """
                            echo "Building Docker image..."
                            docker build -t $DOCKER_IMAGE:$DOCKER_TAG .
                        """
                    }
                }
            }
        }

        stage('Push Docker Image to Hub') {
            when {
                changeset "backend/**"
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            docker push $DOCKER_IMAGE:$DOCKER_TAG
                        """
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            when {
                changeset "backend/**"
            }
            steps {
                script {
                    dir('backend/ansible') {
                        sh """
                            echo "Running Ansible playbook..."
                            ansible-playbook -i hosts deploy.yml
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // ===================================================================
                // HTML & CSS STYLING FOR THE EMAIL
                // ===================================================================
                def statusColors = [
                    'SUCCESS': '#28a745',
                    'FAILED': '#dc3545',
                    'SKIPPED': '#6c757d'
                ]
                def buildStatus = currentBuild.result ?: 'SUCCESS'
                def buildColor = statusColors[buildStatus] ?: '#007bff'
                
                def stageStatuses = getStageStatuses()
                def stageRows = ''
                stageStatuses.each { stageName, status ->
                    def color = statusColors[status] ?: '#6c757d'
                    stageRows += """
                        <tr>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #dddddd;">${stageName}</td>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #dddddd; text-align: center;">
                                <span style="background-color: ${color}; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold;">${status}</span>
                            </td>
                        </tr>
                    """
                }

                // ===================================================================
                // EMAIL BODY TEMPLATE
                // ===================================================================
                def ngrokUrl = 'https://96178a24bd01.ngrok-free.app'
                def publicBuildUrl = env.BUILD_URL.replace('http://localhost:8080', ngrokUrl)
                
                def emailBody = """
                <!DOCTYPE html>
                <html>
                <head>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: ${buildColor}; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="margin:0; font-size: 24px;">Build ${buildStatus}</h1>
                            <p style="margin:5px 0 0;">${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        </div>
                        <div style="padding: 25px;">
                            <p>A new build has completed. Here are the details:</p>
                            
                            ${buildStatus == 'FAILURE' ? """
                            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin-top: 20px; border-radius: 5px;">
                                <strong>Error:</strong>
                                <pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 5px; font-family: monospace;">${error.message}</pre>
                            </div>
                            """ : ''}
                            
                            <h3 style="margin-top: 25px; margin-bottom: 15px;">Stage Overview</h3>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                <thead>
                                    <tr>
                                        <th style="background-color: #f2f2f2; padding: 12px 15px; text-align: left; border-bottom: 2px solid #dddddd; width: 70%;">Stage Name</th>
                                        <th style="background-color: #f2f2f2; padding: 12px 15px; text-align: center; border-bottom: 2px solid #dddddd;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stageRows}
                                </tbody>
                            </table>
                            
                            <p style="text-align: center; margin-top: 30px;">
                                <a href="${publicBuildUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">View Build in Jenkins</a>
                            </p>
                        </div>
                        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
                            This is an automated notification from Jenkins.
                        </div>
                    </div>
                </body>
                </html>
                """

                // Set subject based on build status
                def emailSubject = (buildStatus == 'SUCCESS') ? "✅ SUCCESS: Pipeline '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]" : "❌ FAILED: Pipeline '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]"

                // Send the email
                emailext (
                    subject: emailSubject,
                    body: emailBody,
                    to: 'shashank@codecollab.co.in',
                    mimeType: 'text/html',
                    attachLog: (buildStatus == 'FAILURE')
                )
            }
            
            // Perform cleanup and other final actions
            echo 'Pipeline finished and done 12.'
            cleanWs()
        }
    }
}