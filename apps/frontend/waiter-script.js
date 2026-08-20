// ========================================
// ДАННЫЕ ЗАКАЗОВ
// ========================================

let orders = [];
let orderHistory = [];


// ========================================
// РУЧНОЙ СТАТУС СТОЛА
// ========================================

const manualTableStatus = {
  9: 'bill'
};


// ========================================
// ВЫРУЧКА
// ========================================

let todayRevenue = 86400;


// ========================================
// СОСТОЯНИЕ
// ========================================

let activeTab = 'all';

let activeTableFilter = null;

let searchQuery = '';

let currentView = 'orders';


// ========================================
// ЭЛЕМЕНТЫ
// ========================================

const board =
  document.getElementById('board');

const tabs =
  document.getElementById('tabs');

const tablesGrid =
  document.getElementById('tablesGrid');

const clearFilterBtn =
  document.getElementById('clearFilterBtn');

const filterTableLabel =
  document.getElementById('filterTableLabel');

const searchInput =
  document.getElementById('searchInput');

const toast =
  document.getElementById('toast');

const homeView =
  document.getElementById('homeView');

const boardArea =
  document.querySelector('.board-area');

const tablesPanel =
  document.querySelector('.tables-panel');

const boardHeader =
  document.querySelector('.board-header');


const columns = {

  new:
    document.getElementById('colNew'),

  progress:
    document.getElementById('colProgress'),

  ready:
    document.getElementById('colReady')

};


const columnLabels = {

  new: 'Новый заказ',

  progress: 'В работе',

  ready: 'Готов'

};


// ========================================
// ТЕКУЩЕЕ ВРЕМЯ
// ========================================

function nowTime() {

  const d = new Date();

  const h =
    String(d.getHours())
      .padStart(2, '0');

  const m =
    String(d.getMinutes())
      .padStart(2, '0');

  return `${h}:${m}`;

}


// ========================================
// TOAST
// ========================================

function showToast(text) {

  if (!toast) return;

  toast.textContent = text;

  toast.classList.add('show');

  clearTimeout(showToast._t);

  showToast._t =
    setTimeout(() => {

      toast.classList.remove('show');

    }, 2200);

}


// ========================================
// КАРТОЧКА ЗАКАЗА
// ========================================

function createOrderCard(order) {

  const card =
    document.createElement('article');

  card.className =
    `order-card status-${order.status}`;

  card.dataset.id =
    order.id;


  const itemsHtml =
    order.items
      .map(item =>
        `<li>${item.qty} × ${item.name}</li>`
      )
      .join('');


  let metaHtml = '';


  if (
    order.status === 'progress' &&
    order.sentTime
  ) {

    metaHtml = `

      <div class="card-meta">

        <span>
          Отправлен на кухню
        </span>

        <span>
          ${order.sentTime}
        </span>

      </div>

    `;

  }


  if (
    order.status === 'ready' &&
    order.readyTime
  ) {

    metaHtml = `

      <div class="card-meta">

        <span>
          Готов к подаче
        </span>

        <span>
          ${order.readyTime}
        </span>

      </div>

    `;

  }


  const commentHtml =
    order.comment
      ? `
        <p class="card-comment">
          Комментарий: ${order.comment}
        </p>
      `
      : '';


  let actionsHtml = '';


  if (order.status === 'new') {

    actionsHtml = `

      <div class="card-actions">

        <button
          class="btn-primary"
          data-action="accept"
        >
          Принять
        </button>

        <button
          class="btn-secondary"
          data-action="details"
        >
          Подробнее
        </button>

      </div>

    `;

  }


  if (order.status === 'progress') {

    actionsHtml = `

      <div class="card-actions">

        <button
          class="btn-secondary"
          data-action="details"
          style="flex:1"
        >
          Подробнее
        </button>

      </div>

    `;

  }


  if (order.status === 'ready') {

    actionsHtml = `

      <div class="card-actions">

        <button
          class="btn-primary serve"
          data-action="serve"
        >
          Подать
        </button>

        <button
          class="btn-secondary"
          data-action="details"
        >
          Подробнее
        </button>

      </div>

    `;

  }


  card.innerHTML = `

    <div class="card-top">

      <span class="card-label">
        ${columnLabels[order.status]}
      </span>

      <span class="card-time">
        ${order.time}
      </span>

    </div>


    <h3>
      Стол ${order.table}
    </h3>


    <ul class="card-items">
      ${itemsHtml}
    </ul>


    ${commentHtml}

    ${metaHtml}


    <div class="card-extra">

      Заказ №${order.number || order.id}
      · стол ${order.table}
      · ${order.total.toLocaleString('ru-RU')} ₸

    </div>


    ${actionsHtml}

  `;


  // ========================================
  // КНОПКИ
  // ========================================

  const acceptBtn =
    card.querySelector(
      '[data-action="accept"]'
    );


  const serveBtn =
    card.querySelector(
      '[data-action="serve"]'
    );


  const detailsBtn =
    card.querySelector(
      '[data-action="details"]'
    );


  // ========================================
  // ПРИНЯТЬ
  // ========================================

  if (acceptBtn) {

    acceptBtn.addEventListener(
      'click',
      () => {
        fetch('/v1/orders/' + order.id + '/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'progress' })
        })
        .then(() => {
          showToast(`Заказ принят · стол ${order.table}`);
          fetchBackendOrders();
        })
        .catch(err => console.error('Error accepting:', err));
      }
    );

  }


  // ========================================
  // ПОДАТЬ
  // ========================================

  if (serveBtn) {

    serveBtn.addEventListener(
      'click',
      () => {
        fetch('/v1/orders/' + order.id + '/status', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' })
        })
        .then(() => {
          showToast(`Заказ подан · стол ${order.table}`);
          fetchBackendOrders();
        })
        .catch(err => console.error('Error serving:', err));
      }
    );

  }


  // ========================================
  // ПОДРОБНЕЕ
  // ========================================

  if (detailsBtn) {

    detailsBtn.addEventListener(
      'click',
      () => {

        card.classList.toggle(
          'expanded'
        );

      }
    );

  }


  return card;

}


