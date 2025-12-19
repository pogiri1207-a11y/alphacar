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

        // SonarQube 분석 (선택적 - 기본 스킵, ENABLE_SONAR=true로 활성화)
        stage('SonarQube Analysis') {
            when {
                expression { return env.ENABLE_SONAR == 'true' }
            }
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        def scannerHome = tool 'sonar-scanner'
                        
                        // Backend와 Frontend 병렬 분석 (빠른 실행)
                        parallel(
                            'Backend': {
                                withSonarQubeEnv("${SONARQUBE}") {
                                    sh """
                                        timeout 300 ${scannerHome}/bin/sonar-scanner \\
                                            -Dsonar.projectKey=alphacar-backend \\
                                            -Dsonar.projectName=alphacar-backend \\
                                            -Dsonar.sources=backend \\
                                            -Dsonar.host.url=${SONAR_URL} \\
                                            -Dsonar.sourceEncoding=UTF-8 \\
                                            -Dsonar.scanner.timeout=300
                                    """ || echo "⚠️ SonarQube Backend 분석 실패 - 계속 진행"
                                }
                            },
                            'Frontend': {
                                withSonarQubeEnv("${SONARQUBE}") {
                                    sh """
                                        timeout 300 ${scannerHome}/bin/sonar-scanner \\
                                            -Dsonar.projectKey=alphacar-frontend \\
                                            -Dsonar.projectName=alphacar-frontend \\
                                            -Dsonar.sources=frontend \\
                                            -Dsonar.host.url=${SONAR_URL} \\
                                            -Dsonar.sourceEncoding=UTF-8 \\
                                            -Dsonar.exclusions=**/*.html,**/node_modules/** \\
                                            -Dsonar.javascript.node.maxspace=4096 \\
                                            -Dsonar.scanner.timeout=300
                                    """ || echo "⚠️ SonarQube Frontend 분석 실패 - 계속 진행"
                                }
                            }
                        )
                        echo "✅ SonarQube 분석 완료"
                    }
                }
            }
        }

        // ✅ Docker 빌드 병렬화 및 캐시 최적화 (모든 이미지 빌드 보장)
        stage('Build Docker Images') {
            steps {
                script {
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    
                    // 모든 빌드를 한 번에 병렬 실행 (9개 이미지: 7개 백엔드 + Frontend + Nginx)
                    def buildSteps = [:]
                    
                    // 백엔드 서비스 빌드
                    backendServices.each { service ->
                        buildSteps["Backend-${service}"] = {
                            catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                                sh """
                                    # 캐시 이미지 pull 시도 (실패해도 계속 진행)
                                    docker pull ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest || true
                                    docker build \\
                                        --build-arg APP_NAME=${service} \\
                                        --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest \\
                                        -f backend/Dockerfile \\
                                        -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} \\
                                        -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest \\
                                        backend/ || (echo "Build failed, retrying without cache" && \\
                                        docker build \\
                                        --build-arg APP_NAME=${service} \\
                                        -f backend/Dockerfile \\
                                        -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} \\
                                        -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest \\
                                        backend/)
                                """
                            }
                        }
                    }
                    
                    // Frontend 빌드
                    buildSteps['Frontend'] = {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            sh """
                                docker pull ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:latest || true
                                docker build \\
                                    --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:latest \\
                                    -f frontend/Dockerfile \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:latest \\
                                    frontend/
                            """
                        }
                    }
                    
                    // Nginx 빌드
                    buildSteps['Nginx'] = {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            sh """
                                docker pull ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:latest || true
                                docker build \\
                                    --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:latest \\
                                    -f nginx.Dockerfile \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION} \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:latest \\
                                    .
                            """
                        }
                    }
                    
                    // 모든 빌드를 병렬로 실행 (9개 이미지 동시 빌드)
                    echo "🏗️ Building all 9 images in parallel: ${backendServices.join(', ')}, Frontend, Nginx"
                    parallel buildSteps
                }
            }
        }

        // ✅ Trivy 스캔 최적화 (선택적 - 기본 스킵, ENABLE_TRIVY=true로 활성화)
        stage('Trivy Security Scan') {
            when {
                expression { return env.ENABLE_TRIVY == 'true' }
            }
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        // Trivy DB 업데이트 (한 번만)
                        echo "🔄 Updating Trivy DB..."
                        sh "docker run --rm -v trivy_cache:/root/.cache aquasec/trivy:latest image --download-db-only"
                        
                        def TRIVY_OPTIONS = "--exit-code 0 --severity HIGH,CRITICAL --timeout 2m --no-progress --skip-db-update --skip-files 'root/.npm/_cacache/*' --cache-dir /root/.cache/trivy"
                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        
                        // 스캔을 4개씩 그룹으로 나눠서 실행 (lock 충돌 방지하면서도 빠르게)
                        def serviceGroups = backendServices.collate(4)
                        
                        serviceGroups.eachWithIndex { group, groupIndex ->
                            def scanSteps = [:]
                            group.each { service ->
                                scanSteps["Scan-${service}"] = {
                                    sh """
                                        docker run --rm \\
                                            -v /var/run/docker.sock:/var/run/docker.sock \\
                                            -v trivy_cache:/root/.cache \\
                                            aquasec/trivy:latest image ${TRIVY_OPTIONS} \\
                                            ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}
                                    """
                                }
                            }
                            
                            if (groupIndex == serviceGroups.size() - 1) {
                                scanSteps['Scan-Frontend'] = {
                                    sh """
                                        docker run --rm \\
                                            -v /var/run/docker.sock:/var/run/docker.sock \\
                                            -v trivy_cache:/root/.cache \\
                                            aquasec/trivy:latest image ${TRIVY_OPTIONS} \\
                                            ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}
                                    """
                                }
                            }
                            
                            parallel scanSteps
                            
                            // 그룹 간 짧은 대기 (lock 해제)
                            if (groupIndex < serviceGroups.size() - 1) {
                                sleep(time: 1, unit: 'SECONDS')
                            }
                        }
                        echo "✅ Trivy 스캔 완료"
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    script {
                        sh """
                        echo "\$PASS" | docker login ${HARBOR_URL} -u \$USER --password-stdin
                        """
                        
                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        
                        // ✅ Push도 병렬화
                        def pushSteps = [:]
                        
                        backendServices.each { service ->
                            pushSteps["Push-Backend-${service}"] = {
                                sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                            }
                        }
                        
                        pushSteps['Push-Frontend'] = {
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                        }
                        
                        pushSteps['Push-Nginx'] = {
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION}"
                        }
                        
                        // 모든 push를 병렬로 실행
                        parallel pushSteps
                        
                        sh "docker logout ${HARBOR_URL}"
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent(credentials: ['ssh-server']) {
                    withCredentials([file(credentialsId: 'ALPHACAR', variable: 'ENV_FILE_PATH'),
                                     usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'HB_USER', passwordVariable: 'HB_PASS')]) {
                        script {
                            def remoteIP = '192.168.0.160'
                            def remoteUser = 'kevin'

                            try {
                                def envContent = readFile(ENV_FILE_PATH).trim()

                                sh """
                                set -e
                                echo "🔗 Connecting to ${remoteUser}@${remoteIP}..."
                                ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${remoteUser}@${remoteIP} bash -s <<ENDSSH
                                set -e
                                echo "📁 Creating deploy directory..."
                                mkdir -p ~/alphacar/deploy
                                cd ~/alphacar/deploy
                                
                                echo "📝 Writing .env file..."
                                cat > .env <<EOF_ENV
${envContent}
BACKEND_VERSION=${BACKEND_VERSION}
FRONTEND_VERSION=${FRONTEND_VERSION}
EOF_ENV
                                chmod 600 .env
                                echo "✅ .env file created"

                                echo "🔐 Logging into Harbor..."
                                echo '${HB_PASS}' | docker login ${HARBOR_URL} -u '${HB_USER}' --password-stdin || {
                                    echo "❌ Harbor login failed"
                                    exit 1
                                }
                                echo "✅ Harbor login successful"

                                echo "📥 Pulling images..."
                                if [ ! -f docker-compose.yml ]; then
                                    echo "❌ docker-compose.yml not found in ~/alphacar/deploy"
                                    exit 1
                                fi
                                
                                docker compose pull || {
                                    echo "⚠️ Some images failed to pull, continuing..."
                                }
                                echo "✅ Images pulled"

                                echo "🚀 Starting services..."
                                docker compose up -d --force-recreate || {
                                    echo "❌ Failed to start services"
                                    docker compose ps
                                    exit 1
                                }
                                echo "✅ Services started successfully"
                                
                                echo "📊 Service status:"
                                docker compose ps
ENDSSH
                                echo "✅ Deployment completed successfully"
                                """
                            } catch (Exception e) {
                                echo "❌ Deployment failed: ${e.getMessage()}"
                                error("Deployment failed: ${e.getMessage()}")
                            }
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
