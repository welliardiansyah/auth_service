pipeline {
  agent any

  stages {
    stage('Build & Test') {
      when {
        branch "development"
      }
      agent {
        docker {
          image 'node:14.17.0-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'yarn install'
        sh 'yarn test:cov'
      }
    }

    stage('Coding Standard') {
      agent {
        docker {
          image 'node:14.17.0-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'yarn lint:test'
      }
    }

    stage('Sonarqube Analysis') {
      environment {
        scannerHome = tool 'sonarqube-scanner'
      }

      steps {
        withSonarQubeEnv(installationName: 'sonarqube') {
          sh '$scannerHome/bin/sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }

  post {
    failure {
      emailext subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME}",
        body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}",
        recipientProviders: [
          [$class: 'DevelopersRecipientProvider'],
          [$class: 'RequesterRecipientProvider']
        ]
    }

    always {
      cleanWs()
    }
  }
}
