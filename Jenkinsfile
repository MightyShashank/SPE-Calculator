pipeline {
    // Use a Docker container as the build environment for consistency and cleanliness.
    agent {
        docker {
            image 'node:20-slim'
            args '-u root' // Run the container as the root user
        }
    }

    stages {
        // --- FRONTEND PIPELINE STAGES ---
        // These stages will only run if changes are detected in the 'frontend/' directory.
        stage('Preparation') {
            steps {
                echo 'Cleaning the workspace before build...'
                // This step deletes the contents of the current directory
                deleteDir()
            }
        }

        // --- FRONTEND PIPELINE STAGES ---
        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Building the frontend artifact...'
                dir('frontend') {
                    sh 'npm install --cache .npm'
                    sh 'npm run build'
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
        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                echo 'Changes detected in backend folder. Building the backend...'
                dir('backend') {
                    // Replace with your actual backend build command.
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
                    // Replace with your actual backend test command.
                    sh 'echo "Running backend tests..."'
                }
            }
        }
    }

    // This block runs after all stages are complete.
    post {
        // 'always' ensures this runs whether the pipeline succeeds or fails.
        always {
            echo 'Pipeline finished. Cleaning up the workspace for the next run...'
            // This is the correct place for the workspace cleanup step.
            cleanWs()
        }
    }
}