# Docker 사용 가이드

이 프로젝트는 Docker를 사용하여 모든 팀원이 동일한 환경에서 실행할 수 있도록 설정되었습니다.

## 필수 조건 

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)이 컴퓨터에 설치되어 있어야 합니다.

## 설정 방법 

1.  **저장소 클론**: 프로젝트 코드를 다운로드합니다.
2.  **`.env` 파일 생성**:
    - 루트 디렉토리(이 파일이 있는 곳)에 `.env` 파일을 만듭니다.
    - `.env.example` 파일의 내용을 복사해서 붙여넣어도 됩니다.
    - 실제 사용하는 키 값들(`GEMINI_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `NEXT_PUBLIC_API_URL`)을 `.env` 파일에 넣으세요.
    - **주의**: `.env` 파일은 보안상 git에 올라가지 않도록 설정되어 있습니다. 절대 커밋하지 마세요.

## 실행 방법

터미널에서 다음 명령어를 실행하면 백엔드와 프론트엔드가 자동으로 설치되고 실행됩니다.

```bash
docker-compose up --build
```

- **프론트엔드 (웹 화면)**: http://localhost:3000
- **백엔드 (API 서버)**: http://localhost:5000

## 종료 방법

터미널에서 `Ctrl+C`를 누르거나, 새로운 터미널 창에서 다음 명령어를 실행하세요:

```bash
docker-compose down
```

## 문제 해결 

- **포트 충돌 (Port 5000 is already in use)**: 로컬에서 이미 백엔드나 프론트엔드를 따로 켜두셨다면 끄고 다시 실행해 주세요.
- **실행이 안 될 때**: 뭔가 꼬인 것 같으면 `docker-compose up --build --force-recreate` 명령어로 완전히 새로 다시 빌드해 보세요.
