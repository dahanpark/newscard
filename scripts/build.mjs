import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'trips.json');
const indexPath = path.join(root, 'index.html');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let html = fs.readFileSync(indexPath, 'utf8');
const number = new Intl.NumberFormat('ko-KR');
const colors = ['#5b7cfa', '#ff6b35', '#9370db', '#008c72', '#e4417d', '#d98600'];

function escape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function replaceBlock(source, name, content) {
  const pattern = new RegExp(`(<!-- ${name}_START -->)[\\s\\S]*?(<!-- ${name}_END -->)`);
  if (!pattern.test(source)) throw new Error(`${name} 빌드 마커가 index.html에 없습니다.`);
  return source.replace(pattern, `$1${content}$2`);
}

function renderCard(trip, index) {
  const area = trip.scope ?? (/서울/.test(trip.region) ? 'seoul' : /(경기|인천)/.test(trip.region) ? 'near-seoul' : 'national');
  const scope = ['seoul', 'near-seoul'].includes(area) ? 'seoul-metro' : 'national';
  return `
      <article class="trip-card" data-size="${escape(trip.size)}" data-category="${escape(trip.category)}" data-scope="${scope}" data-area="${area}" style="--card-color: ${colors[index % colors.length]}">
        <a class="trip-card__link" href="${escape(trip.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(`${trip.rank}위 ${trip.title}, 인스타그램 원문 열기`)}">
          <img class="trip-card__image" src="${escape(trip.image)}" alt="${escape(trip.alt)}" loading="eager" decoding="async">
          <div class="trip-card__wash"></div>
          <div class="trip-card__topline">
            <span class="trip-card__rank">${String(trip.rank).padStart(2, '0')}</span>
            <span class="trip-card__likes">반응 ${number.format(trip.engagementScore)}</span>
          </div>
          <div class="trip-card__body">
            <p class="trip-card__meta">${escape(trip.account)} · ${escape(trip.region)} · ${escape(trip.category)}${trip.sponsored ? ' · 광고/지원' : ''}</p>
            <h2 class="trip-card__title">${escape(trip.title)}</h2>
            <p class="trip-card__summary">${escape(trip.summary)}</p>
            <p class="trip-card__caution">${escape(trip.caution)}</p>
            <span class="trip-card__cta">인스타그램에서 보기 ↗</span>
          </div>
        </a>
      </article>`;
}

const checkedAt = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(data.checkedAt));

html = replaceBlock(html, 'METHOD', escape(data.method));
html = replaceBlock(html, 'CHECKED_AT', `확인 ${escape(checkedAt)}`);
html = replaceBlock(html, 'TRIP_CARDS', `\n${data.items.map(renderCard).join('\n')}\n      `);
fs.writeFileSync(indexPath, html);
console.log(`index.html 생성 완료: 카드 ${data.items.length}개`);
