# 아빠 어디가~

공개 인스타그램 여행 게시물의 확인 가능한 반응 수치를 기준으로 크기 위계를 만든 가족여행 모자이크입니다.

## 기준

- 표본: 한국관광공사 국내여행 계정 `@kto9suk9suk`의 2026년 9월 최신 공개 게시물 12개
- 확인: 2026-10-01 KST
- 정렬: 공개 좋아요 수 내림차순
- 주의: 인스타그램 전체 인기 순위가 아니며, 운영시간·요금·행사일정은 방문 전 공식 채널 재확인이 필요합니다.

## 로컬 확인

다음 명령으로 정적 미리보기 서버를 열고 `http://127.0.0.1:8765`에서 확인합니다. 데이터 검증도 함께 실행할 수 있습니다.

```sh
node scripts/serve.mjs
node scripts/build.mjs
node scripts/validate.mjs
```

`trips.json`을 수정한 뒤에는 반드시 `node scripts/build.mjs`를 실행해 카드 HTML을 `index.html`에 정적으로 기록합니다. 따라서 JavaScript가 꺼져도 모자이크 콘텐츠와 원문 링크가 남습니다.

`main` 브랜치에 push하면 검증 통과 후 GitHub Pages 배포 워크플로가 실행됩니다. 저장소의 Pages 소스는 **GitHub Actions**로 설정해야 합니다.