// ========================================
// ФИЛЬТРАЦИЯ
// ========================================

function matchesFilters(order) {

  if (
    activeTableFilter !== null &&
    order.table !== activeTableFilter
  ) {

    return false;

  }


  if (searchQuery) {

    const query =
      searchQuery.toLowerCase();


    const inTable =
      String(order.table)
        .includes(query);


    const inItems =
      order.items.some(
        item =>
          item.name
            .toLowerCase()
            .includes(query)
      );


    if (
      !inTable &&
      !inItems
    ) {

      return false;

    }

  }


  return true;

}


// ========================================
// ДОСКА ЗАКАЗОВ
// ========================================

function renderBoard() {

  ['new', 'progress', 'ready']
    .forEach(status => {

      const column =
        columns[status];


      if (!column) return;


      column.innerHTML = '';


      const filtered =
        orders
          .filter(
            order =>
              order.status === status
          )
          .filter(
            matchesFilters
          );


      if (
        filtered.length === 0
      ) {

        column.innerHTML =
          '<p class="empty-column">Заказов нет</p>';

      }

      else {

        filtered.forEach(
          order => {

            column.appendChild(
              createOrderCard(order)
            );

          }
        );

      }


      const colCount =
        document.getElementById(
          `colCount${capitalize(status)}`
        );


      if (colCount) {

        colCount.textContent =
          filtered.length;

      }


      const tabCount =
        document.getElementById(
          `tabCount${capitalize(status)}`
        );


      if (tabCount) {

        tabCount.textContent =
          orders.filter(
            order =>
              order.status === status
          ).length;

      }

    });


  if (!board) return;


  board.className =
    'board';


  if (
    activeTab !== 'all'
  ) {

    board.classList.add(
      `filter-${activeTab}`
    );

  }

}


function capitalize(value) {

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );

}


// ========================================
// СТАТУС СТОЛА
// ========================================

function getTableStatus(tableNumber) {

  const tableOrders =
    orders.filter(
      order =>
        order.table === tableNumber
    );


  if (
    tableOrders.some(
      order =>
        order.status === 'new'
    )
  ) {

    return 'order';

  }


  if (
    tableOrders.some(
      order =>
        order.status === 'progress' ||
        order.status === 'ready'
    )
  ) {

    return 'cooking';

  }


  if (
    manualTableStatus[tableNumber]
  ) {

    return manualTableStatus[
      tableNumber
    ];

  }


  return 'free';

}


// ========================================
// СТОЛЫ
// ========================================

