(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeButton = $('.theme-toggle');
  function setTheme(night) {
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    themeButton.setAttribute('aria-pressed', String(night));
    themeButton.setAttribute('aria-label', night ? 'Включить дневной режим' : 'Включить ночной режим');
    $('meta[name="theme-color"]').content = night ? '#232820' : '#f4f0e5';
    try { localStorage.setItem('osc-theme', night ? 'night' : 'day'); } catch {}
  }
  let savedTheme = 'day';
  try { savedTheme = localStorage.getItem('osc-theme') || 'day'; } catch {}
  setTheme(savedTheme === 'night');
  themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme !== 'night'));

  const mobileButton = $('.mobile-toggle');
  const mobileNav = $('#mobile-nav');
  function closeNavigation() {
    mobileNav.hidden = true;
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', 'Открыть меню');
  }
  mobileButton.addEventListener('click', () => {
    const expanded = mobileButton.getAttribute('aria-expanded') === 'true';
    mobileNav.hidden = expanded;
    mobileButton.setAttribute('aria-expanded', String(!expanded));
    mobileButton.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  });
  $$('a', mobileNav).forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNavigation(); });
  window.matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) closeNavigation(); });

  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    $$('.drink-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter);
      if (!card.hidden) card.classList.add('is-visible');
    });
  }));

  const drinks = {
    cappuccino: { title: 'Капучино', eyebrow: 'ДЛЯ ХОРОШЕГО НАЧАЛА', description: 'Знакомое сочетание эспрессо и молока с нежной пеной. Для неспешного утра, короткой паузы и всех тех «мне как обычно».', notes: ['Сливочный', 'Мягкий', 'Классика'], image: 'photo-cappuccino' },
    iced: { title: 'Айс-латте', eyebrow: 'ПРОХЛАДА В ТВОЁМ РИТМЕ', description: 'Эспрессо, молоко и лёд. Лёгкий повод выйти на прогулку и взять с собой немного кофейного настроения.', notes: ['Со льдом', 'Молочный', 'Освежающий'], image: 'photo-iced' },
    tea: { title: 'Облепиховый чай', eyebrow: 'МОЖНО ПРОСТО ЗАМЕДЛИТЬСЯ', description: 'Яркий ягодный вкус и золотистое настроение. Когда вместо кофе хочется чего-то согревающего — и ещё немного побыть в моменте.', notes: ['Ягодный', 'Согревающий', 'Без кофе'], image: 'photo-tea' }
  };
  const drinkDialog = $('#drink-dialog');
  function openDrink(id) {
    const drink = drinks[id];
    if (!drink) return;
    $('#dialog-title').textContent = drink.title;
    $('#dialog-eyebrow').textContent = drink.eyebrow;
    $('#dialog-description').textContent = drink.description;
    $('#dialog-image').className = `dialog-image ${drink.image}`;
    $('#dialog-image').setAttribute('aria-label', `Концептуальная иллюстрация: ${drink.title}`);
    $('#taste-notes').replaceChildren(...drink.notes.map(note => {
      const item = document.createElement('span'); item.textContent = note; return item;
    }));
    drinkDialog.setAttribute('aria-labelledby', 'dialog-title');
    drinkDialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('[data-drink]').forEach(button => button.addEventListener('click', () => openDrink(button.dataset.drink)));
  $$('[data-mood]').forEach(button => button.addEventListener('click', () => openDrink(button.dataset.mood)));
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $('[data-close-dialog]').addEventListener('click', () => drinkDialog.close());
  $('[data-open-concept]').addEventListener('click', () => {
    $('#concept-dialog').showModal(); document.body.classList.add('modal-open');
  });

  const locations = [
    { address: 'Петровская, 89', description: 'За кофе перед прогулкой по парку. Или после.', id: '100825558480', coords: '47.217664,38.925439', x: 48, y: 44 },
    { address: 'Петровская, 9/11', description: 'Любимый напиток и прогулка по старому Таганрогу.', id: '170881226404', coords: '47.206653,38.942165', x: 60, y: 55 },
    { address: 'Чехова, 223', description: 'Кофейная остановка у «Мармелада» — в любое время.', id: '97911200663', coords: '47.217131,38.901076', x: 31, y: 32 },
    { address: 'Инструментальная, 15А', description: 'Забери свой напиток по дороге в Приморский парк.', id: '70154552394', coords: '47.202515,38.896204', x: 36, y: 60 }
  ];
  $$('.location').forEach(button => button.addEventListener('click', () => {
    const item = locations[Number(button.dataset.location)];
    $$('.location').forEach(other => {
      other.classList.toggle('active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });
    $('#selected-address').textContent = item.address;
    $('#selected-description').textContent = item.description;
    const url = `https://yandex.ru/maps/org/old_school_coffee/${item.id}/`;
    $('#route-link').href = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(item.coords)}&rtt=pd`;
    $('#route-link').setAttribute('aria-label', `Построить маршрут: ${item.address}`);
    $('#map-link').href = url;
    $('.map-pin').style.left = `${item.x}%`;
    $('.map-pin').style.top = `${item.y}%`;
  }));

  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    $$('.reveal').forEach(element => observer.observe(element));
  }
})();
