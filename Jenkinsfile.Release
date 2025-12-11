pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube'
        SONAR_URL = 'http://192.168.0.160:9000'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'alphacar-project'
        FRONTEND_IMAGE = 'alphacar-frontend'
        NGINX_IMAGE = 'alphacar-nginx'
        GIT_REPO = 'https://github.com/Alphacar-project/alphacar.git'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Read Version') {
            steps {
                script {
                    def baseBackVer = readFile('backend/version.txt').trim()
                    def baseFrontVer = readFile('frontend/version.txt').trim()

                    env.BACKEND_VERSION = "${baseBackVer}.${currentBuild.number}"
                    env.FRONTEND_VERSION = "${baseFrontVer}.${currentBuild.number}"

                    echo "🚀 New Backend Version: ${env.BACKEND_VERSION}"
                    echo "🚀 New Frontend Version: ${env.FRONTEND_VERSION}"
                }
            }
        }

        stage('SonarQube Analysis - Backend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=alphacar-backend -Dsonar.projectName=alphacar-backend -Dsonar.sources=backend -Dsonar.host.url=${SONAR_URL} -Dsonar.sourceEncoding=UTF-8"
                    }
                }
            }
        }

        stage('SonarQube Analysis - Frontend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.projectName=alphacar-frontend -Dsonar.sources=frontend -Dsonar.host.url=${SONAR_URL} -Dsonar.sourceEncoding=UTF-8"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Backend 서비스 목록 (원하는 서비스 추가/제거)
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    backendServices.each { service ->
                        sh "docker build --build-arg APP_NAME=${service} -f backend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} backend/"
                    }

                    // Frontend
                    sh "docker build -f frontend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} frontend/"

                    // Nginx
                    sh "docker build -f nginx.Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION} ."
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    def SKIP_CACHE_FILES = "--skip-files 'root/.npm/_cacache/*'"

                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    backendServices.each { service ->
                        echo "🛡️ Scanning Backend Service: ${service}"
                        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${SKIP_CACHE_FILES} ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                    }

                    echo "🛡️ Scanning Frontend Service"
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${SKIP_CACHE_FILES} ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                // harbor-cred는 Jenkins에 username/password로 저장된 자격증명 ID
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    script {
                        // 안전하게 멀티라인으로 로그인 (변수 치환 정상)
                        sh """
                        echo "\$PASS" | docker login ${HARBOR_URL} -u \$USER --password-stdin
                        """

                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        backendServices.each { service ->
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                        }
                        sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                        sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION}"

                        sh "docker logout ${HARBOR_URL}"
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                // ssh-server는 Jenkins에 등록된 SSH credential ID (private key)
                sshagent(credentials: ['ssh-server']) {
                    withCredentials([file(credentialsId: 'ALPHACAR', variable: 'ENV_FILE_PATH'),
                                     usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'HB_USER', passwordVariable: 'HB_PASS')]) {
                        script {
                            def remoteIP = '192.168.0.160'
                            def remoteUser = 'kevin'

                            // 읽어와 로컬에서 치환해서 원격으로 전송
                            def envContent = readFile(ENV_FILE_PATH).trim()

                            sh """
                            ssh -o StrictHostKeyChecking=no ${remoteUser}@${remoteIP} <<ENDSSH
                            mkdir -p ~/alphacar/deploy
                            cat > ~/alphacar/deploy/.env <<EOF_ENV
${envContent}
BACKEND_VERSION=${BACKEND_VERSION}
FRONTEND_VERSION=${FRONTEND_VERSION}
EOF_ENV
                            chmod 600 ~/alphacar/deploy/.env

                            # 하버 로그인 (원격에서 token/username으로 로그인)
                            echo "${HB_PASS}" | docker login ${HARBOR_URL} -u ${HB_USER} --password-stdin

                            cd ~/alphacar/deploy
                            docker compose pull
                            docker compose up -d --force-recreate
                            ENDSSH
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ All Stages Completed Successfully! 🎉"
        }
        failure {
            echo "❌ Build Failed! Please check the logs."
        }
    }
}