function renderTables() {

  if (!tablesGrid) return;


  tablesGrid.innerHTML = '';


  for (
    let i = 1;
    i <= 12;
    i++
  ) {

    const status =
      getTableStatus(i);


    const btn =
      document.createElement('button');


    btn.className =
      `table-btn status-${status}`;


    btn.textContent =
      i;

    btn.type =
      'button';


    if (
      activeTableFilter === i
    ) {

      btn.classList.add(
        'selected'
      );

    }


    btn.addEventListener(
      'click',
      () => {

        if (
          activeTableFilter === i
        ) {

          activeTableFilter =
            null;

        }

        else {

          activeTableFilter =
            i;

        }


        if (
          currentView !== 'orders'
        ) {

          openOrders();

        }


        render();

      }
    );


    tablesGrid.appendChild(btn);

  }

}


// ========================================
// ФИЛЬТР
// ========================================

function renderFilterBadge() {

  if (!clearFilterBtn) return;


  if (
    activeTableFilter === null
  ) {

    clearFilterBtn.hidden =
      true;

  }

  else {

    clearFilterBtn.hidden =
      false;

    filterTableLabel.textContent =
      activeTableFilter;

  }

}


if (clearFilterBtn) {

  clearFilterBtn.addEventListener(
    'click',
    () => {

      activeTableFilter =
        null;

      render();

    }
  );

}


// ========================================
// ВКЛАДКИ ЗАКАЗОВ
// ========================================

if (tabs) {

  tabs
    .querySelectorAll('.tab')
    .forEach(tab => {

      tab.addEventListener(
        'click',
        () => {

          activeTab =
            tab.dataset.tab;


          tabs
            .querySelectorAll('.tab')
            .forEach(t =>
              t.classList.remove(
                'active'
              )
            );


          tab.classList.add(
            'active'
          );


          render();

        }
      );

    });

}


// ========================================
// ПОИСК
// ========================================

if (searchInput) {

  searchInput.addEventListener(
    'input',
    () => {

      searchQuery =
        searchInput.value.trim();


      render();

    }
  );

}


// ========================================
// ГЛАВНАЯ — ДАТА И ВРЕМЯ
// ========================================

function updateHomeDateTime() {

  const homeDate =
    document.getElementById(
      'homeDate'
    );


  const homeTime =
    document.getElementById(
      'homeTime'
    );


  if (
    !homeDate ||
    !homeTime
  ) {

    return;

  }


  const now =
    new Date();


  homeDate.textContent =
    now.toLocaleDateString(
      'ru-RU',
      {
        day: 'numeric',
        month: 'long'
      }
    );


  homeTime.textContent =
    now.toLocaleTimeString(
      'ru-RU',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

}


updateHomeDateTime();


setInterval(
  updateHomeDateTime,
  1000
);


// ========================================
// СТАТИСТИКА ГЛАВНОЙ
// ========================================

function renderHomeStats() {

  const busyTables =
    Array.from(
      { length: 12 },
      (_, index) =>
        getTableStatus(index + 1)
    )
    .filter(
      status =>
        status !== 'free'
    )
    .length;


  const activeOrders =
    orders.filter(
      order =>
        order.status === 'new' ||
        order.status === 'progress'
    ).length;


  const homeBusyTables =
    document.getElementById(
      'homeBusyTables'
    );


  const homeOrders =
    document.getElementById(
      'homeOrders'
    );


  const homeActiveOrders =
    document.getElementById(
      'homeActiveOrders'
    );


  const homeRevenue =
    document.getElementById(
      'homeRevenue'
    );


  if (homeBusyTables) {

    homeBusyTables.textContent =
      busyTables;

  }


  if (homeOrders) {

    homeOrders.textContent =
      orders.length +
      orderHistory.length;

  }


  if (homeActiveOrders) {

    homeActiveOrders.textContent =
      activeOrders;

  }


  if (homeRevenue) {

    homeRevenue.textContent =
      todayRevenue
        .toLocaleString('ru-RU') +
      ' ₸';

  }

}


// ========================================
// СТОЛЫ НА ГЛАВНОЙ
// ========================================

function renderHomeTables() {

  const container =
    document.getElementById(
      'homeTables'
    );


  if (!container) return;


  container.innerHTML = '';


  for (
    let i = 1;
    i <= 12;
    i++
  ) {

    const status =
      getTableStatus(i);


    let statusText =
      'Свободен';


    if (
      status === 'order'
    ) {

      statusText =
        'Есть заказ';

    }


    if (
      status === 'cooking'
    ) {

      statusText =
        'Готовится';

    }


    if (
      status === 'bill'
    ) {

      statusText =
        'Просит счёт';

    }


    const table =
      document.createElement('div');


    table.className =
      `home-table ${status}`;


    table.innerHTML = `

      <strong>
        ${i}
      </strong>

      <span>
        ${statusText}
      </span>

    `;


    table.addEventListener(
      'click',
      () => {

        activeTableFilter =
          i;


        openOrders();

        render();

      }
    );


    container.appendChild(
      table
    );

  }

}


// ========================================
// ОБЩАЯ ОТРИСОВКА ГЛАВНОЙ
// ========================================

function renderHome() {

  if (!homeView) return;


  renderHomeStats();

  renderHomeTables();

}


// ========================================
// ОТКРЫТЬ ГЛАВНУЮ
// ========================================

function openHome() {

  currentView =
    'home';


  if (homeView) {

    homeView.style.display =
      'block';

  }


  if (boardArea) {

    boardArea.style.display =
      'none';

  }


  if (tablesPanel) {

    tablesPanel.style.display =
      'none';

  }


  renderHome();

  updateHomeDateTime();

}


// ========================================
// ОТКРЫТЬ ЗАКАЗЫ
// ========================================

function openOrders() {

  currentView =
    'orders';


  if (homeView) {

    homeView.style.display =
      'none';

  }


  if (boardArea) {

    boardArea.style.display =
      '';

  }


  if (tablesPanel) {

    tablesPanel.style.display =
      '';

  }


  if (boardHeader) {

    boardHeader.style.display =
      '';

  }


  if (tabs) {

    tabs.style.display =
      '';

  }

}


// ========================================
// НАВИГАЦИЯ
// ========================================

document
  .querySelectorAll(
    '.nav-item[data-view]'
  )
  .forEach(item => {

    item.addEventListener(
      'click',
      event => {

        event.preventDefault();


        const view =
          item.dataset.view;


        document
          .querySelectorAll(
            '.nav-item[data-view]'
          )
          .forEach(nav =>
            nav.classList.remove(
              'active'
            )
          );


        item.classList.add(
          'active'
        );


        // ----------------------------
        // ГЛАВНАЯ
        // ----------------------------

        if (
          view === 'home'
        ) {

          openHome();

          return;

        }


        // ----------------------------
        // ЗАКАЗЫ
        // ----------------------------

        if (
          view === 'orders'
        ) {

          openOrders();

          return;

        }


        // ----------------------------
        // ОСТАЛЬНЫЕ
        // ----------------------------

        showToast(
          'Этот раздел скоро появится'
        );

      }
    );

  });


// ========================================
// БЫСТРЫЕ ДЕЙСТВИЯ
// ========================================

document
  .querySelectorAll(
    '.quick-action'
  )
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const action =
          button.dataset.action;


        const target =
          document.querySelector(
            `.nav-item[data-view="${action}"]`
          );


        if (target) {

          target.click();

        }

      }
    );

  });


