# Chainblock - Cloudflare Pages 배포 가이드

## 📋 현재 설정 상태

✅ wrangler 설치 완료
✅ Cloudflare 계정 연결 완료 (Ppssbb1024@gmail.com)
✅ 배포 설정 파일 생성 완료
✅ 배포 스크립트 추가 완료

## 🏠 로컬 테스트 방법

### 1. 프론트엔드 빌드 테스트
```bash
cd frontend
npm run build
```
→ `dist/` 폴더가 생성되고 최적화된 파일이 생성됩니다.

### 2. 빌드된 파일 로컬 프리뷰
```bash
npm run preview
```
→ 로컬에서 프로덕션 버전을 테스트할 수 있습니다 (http://localhost:4173)

### 3. Wrangler Pages 로컬 서버
```bash
wrangler pages dev frontend/dist
```
→ Cloudflare Pages 환경에서 실제 배포처럼 테스트합니다 (http://localhost:8788)

## 🚀 배포 커맨드

### 프로덕션 배포
```bash
cd frontend
npm run deploy
```
→ 빌드 후 `chainblock.pages.dev`에 배포됩니다

### Staging 배포
```bash
cd frontend
npm run deploy:staging
```
→ 테스트 브랜치에 배포합니다

## 📝 체크리스트

배포 전에 확인할 사항:
- [ ] 로컬에서 `npm run build` 성공
- [ ] `npm run preview` 또는 `wrangler pages dev` 작동 확인
- [ ] 모든 페이지 (Home, Bounties, PostQuestion, Profile, QuestionDetail) 테스트
- [ ] 지갑 연결 및 MetaMask 작동 확인
- [ ] 블록체인 상호작용 테스트 (질문 등록, 답변 제출 등)
- [ ] 다크모드 토글 작동 확인
- [ ] 응답형 디자인 테스트 (모바일/태블릿/데스크탑)
