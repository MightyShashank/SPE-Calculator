pipeline {
    // Run directly on the Jenkins agent (your machine).
    agent any

    // Define the environment for the pipeline.
    tools {nodejs "node"}

    stages {

        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Building the frontend artifact...'
                dir('frontend') {
                    sh 'node --version' // This will now show your machine's version
                    sh 'npm install'   // The '--cache' flag is no longer needed
                    sh 'npm run build'
                    // This correctly points to the build folder inside the frontend directory
                    stash name: 'frontend-build', includes: 'frontend/build/**'
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
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Deploy Frontend to Netlify') {
            when {
                branch 'main'
                changeset "frontend/**"
            }
            steps {
                echo 'Deploying frontend from stashed artifact...'
                dir('frontend') {
                    unstash 'frontend-build'
                    withCredentials([string(credentialsId: 'netlify-auth-token', variable: 'NETLIFY_AUTH_TOKEN'),
                                     string(credentialsId: 'netlify-site-id', variable: 'NETLIFY_SITE_ID')]) {
                        sh '''
                            npm install netlify-cli -g
                            netlify deploy --prod --dir=build --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
                        '''
                    }
                }
            }
        }

        // --- BACKEND PIPELINE STAGES ---
        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                dir('backend') {
                    sh 'echo "Running backend build..."'
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
    }

    post {
        always {
            echo 'Pipeline finished.'
            // We can leave this out since we clean at the start,
            // but it's good practice for after.
            cleanWs()
        }
    }
}