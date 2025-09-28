pipeline {
    // Use a Docker container as the build environment for consistency and cleanliness.
    // This provides Node.js v18 for the frontend build.
    agent {
        docker {
            image 'node:20-slim'
            args '-u root' // Run the container as the root user
        }
    }

    options {
        // Clean the workspace before every build to ensure no old files interfere.
        cleanWs()
    }

    stages {
        // --- FRONTEND PIPELINE STAGES ---
        // These stages will only run if changes are detected in the 'frontend/' directory.
        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Building the frontend artifact...'
                dir('frontend') {
                    sh 'node --version'
                    sh 'npm install --cache .npm'
                    sh 'npm run build'
                    // Stash the build artifact for use in the deployment stage.
                    stash name: 'frontend-build', includes: 'build/**'
                }
            }
        }

        stage('Test Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Testing the frontend...'
                dir('frontend') {
                    // Tests need their own dependencies, so run npm install again.
                    sh 'npm install --cache .npm'
                    sh 'npm test'
                }
            }
        }

        stage('Deploy Frontend to Netlify') {
            when {
                // Only deploy when changes are on the 'main' branch.
                branch 'main'
                changeset "frontend/**"
            }
            steps {
                echo 'Deploying frontend from stashed artifact...'
                dir('frontend') {
                    // Retrieve the artifact created in the 'Build Frontend' stage.
                    unstash 'frontend-build'

                    // Use the secret credentials stored securely in Jenkins.
                    withCredentials([string(credentialsId: 'netlify-auth-token', variable: 'NETLIFY_AUTH_TOKEN'),
                                     string(credentialsId: 'netlify-site-id', variable: 'NETLIFY_SITE_ID')]) {

                        // Install the Netlify CLI and deploy the stashed 'build' folder.
                        sh '''
                            npm install netlify-cli -g
                            netlify deploy --prod --dir=build --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
                        '''
                    }
                }
            }
        }

        // --- BACKEND PIPELINE STAGES ---
        // These stages will only run if changes are detected in the 'backend/' directory.
        // NOTE: This assumes your backend can be built/tested in the same node container.
        // If it requires Java/Maven, you would need a different agent for these stages.
        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                echo 'Changes detected in backend folder. Building the backend...'
                dir('backend') {
                    // Replace with your actual backend build command (e.g., 'mvn package').
                    sh 'echo "Running backend build..."'
                }
            }
        }

        stage('Test Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                echo 'Testing the backend...'
                dir('backend') {
                    // Replace with your actual backend test command (e.g., 'mvn test').
                    sh 'echo "Running backend tests..."'
                }
            }
        }
    }

    // post-build actions can be added here (e.g., notifications)
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
