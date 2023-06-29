경광등 에이전트

Background: 
   문제가 생긴 설비에 하드웨어적인 경광등을 설치해서 경고, 오류시 시/청각적인 피드백을 발생시킨다.


서버에는 Websocket으로 접속하여 대기한다.
연결이 끊기면 다시 연결을 시도한다.

# 배포
사전에 pm2 가 global로 설치되어 있어야 함
```bash
> npm i -g pm2
```
pm2-script의 MFR_CODE를 설정해줘야 한다.

# 필수!! 윈도우에서 빌드시
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
를 수행해서 사용자에게 스크립트 실행 권한을 줘야한다.


## PM2 이용해서 띄우는 방법
```bash
> npm run build
> pm2 kill && pm2 start pm2-scripts/sirenAgent.json
```

## PM2 로그 보는방법
```bash
> pm2 logs
```
