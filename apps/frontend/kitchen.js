// ========================================
// СОСТОЯНИЕ КУХНИ
// ========================================

let kitchenOpen = true;


// ========================================
// ЗАКАЗЫ И ИСТОРИЯ
// ========================================

let orders = [];
let history = [];


// ========================================
// DOM
// ========================================

const tabs =
  document.querySelectorAll(".tab");

const newOrders =
  document.getElementById("newOrders");

const processOrders =
  document.getElementById("processOrders");

const readyOrders =
  document.getElementById("readyOrders");

const historyOrders =
  document.getElementById("historyOrders");

const pageTitle =
  document.getElementById("pageTitle");

const pageDescription =
  document.getElementById("pageDescription");

const visibleCount =
  document.getElementById("visibleCount");

const newCount =
  document.getElementById("newCount");

const processCount =
  document.getElementById("processCount");

const readyCount =
  document.getElementById("readyCount");

const historyCount =
  document.getElementById("historyCount");

const allOrders =
  document.getElementById("allOrders");

const rightProcessCount =
  document.getElementById("rightProcessCount");

const averageTime =
  document.getElementById("averageTime");

const lastUpdate =
  document.getElementById("lastUpdate");


// ========================================
// ТЕКУЩАЯ ВКЛАДКА
// ========================================

let currentTab = "new";


// ========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ========================================

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(item => {
      item.classList.remove("active");
    });

    tab.classList.add("active");

    currentTab =
      tab.dataset.tab;

    showTab();

  });

});


// ========================================
// ПОКАЗ ВКЛАДКИ
// ========================================

function showTab() {

  newOrders.classList.remove("active-list");
  processOrders.classList.remove("active-list");
  readyOrders.classList.remove("active-list");
  historyOrders.classList.remove("active-list");

  if (currentTab === "new") {

    newOrders.classList.add("active-list");

    pageTitle.textContent =
      "Новые заказы";

    pageDescription.textContent =
      "Заказы ожидают приготовления";

    renderNewOrders();

  }

  if (currentTab === "process") {

    processOrders.classList.add("active-list");

    pageTitle.textContent =
      "В процессе";

    pageDescription.textContent =
      "Заказы, которые сейчас готовятся";

    renderProcessOrders();

  }

  if (currentTab === "ready") {

    readyOrders.classList.add("active-list");

    pageTitle.textContent =
      "Готовые заказы";

    pageDescription.textContent =
      "Заказы готовы к выдаче";

    renderReadyOrders();

  }

  if (currentTab === "history") {

    historyOrders.classList.add("active-list");

    pageTitle.textContent =
      "История заказов";

    pageDescription.textContent =
      "Завершённые заказы";

    renderHistory();

  }

  updateCounters();

}


// ========================================
// НАЧАТЬ ЗАКАЗ
// ========================================

function startOrder(button) {
  const card = button.closest(".order-card");
  const id = card.dataset.id;

  fetch('/v1/orders/' + id + '/status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'progress' })
  })
  .then(() => fetchBackendOrders());
}


// ========================================
// ЗАВЕРШИТЬ ЗАКАЗ
// ========================================

function finishOrder(button) {
  const card = button.closest(".order-card");
  const id = card.dataset.id;

  fetch('/v1/orders/' + id + '/status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'ready' })
  })
  .then(() => fetchBackendOrders());
}


// ========================================
// ПЕРЕДАТЬ ОФИЦИАНТУ
// ========================================

function completeOrder(button) {
  const card = button.closest(".order-card");
  const id = card.dataset.id;

  fetch('/v1/orders/' + id + '/status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'completed' })
  })
  .then(() => fetchBackendOrders());
}


// ========================================
// РЕНДЕР НОВЫХ
// ========================================

function renderNewOrders() {

  const list =
    orders.filter(order =>
      order.status === "new"
    );

  visibleCount.textContent =
    list.length;

  if (list.length === 0) {

    newOrders.innerHTML =
      createEmptyState(
        "🔴",
        "Нет новых заказов",
        "Новые заказы появятся здесь"
      );

    return;
  }

  newOrders.innerHTML =
    list.map(order =>
      createOrderHTML(
        order,
        "start"
      )
    ).join("");

}


// ========================================
// РЕНДЕР ПРОЦЕССА
// ========================================

function renderProcessOrders() {

  const list =
    orders.filter(order =>
      order.status === "process"
    );

  visibleCount.textContent =
    list.length;

  if (list.length === 0) {

    processOrders.innerHTML =
      createEmptyState(
        "🍳",
        "Нет заказов в процессе",
        "Здесь появятся заказы, которые вы начали готовить"
      );

    return;
  }

  processOrders.innerHTML =
    list.map(order =>
      createOrderHTML(
        order,
        "finish"
      )
    ).join("");

}


