// ===================================================================
// HELPER FUNCTION TO GET STAGE STATUSES
// This must be defined outside the pipeline block.
// ===================================================================
import groovy.json.JsonSlurper
import jenkins.model.Jenkins

// ===================================================================
// HELPER FUNCTION TO GET STAGE STATUSES (IMPROVED VERSION)
// This must be defined outside the pipeline block.
// ===================================================================
@NonCPS // Best practice for functions using Jenkins APIs
def getStageStatuses() {
    def stageResults = [:]
    try {
        // Use the Blue Ocean API if available, as it's the most reliable
        def apiUrl = "${Jenkins.instance.getRootUrl()}blue/rest/organizations/jenkins/pipelines/${env.JOB_NAME}/runs/${env.BUILD_NUMBER}/nodes/?limit=10000"
        def nodes = new JsonSlurper().parse(new URL(apiUrl).newReader())
        
        for (def node in nodes) {
            if (node.type == "STAGE") {
                // Capitalize status for consistency (e.g., "SUCCESS", "FAILED")
                stageResults[node.displayName] = node.result.toUpperCase()
            }
        }
        
        // If Blue Ocean fails, fall back to the graph walker method
        if (stageResults.isEmpty()) {
            throw new Exception("Blue Ocean API returned no stages, trying fallback.")
        }

    } catch (Exception e) {
        println "Could not use Blue Ocean API, using fallback method. Error: ${e.message}"
        // Fallback logic from before, slightly improved
        def build = currentBuild.rawBuild
        def walker = new org.jenkinsci.plugins.workflow.graph.FlowGraphWalker(build.getExecution())
        def stagesInOrder = []
        for (def node in walker) {
            if (node instanceof org.jenkinsci.plugins.workflow.cps.nodes.StepStartNode && "Stage" == node.getStepName()) {
                def stageName = node.getDisplayName()
                def status = (node.getError() != null) ? 'FAILED' : 'SUCCESS'
                stagesInOrder.add([name: stageName, status: status])
            }
        }
        // Determine SKIPPED stages based on the first failure
        def foundFailure = false
        for (def stage in stagesInOrder) {
            if (foundFailure) {
                stageResults[stage.name] = 'SKIPPED'
            } else {
                stageResults[stage.name] = stage.status
            }
            if (stage.status == 'FAILED') {
                foundFailure = true
            }
        }
    }
    
    // Ensure that if the build failed but no stage is marked FAILED, we mark the last one.
    if (currentBuild.result == 'FAILURE' && !stageResults.containsValue('FAILED')) {
        if (!stageResults.isEmpty()) {
            def lastStageName = stageResults.keySet()[-1]
            stageResults[lastStageName] = 'FAILED'
        }
    }

    return stageResults
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
                    echo 'Forcing this stage to fail for demonstration...'
                    // The 'exit 1' command tells the shell to exit with a failure status code.
                    // Jenkins will interpret this as a build failure.
                    sh 'exit 1'
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
        success {
            script {
                // This logic runs only on successful builds
                def statusColors = [
                    'SUCCESS': '#28a745',
                    'FAILED': '#dc3545',
                    'SKIPPED': '#6c757d'
                ]
                def buildStatus = 'SUCCESS'
                def buildColor = statusColors[buildStatus]
                
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

                def ngrokUrl = 'https://96178a24bd01.ngrok-free.app'
                def publicBuildUrl = env.BUILD_URL.replace('http://localhost:8080', ngrokUrl)
                
                def emailBody = """
                <!DOCTYPE html>
                <html>
                <head></head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: ${buildColor}; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="margin:0; font-size: 24px;">Build ${buildStatus}</h1>
                            <p style="margin:5px 0 0;">${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        </div>
                        <div style="padding: 25px;">
                            <p>A new build has completed successfully. Here are the details:</p>
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

                emailext (
                    subject: "✅ SUCCESS: Pipeline '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
                    body: emailBody,
                    to: 'shashank@codecollab.co.in',
                    mimeType: 'text/html'
                )
            }
        }
        failure {
            script {
                // This logic runs only on failed builds
                def statusColors = [
                    'SUCCESS': '#28a745',
                    'FAILED': '#dc3545',
                    'SKIPPED': '#6c757d'
                ]
                def buildStatus = 'FAILURE' // We know it's a failure here
                def buildColor = statusColors['FAILED']
                
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

                def ngrokUrl = 'https://96178a24bd01.ngrok-free.app'
                def publicBuildUrl = env.BUILD_URL.replace('http://localhost:8080', ngrokUrl)
                
                def emailBody = """
                <!DOCTYPE html>
                <html>
                <head></head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: ${buildColor}; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                            <h1 style="margin:0; font-size: 24px;">Build ${buildStatus}</h1>
                            <p style="margin:5px 0 0;">${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        </div>
                        <div style="padding: 25px;">
                            <p>A build has failed. Here are the details:</p>
                            
                            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin-top: 20px; border-radius: 5px;">
                                <strong>Error:</strong>
                                <pre style="white-space: pre-wrap; word-wrap: break-word; margin-top: 5px; font-family: monospace;">
                                    The pipeline failed. Please check the Jenkins console log for details.
                                </pre>
                            </div>

                            
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

                emailext (
                    subject: "❌ FAILED: Pipeline '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
                    body: emailBody,
                    to: 'shashank@codecollab.co.in',
                    mimeType: 'text/html',
                    attachLog: true
                )
            }
        }
        always {
            // This block is now only for cleanup
            echo 'Pipeline finished. Cleaning up workspace.'
            cleanWs()
        }
    }
}