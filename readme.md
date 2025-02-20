🚀 프로젝트 설치 및 빌드 방법 (로컬 환경)

📌 1. 패키지 설치

먼저 프로젝트의 의존성을 설치합니다.

npm install

📌 2. 환경 변수 설정 (EAS Secrets 가져오기)

EAS에 저장된 환경 변수를 로컬로 가져옵니다.

eas env:pull

🔹 실행 후 .env.local과 .eas/.env/GOOGLE_SERVICE_JSON 파일이 생성됩니다. EAS에서 설정한 환경 변수를 사용할 수 있습니다.
🔹 파일이 정상적으로 생성되었는지 확인하세요.

📌 3. Android 빌드 실행

npx expo run:android

🔹 expo run:android 명령어를 실행하면 Android 빌드 및 실행이 시작됩니다.

---

🚀 프로젝트 설치 및 빌드 방법 (expo 서버)

📌 1. 패키지 설치

먼저 프로젝트의 의존성을 설치합니다.

npm install

📌 2. Android 빌드 실행

eas build --profile development --platform android
🔹 현재 production 빌드가 불가능합니다. (Nativewind 스타일 문제)
