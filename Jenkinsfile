pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'alphacar'
        IMAGE_NAME = 'alphacar-app'
        GIT_REPO = 'https://github.com/Alphacar-project/alphacar.git'
    }

    stages {

        // 1️⃣ 코드 체크아웃
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        // 2️⃣ SonarQube 분석 (backend 폴더 기준)
        stage('SonarQube Analysis') {
            steps {
                dir('backend') {
                    withSonarQubeEnv("${SONARQUBE}") {
                        sh '''
                        mvn clean verify sonar:sonar \
                          -Dsonar.projectKey=alphacar \
                          -Dsonar.projectName=alphacar-backend \
                          -Dsonar.sources=. \
                          -Dsonar.java.binaries=target \
                          -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        // 3️⃣ Docker 이미지 빌드
        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:latest .
                    '''
                }
            }
        }

        // 4️⃣ Trivy 보안 스캔
        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest \
                      client --remote http://trivy:4954 \
                      image --exit-code 1 --severity HIGH,CRITICAL ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:latest || true
                    '''
                }
            }
        }

        // 5️⃣ Harbor에 이미지 푸시
        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                    echo $PASS | docker login ${HARBOR_URL} -u $USER --password-stdin
                    docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:latest
                    docker logout ${HARBOR_URL}
                    '''
                }
            }
        }
    }

    // 6️⃣ 빌드 결과
    post {
        success {
            echo "✅ Build, SonarQube Analysis, Trivy Scan, and Harbor Push completed successfully!"
        }
        failure {
            echo "❌ Build Failed! Check SonarQube or Trivy logs for details."
        }
    }
}
