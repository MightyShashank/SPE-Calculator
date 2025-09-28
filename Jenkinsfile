pipeline {
    agent any
    tools { nodejs "node" }

    stages {
        // THE SEPARATE 'Build Frontend' STAGE HAS BEEN REMOVED

        stage('Test Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Testing the frontend...'
                dir('frontend') {
                    sh 'npm install'
                    // sh 'npm test'
                }
            }
        }

        // This new stage now handles both building and deploying the frontend.
        stage('Build and Deploy Frontend') {
            when {
                branch 'main'
                changeset "frontend/**"
            }
            steps {
                echo 'Building and Deploying frontend...'
                dir('frontend') {
                    // Step 1: Install dependencies and build the project
                    sh 'node --version'
                    sh 'npm install'
                    sh 'npm run build'

                    // Step 2: Deploy the newly created 'dist' folder to Netlify
                    withCredentials([string(credentialsId: 'netlify-auth-token', variable: 'NETLIFY_AUTH_TOKEN'),
                                     string(credentialsId: 'netlify-site-id', variable: 'NETLIFY_SITE_ID')]) {
                        sh '''
                            npm install netlify-cli -g
                            netlify deploy --prod --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
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
            cleanWs()
        }
    }
}