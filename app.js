const status = document.querySelector('#status');
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.trip-card')];

function applyFilter(category) {
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
  status.textContent = `${category} ${visible}곳 표시 중`;
}

filters.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
applyFilter('전체');
