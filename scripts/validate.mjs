import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../trips.json', import.meta.url), 'utf8'));
const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
const roles = ['white', 'black', 'red', 'blue', 'silver', 'purple', 'purple2'];
const ids = new Set();

if (data.title !== '아빠 어디가~') errors.push('사이트 제목이 올바르지 않습니다.');
if (!Array.isArray(data.items) || data.items.length !== 30) errors.push('공개 표본 인기 30개가 필요합니다.');

data.items?.forEach((item, index) => {
  const at = `items[${index}]`;
  const required = ['rank', 'size', 'title', 'region', 'category', 'account', 'sourceType', 'likes', 'comments', 'engagementScore', 'published', 'summary', 'caution', 'url', 'image', 'alt'];
  required.forEach((key) => { if (item[key] === undefined || item[key] === '') errors.push(`${at}.${key}가 비어 있습니다.`); });
  if (item.rank !== index + 1) errors.push(`${at}.rank가 배열 순서와 다릅니다.`);
  if (item.engagementScore !== item.likes + item.comments * 5) errors.push(`${at}.engagementScore 계산이 잘못됐습니다.`);
  if (index > 0 && item.engagementScore > data.items[index - 1].engagementScore) errors.push(`${at}가 반응점수 내림차순이 아닙니다.`);
  if (!['hero', 'large', 'standard'].includes(item.size)) errors.push(`${at}.size가 잘못됐습니다.`);
  if (!/^https:\/\/www\.instagram\.com\//.test(item.url)) errors.push(`${at}.url은 인스타그램 HTTPS 원문이어야 합니다.`);
  if (!/^assets\/\d{2}\.jpg$/.test(item.image)) errors.push(`${at}.image는 로컬 미리보기 파일이어야 합니다.`);
  if (typeof item.sponsored !== 'boolean') errors.push(`${at}.sponsored는 boolean이어야 합니다.`);
  if (!fs.existsSync(new URL(`../${item.image}`, import.meta.url))) errors.push(`${at}.image 파일이 없습니다.`);
  if (ids.has(item.url)) errors.push(`${at}.url이 중복입니다.`);
  ids.add(item.url);
});

roles.forEach((role) => {
  const score = data.review?.[role];
  if (typeof score !== 'number' || score < 9.5 || score > 10) errors.push(`${role} 점수는 9.5–10이어야 합니다.`);
});

const staticCards = (indexHtml.match(/class="trip-card"/g) || []).length;
if (staticCards !== data.items.length) errors.push(`index.html 정적 카드가 ${staticCards}개이며 데이터 ${data.items.length}개와 다릅니다.`);
if (/<template\s+id="trip-template"/.test(indexHtml)) errors.push('index.html이 런타임 템플릿에 의존하고 있습니다.');
if (/id="trip-grid"[^>]*>\s*<!-- TRIP_CARDS_START -->\s*<!-- TRIP_CARDS_END -->/.test(indexHtml)) errors.push('index.html 모자이크가 비어 있습니다.');

if (errors.length) {
  console.error(`검증 실패 (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`검증 통과: 게시물 ${data.items.length}개, 7개 역할 모두 9.5 이상`);