// ========================================
// РЕНДЕР ГОТОВЫХ
// ========================================

function renderReadyOrders() {

  const list =
    orders.filter(order =>
      order.status === "ready"
    );

  visibleCount.textContent =
    list.length;

  if (list.length === 0) {

    readyOrders.innerHTML =
      createEmptyState(
        "✅",
        "Нет готовых заказов",
        "После приготовления заказы появятся здесь"
      );

    return;
  }

  readyOrders.innerHTML =
    list.map(order =>
      createOrderHTML(
        order,
        "complete"
      )
    ).join("");

}


// ========================================
// КАРТОЧКА
// ========================================

function createOrderHTML(
  order,
  action
) {

  const elapsed =
    getCookingTime(order);

  const timerClass =
    getTimerClass(elapsed);


  let button = "";


  if (action === "start") {

    button = `
      <button
        class="start-btn"
        onclick="startOrder(this)"
      >
        Начать
      </button>
    `;

  }


  if (action === "finish") {

    button = `
      <button
        class="start-btn"
        onclick="finishOrder(this)"
      >
        Готово
      </button>
    `;

  }


  if (action === "complete") {

    button = `
      <button
        class="start-btn"
        onclick="completeOrder(this)"
      >
        Выдать
      </button>
    `;

  }


  return `

    <article
      class="order-card ${timerClass.card}"
      data-id="${order.id}"
    >

      <div class="order-card-header">

        <div>

          <span class="order-label">
            ${getOrderLabel(order)}
          </span>

          <h2>
            Стол ${order.table}
          </h2>

        </div>

        <div class="order-meta">

          <span class="order-time">
            ${formatTime(order.createdAt)}
          </span>

          <div
            class="order-timer ${timerClass.timer}"
          >
            ⏱
            <span class="timer-value">
              ${formatDuration(elapsed)}
            </span>
          </div>

        </div>

      </div>


      <div class="order-products">
        ${(order.items || []).map(item => `
          <div>
            <span>${item.qty} ×</span>
            ${item.name}
          </div>
        `).join("")}
      </div>


      ${order.comment ? `
        <div class="order-comment">
          💬
          <strong>Комментарий:</strong>
          ${order.comment}
        </div>
      ` : ""}


      <div class="order-footer">

        ${button}

      </div>

    </article>

  `;

}


// ========================================
// НАЗВАНИЕ СТАТУСА
// ========================================

function getOrderLabel(order) {

  if (order.status === "new")
    return `Новый заказ #${order.number}`;

  if (order.status === "process")
    return `Готовится #${order.number}`;

  if (order.status === "ready")
    return `Готов #${order.number}`;

  return `Заказ #${order.number}`;

}


// ========================================
// ПУСТОЕ СОСТОЯНИЕ
// ========================================

function createEmptyState(
  icon,
  title,
  description
) {

  return `

    <div class="empty-state">

      <div class="empty-icon">
        ${icon}
      </div>

      <h3>
        ${title}
      </h3>

      <p>
        ${description}
      </p>

    </div>

  `;

}


// ========================================
// ТАЙМЕР
// ========================================

function getCookingTime(order) {

  const start =
    order.startedAt ||
    order.createdAt;

  const end =
    order.finishedAt ||
    new Date();

  return Math.floor(
    (end - start) / 1000
  );

}


// ========================================
// ФОРМАТ ТАЙМЕРА
// ========================================

function formatDuration(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0")
    +
    ":"
    +
    String(secs).padStart(2, "0")
  );

}


// ========================================
// ЦВЕТ ТАЙМЕРА
// ========================================

function getTimerClass(seconds) {

  if (seconds >= 600) {

    return {
      card: "timer-danger",
      timer: "danger"
    };

  }

  if (seconds >= 300) {

    return {
      card: "timer-warning",
      timer: "warning"
    };

  }

  return {
    card: "",
    timer: ""
  };

}


// ========================================
// ИСТОРИЯ
// ========================================

