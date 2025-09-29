pipeline {
    agent any
    tools { nodejs "node" }

    environment {
        DOCKER_IMAGE = "mightyshashank/spe-calculator"
        DOCKER_TAG = "latest"
    }

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
                    sh 'npm test'
                }
            }
        }

        // This new stage now handles both building and deploying the frontend.
        stage('Build and Deploy Frontend') {
            when {
                // branch 'main'
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

        // --- BACKEND PIPELINE STAGES ---
        stage('Build Backend') {
            when {
                changeset "backend/**"
            }
            steps {
                dir('backend') {
                    sh 'echo "Running backend build..."'
                    // install deps (Node.js example)
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
                    // run unit tests
                    // sh 'npm test || true'  // replace with actual test framework
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
                    dir('ansible') {
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
            echo 'Pipeline finished.'
            cleanWs()
        }
    }
}