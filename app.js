const grid = document.querySelector('#trip-grid');
const filterStatus = document.querySelector('#status');
const refreshStatus = document.querySelector('#refresh-status');
const refreshButton = document.querySelector('#refresh-button');
const checkedAt = document.querySelector('#checked-at');
const methodNote = document.querySelector('#method-note');
const filters = [...document.querySelectorAll('.filter')];
const colors = ['#5b7cfa', '#ff6b35', '#9370db', '#008c72', '#e4417d', '#d98600'];
const number = new Intl.NumberFormat('ko-KR');
const dateTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'medium',
  timeStyle: 'short'
});

let activeFilter = '전체';

function currentCards() {
  return [...document.querySelectorAll('.trip-card')];
}

function applyFilter(category) {
  activeFilter = category;
  const cards = currentCards();

  cards.forEach((card) => {
    const matches = category === '전체'
      || (category === '서울·근교' ? card.dataset.scope === 'seoul-metro' : card.dataset.category === category);
    card.hidden = !matches;
  });

  filters.forEach((button) => {
    const active = button.dataset.filter === category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const visible = cards.filter((card) => !card.hidden).length;
  filterStatus.textContent = `${category} ${visible}곳 표시 중`;
}

function addText(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function getArea(trip) {
  if (trip.scope) return trip.scope;
  if (/서울/.test(trip.region)) return 'seoul';
  if (/(경기|인천)/.test(trip.region)) return 'near-seoul';
  return 'national';
}

function safeInstagramUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'www.instagram.com') {
    throw new Error('허용되지 않은 원문 주소가 있습니다.');
  }
  return url.href;
}

function validateData(data) {
  if (!data || data.title !== '아빠 어디가~' || !Array.isArray(data.items) || data.items.length !== 30) {
    throw new Error('최신 데이터의 기본 구조가 올바르지 않습니다.');
  }

  data.items.forEach((trip, index) => {
    const required = ['rank', 'size', 'title', 'region', 'category', 'account', 'engagementScore', 'summary', 'caution', 'url', 'image', 'alt'];
    if (required.some((key) => trip[key] === undefined || trip[key] === '')) {
      throw new Error(`${index + 1}번 카드의 필수 정보가 비어 있습니다.`);
    }
    if (trip.rank !== index + 1 || trip.engagementScore !== trip.likes + trip.comments * 5) {
      throw new Error(`${index + 1}번 카드의 순위 또는 반응점수가 올바르지 않습니다.`);
    }
    safeInstagramUrl(trip.url);
    if (!/^assets\/\d{2}\.jpg$/.test(trip.image)) {
      throw new Error(`${index + 1}번 카드의 이미지 경로가 올바르지 않습니다.`);
    }
  });
}

function renderCard(trip, index, version) {
  const area = getArea(trip);
  const scope = ['seoul', 'near-seoul'].includes(area) ? 'seoul-metro' : 'national';
  const article = document.createElement('article');
  article.className = 'trip-card';
  article.dataset.size = trip.size;
  article.dataset.category = trip.category;
  article.dataset.scope = scope;
  article.dataset.area = area;
  article.style.setProperty('--card-color', colors[index % colors.length]);

  const link = document.createElement('a');
  link.className = 'trip-card__link';
  link.href = safeInstagramUrl(trip.url);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${trip.rank}위 ${trip.title}, 인스타그램 원문 열기`);

  const image = document.createElement('img');
  image.className = 'trip-card__image';
  image.src = `${trip.image}?v=${version}`;
  image.alt = trip.alt;
  image.loading = index < 6 ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => article.classList.add('image-failed'), { once: true });
  link.append(image);

  const wash = document.createElement('div');
  wash.className = 'trip-card__wash';
  link.append(wash);

  const topline = document.createElement('div');
  topline.className = 'trip-card__topline';
  addText(topline, 'span', 'trip-card__rank', String(trip.rank).padStart(2, '0'));
  addText(topline, 'span', 'trip-card__likes', `반응 ${number.format(trip.engagementScore)}`);
  link.append(topline);

  const body = document.createElement('div');
  body.className = 'trip-card__body';
  const sponsorLabel = trip.sponsored ? ' · 광고/지원' : '';
  addText(body, 'p', 'trip-card__meta', `${trip.account} · ${trip.region} · ${trip.category}${sponsorLabel}`);
  addText(body, 'h2', 'trip-card__title', trip.title);
  addText(body, 'p', 'trip-card__summary', trip.summary);
  addText(body, 'p', 'trip-card__caution', trip.caution);
  addText(body, 'span', 'trip-card__cta', '인스타그램에서 보기 ↗');
  link.append(body);
  article.append(link);
  return article;
}

function setRefreshState(message, state) {
  refreshStatus.textContent = message;
  refreshStatus.dataset.state = state;
}

async function refreshLatest() {
  setRefreshState('최신 자료 확인 중…', 'loading');
  refreshButton.disabled = true;

  try {
    const dataUrl = new URL('trips.json', document.baseURI);
    dataUrl.searchParams.set('fresh', Date.now().toString());
    const response = await fetch(dataUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`최신 데이터 요청 실패: ${response.status}`);

    const data = await response.json();
    validateData(data);
    const version = new Date(data.checkedAt).getTime();
    if (!Number.isFinite(version)) throw new Error('확인 시각이 올바르지 않습니다.');

    const fragment = document.createDocumentFragment();
    data.items.forEach((trip, index) => fragment.append(renderCard(trip, index, version)));
    grid.replaceChildren(fragment);
    methodNote.textContent = data.method;
    checkedAt.textContent = `확인 ${dateTime.format(new Date(data.checkedAt))}`;
    applyFilter(activeFilter);
    setRefreshState(`최신 자료 불러옴 · ${dateTime.format(new Date())}`, 'success');
  } catch (error) {
    const localFile = window.location.protocol === 'file:';
    setRefreshState(
      localFile ? '로컬 정적본 · 미리보기 서버에서 최신 자료 확인 가능' : '최신 자료 연결 실패 · 검증된 정적본 표시 중',
      'fallback'
    );
    console.warn('최신 자료를 불러오지 못해 정적 HTML을 유지합니다.', error);
  } finally {
    refreshButton.disabled = false;
  }
}

filters.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
refreshButton.addEventListener('click', refreshLatest);
applyFilter('전체');
refreshLatest();