function renderHistory() {

  visibleCount.textContent =
    history.length;


  if (history.length === 0) {

    historyOrders.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📋
        </div>

        <h3>
          История пока пустая
        </h3>

        <p>
          Завершённые заказы появятся здесь
        </p>

      </div>

    `;

    return;
  }


  historyOrders.innerHTML = `

    <div class="history-header">

      <div>

        <h2>
          История заказов
        </h2>

        <p>
          Завершённые заказы
        </p>

      </div>

    </div>


    <div class="history-list">

      ${history.map(order => `

        <div class="history-item">

          <strong>
            Заказ #${order.number || order.id}
          </strong>

          <span>
            Стол ${order.table}
          </span>

          <span>
            ${formatTime(order.completedAt)}
          </span>

          <b>
            ⏱ ${formatDuration(order.duration)}
          </b>

        </div>

      `).join("")}

    </div>

  `;

}


// ========================================
// СЧЁТЧИКИ
// ========================================

function updateCounters() {

  const newOrdersCount =
    orders.filter(
      order => order.status === "new"
    ).length;

  const processOrdersCount =
    orders.filter(
      order => order.status === "process"
    ).length;

  const readyOrdersCount =
    orders.filter(
      order => order.status === "ready"
    ).length;


  newCount.textContent =
    newOrdersCount;

  processCount.textContent =
    processOrdersCount;

  readyCount.textContent =
    readyOrdersCount;

  historyCount.textContent =
    history.length;

  rightProcessCount.textContent =
    processOrdersCount;

  allOrders.textContent =
    orders.length + history.length;


  calculateAverageTime();

}


// ========================================
// СРЕДНЕЕ ВРЕМЯ
// ========================================

function calculateAverageTime() {

  if (history.length === 0) {

    averageTime.textContent =
      "—";

    return;
  }


  const total =
    history.reduce(
      (sum, order) =>
        sum + order.duration,
      0
    );


  const average =
    Math.floor(
      total / history.length
    );


  averageTime.textContent =
    formatDuration(average);

}


// ========================================
// ОБНОВЛЕНИЕ ТАЙМЕРОВ
// ========================================

setInterval(() => {

  document
    .querySelectorAll(".order-card")
    .forEach(card => {

      const id =
        card.dataset.id;

      const order =
        orders.find(
          order => order.id === id
        );

      if (!order) return;


      const timer =
        card.querySelector(
          ".timer-value"
        );

      if (!timer) return;


      const seconds =
        getCookingTime(order);


      timer.textContent =
        formatDuration(seconds);

    });


  updateTimerColors();

}, 1000);


// ========================================
// ЦВЕТ ТАЙМЕРОВ
// ========================================

function updateTimerColors() {

  document
    .querySelectorAll(".order-card")
    .forEach(card => {

      const id =
        card.dataset.id;

      const order =
        orders.find(
          order => order.id === id
        );

      if (!order) return;


      const seconds =
        getCookingTime(order);

      const timer =
        card.querySelector(
          ".order-timer"
        );


      card.classList.remove(
        "timer-warning",
        "timer-danger"
      );

      timer.classList.remove(
        "warning",
        "danger"
      );


      if (seconds >= 600) {

        card.classList.add(
          "timer-danger"
        );

        timer.classList.add(
          "danger"
        );

      }

      else if (seconds >= 300) {

        card.classList.add(
          "timer-warning"
        );

        timer.classList.add(
          "warning"
        );

      }

    });

}


// ========================================
// КУХНЯ РАБОТАЕТ / ЗАКРЫТА
// ========================================

const kitchenToggle =
  document.getElementById(
    "kitchenToggle"
  );

const kitchenStatus =
  document.getElementById(
    "kitchenStatus"
  );


kitchenToggle.addEventListener(
  "click",
  () => {

    kitchenOpen =
      !kitchenOpen;


    if (kitchenOpen) {

      kitchenStatus.textContent =
        "Кухня работает";

      kitchenToggle.classList.remove(
        "closed"
      );

    }

    else {

      kitchenStatus.textContent =
        "Кухня закрыта";

      kitchenToggle.classList.add(
        "closed"
      );

    }

  }
);


// ========================================
// ВРЕМЯ
// ========================================

function formatTime(date) {

  return date.toLocaleTimeString(
    "ru-RU",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// ========================================
// ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ
// ========================================

function updateLastUpdate() {

  lastUpdate.textContent =
    formatTime(new Date());

}


// ========================================
// ЗАПУСК И ПОДКЛЮЧЕНИЕ К БЭКЕНДУ
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
        status: o.status === 'progress' ? 'process' : o.status,
        createdAt: new Date(o.createdAt),
        startedAt: o.sentTime ? new Date(o.createdAt) : null,
        finishedAt: o.readyTime ? new Date(o.createdAt) : null,
        items: o.items || [],
        comment: o.comment || ""
      }));
      
      history = allList.filter(o => o.status === 'completed').map(o => ({
        id: o.id,
        table: o.table,
        number: o.number,
        status: 'completed',
        createdAt: new Date(o.createdAt),
        startedAt: new Date(o.createdAt),
        finishedAt: new Date(o.createdAt),
        completedAt: new Date(o.createdAt),
        duration: 10,
        items: o.items || []
      }));
      
      showTab();
      updateLastUpdate();
    })
    .catch(err => console.error('Error fetching orders:', err));
}

fetchBackendOrders();
setInterval(fetchBackendOrders, 3000);