// ========================================
// ВСЕ СТОЛЫ
// ========================================

const openTablesBtn =
  document.getElementById(
    'openTablesBtn'
  );


if (openTablesBtn) {

  openTablesBtn.addEventListener(
    'click',
    () => {

      const tables =
        document.querySelector(
          '.nav-item[data-view="tables"]'
        );


      if (tables) {

        tables.click();

      }

    }
  );

}


// ========================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ И РАБОТА С БЭКЕНДОМ
// ========================================

function fetchBackendOrders() {
  fetch('/v1/orders')
    .then(res => res.json())
    .then(res => {
      const allList = res.data || [];
      orders = allList.filter(o => o.status !== 'completed').map(o => ({
        id: o.id,
        table: o.table,
        number: o.number,
        time: o.time,
        status: o.status,
        total: o.total,
        comment: o.comment || "",
        items: (o.items || []).map(i => ({ name: i.name, qty: i.qty }))
      }));
      orderHistory = allList.filter(o => o.status === 'completed').map(o => ({
        id: o.number || o.id,
        table: o.table,
        total: o.total,
        time: o.time
      }));
      
      // Update statistics in Home View
      const busyTables = new Set(orders.map(o => o.table)).size;
      const busyTablesEl = document.getElementById('homeBusyTables');
      if (busyTablesEl) busyTablesEl.textContent = busyTables;
      
      // Today revenue
      const totalRevenue = orderHistory.reduce((sum, h) => sum + h.total, 86400); // 86400 is base mock revenue
      todayRevenue = totalRevenue;
      
      render();
    })
    .catch(err => console.error('Error fetching orders:', err));
}

function initialize() {

  // По умолчанию открываем Заказы

  openOrders();

  fetchBackendOrders();
  setInterval(fetchBackendOrders, 3000);

}


function render() {

  renderBoard();

  renderTables();

  renderFilterBadge();

  renderHome();

}


initialize();