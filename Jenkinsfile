pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out the code..."
                // Jenkins automatically checks out the repo if using pipeline from SCM
            }
        }

        stage('Build') {
            steps {
                echo "Building the project..."
                // Put your build commands here
                sh 'echo "Simulating build step"'
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
                // Put your test commands here
                sh 'echo "Simulating test step"'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying the project..."
                // Put your deploy commands here
                sh 'echo "Simulating deploy step"'
            }
        }
    }

    post {
        always {
            echo 'This will always run at the end of the pipeline.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}

