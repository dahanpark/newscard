const grid = document.querySelector('#trip-grid');
const template = document.querySelector('#trip-template');
const status = document.querySelector('#status');
const methodNote = document.querySelector('#method-note');
const checkedAt = document.querySelector('#checked-at');
const filters = [...document.querySelectorAll('.filter')];

const colors = ['#5b7cfa', '#ff6b35', '#9370db', '#008c72', '#e4417d', '#d98600'];
let trips = [];

const number = new Intl.NumberFormat('ko-KR');

function buildCard(trip, index) {
  const card = template.content.firstElementChild.cloneNode(true);
  const link = card.querySelector('.trip-card__link');
  const image = card.querySelector('.trip-card__image');

  card.dataset.size = trip.size;
  card.dataset.category = trip.category;
  card.style.setProperty('--card-color', colors[index % colors.length]);
  link.href = trip.url;
  link.setAttribute('aria-label', `${trip.rank}위 ${trip.title}, 인스타그램 원문 열기`);
  image.src = trip.image;
  image.alt = trip.alt;
  image.addEventListener('error', () => image.remove());

  card.querySelector('.trip-card__rank').textContent = String(trip.rank).padStart(2, '0');
  card.querySelector('.trip-card__likes').textContent = `♥ ${number.format(trip.likes)}`;
  card.querySelector('.trip-card__meta').textContent = `${trip.region} · ${trip.category}`;
  card.querySelector('.trip-card__title').textContent = trip.title;
  card.querySelector('.trip-card__summary').textContent = trip.summary;
  card.querySelector('.trip-card__caution').textContent = trip.caution;
  return card;
}

function applyFilter(category) {
  document.querySelectorAll('.trip-card').forEach((card) => {
    card.hidden = category !== '전체' && card.dataset.category !== category;
  });
  filters.forEach((button) => {
    const active = button.dataset.filter === category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const visible = category === '전체' ? trips.length : trips.filter((trip) => trip.category === category).length;
  status.textContent = `${category} ${visible}곳 표시 중`;
}

async function render() {
  try {
    const response = await fetch('trips.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    trips = data.items;
    methodNote.textContent = data.method;
    checkedAt.dateTime = data.checkedAt;
    checkedAt.textContent = `확인 ${new Date(data.checkedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' })}`;
    const fragment = document.createDocumentFragment();
    trips.forEach((trip, index) => fragment.append(buildCard(trip, index)));
    grid.replaceChildren(fragment);
    grid.setAttribute('aria-busy', 'false');
    applyFilter('전체');
  } catch (error) {
    grid.setAttribute('aria-busy', 'false');
    status.textContent = '여행 목록을 불러오지 못했습니다.';
    console.error(error);
  }
}

filters.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
render();
