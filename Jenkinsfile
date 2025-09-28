pipeline {
    agent any

    stages {
        // --- FRONTEND PIPELINE STAGES ---
        stage('Build Frontend') {
            when {
                changeset "frontend/**"
            }
            steps {
                echo 'Building the frontend artifact...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    // Stash the build artifact for use in a later stage
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
                    // Tests still need dependencies, so we run install here too
                    sh 'npm install'
                    sh 'npm test' // Make sure you have a test script in package.json
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
                    // Unstash the build artifact created in the 'Build Frontend' stage
                    unstash 'frontend-build'

                    withCredentials([string(credentialsId: 'netlify-pat-token-spe-calculator`', variable: 'NETIFY_AUTH_TOKEN'),
                                     string(credentialsId: 'netlify-site-id-spe-calculator', variable: 'NETLIFY_SITE_ID')]) {

                        // Now, we only need to install the deploy tool and deploy the existing build folder
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
                echo 'Changes detected in backend folder. Building the backend...'
                dir('backend') {
                    // Corrected command to print text
                    sh 'echo "Building in backend"'
                    // Your real build command would go here, e.g., 'mvn package'
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
                    // Corrected command to print text
                    sh 'echo "Testing in backend"'
                    // Your real test command would go here, e.g., 'mvn test'
                }
            }
        }
    }
}