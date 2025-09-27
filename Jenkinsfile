pipeline {
    agent any

    stages {
        // --- FRONTEND PIPELINE STAGES ---
        stage('Build Frontend') {
            when {
                // This condition checks if any changed files are inside the 'frontend/' folder
                changeset "frontend/**"
            }
            steps {
                echo 'Changes detected in frontend folder. Building the frontend...'
                dir('frontend') {
                    // Your frontend build commands go here
                    sh 'npm install'
                    sh 'npm run build'
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
                    sh 'npm test'
                }
            }
        }

        // --- BACKEND PIPELINE STAGES ---
        stage('Build Backend') {
            when {
                // This condition checks if any changed files are inside the 'backend/' folder
                changeset "backend/**"
            }
            steps {
                echo 'Changes detected in backend folder. Building the backend...'
                dir('backend') {
                    // Your backend build commands go here (e.g., for Maven)
                    sh 'mvn clean package'
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
                    sh 'mvn test'
                }
            }
        }
    }
}
