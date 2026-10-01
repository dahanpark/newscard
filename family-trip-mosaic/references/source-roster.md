# Source Roster

이 파일은 고정 추천 목록이 아니라 조사 출발점이다. 매회 프로필 소개, 최근 활동일, 공개 반응 수치와 가족 나들이 적합성을 다시 확인한다. 조건을 충족하지 않으면 새 계정으로 교체한다.

## 2026-10-01 공개 확인 표본

| 계정 | 유형 | 공개 프로필에서 확인한 성격 | 사용 원칙 |
|---|---|---|---|
| [@kto9suk9suk](https://www.instagram.com/kto9suk9suk/) | 공공 관광 | 한국관광공사 국내여행 | 공식 일정·장소 교차확인용 |
| [@heeminimi](https://www.instagram.com/heeminimi/) | 개인 여행 | 국내외 여행 코스·체험 | 국내 가족 나들이 관련 게시물만 후보화 |
| [@sujin.trip](https://www.instagram.com/sujin.trip/) | 개인 여행 | 서울 나들이·여행·체험 | 광고 표시와 가족 적합성 확인 |
| [@travel.soo02](https://www.instagram.com/travel.soo02/) | 개인 여행 | 서울 공간·전시·카페 | 어린이 연령 제한과 예약 조건 확인 |
| [@goseoa_life](https://www.instagram.com/goseoa_life/) | 개인 지역여행 | 강원 고성·시골살이·지역 체험 | 개인 일상과 실제 나들이 정보를 구분 |
| [@halo_bongbong](https://www.instagram.com/halo_bongbong/) | 개인 지역여행 | 대구·경북·근교 여행 | 최근 30일 활동 여부 재확인 |

위 표본만으로 최종 30선을 만들지 않는다. 특히 육아·아이동반 나들이 계정 2개 이상을 별도로 새로 발굴하고, 후보 URL과 공개 수치를 함께 기록한다. 검색 결과가 로그인 벽에 막히면 임의 계정을 추정하지 말고 공개 프로필·게시물로 확인 가능한 대체 계정을 찾는다.

## 조사 기록 형식

후보마다 아래 값을 남긴다.

```text
account, accountType, followersObserved, postUrl, publishedAt,
checkedAt, likes, comments, engagementScore, sponsored,
place, familyFit, exclusionReason
```

`engagementScore = likes + comments × 5`이며, 수치가 공개되지 않으면 `null`로 기록한다. 최종 순위에 들어간 게시물은 `exclusionReason`을 비우고, 탈락 후보는 중복·기간초과·가족적합성 부족·수치비공개 등의 사유를 남긴다.
