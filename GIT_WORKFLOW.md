# 📋 Git Workflow — Команда cashOS

## 🌿 Структура веток

| Ветка | Разработчик | Задача |
|---|---|---|
| `main` | — | 🔒 Защищённая. Только через Pull Request |
| `feature/pos-ofd` | **Тимлид** | Интеграция с ОФД (фискализация чеков) |
| `feature/kaspi-sync` | **Тимлид** | Синхронизация с Kaspi Pay |
| `feature/wms-products` | **Разработчик 2** | Каталог товаров WMS |
| `feature/crm` | **Разработчик 2** | CRM модуль |
| `feature/csharp-wms-service` | **Разработчик 3** | C# WMS сервис (.NET 8) |

---

## 🚀 Ежедневный workflow (для каждого разработчика)

### 1️⃣ Начало рабочего дня — подтянуть свежий main

```bash
git checkout main
git pull origin main
```

### 2️⃣ Переключиться на свою ветку

```bash
# Тимлид
git checkout feature/pos-ofd
# или
git checkout feature/kaspi-sync

# Разработчик 2
git checkout feature/wms-products
# или
git checkout feature/crm

# Разработчик 3
git checkout feature/csharp-wms-service
```

### 3️⃣ Работа + коммиты

```bash
git add .
git commit -m "feat: описание что сделано"
git push
```

> **Формат коммитов (Conventional Commits):**
> - `feat:` — новая функция
> - `fix:` — исправление бага
> - `refactor:` — рефакторинг без изменения поведения
> - `docs:` — изменения в документации
> - `chore:` — прочее (обновление зависимостей и т.д.)

### 4️⃣ Задача готова → создать Pull Request

1. Открыть: https://github.com/FLEXIBLEfarab/cashOS/pulls
2. Нажать **"New pull request"**
3. Выбрать: **Base:** `main` ← **Compare:** `feature/твоя-ветка`
4. Описать что сделано → **"Create pull request"**
5. Тимлид делает Code Review → **Merge**

---

## ⚠️ Правила (ОБЯЗАТЕЛЬНО)

1. **НИКОГДА не пушить напрямую в `main`** — только через PR
2. **Перед началом задачи** — всегда `git pull origin main`
3. **Один PR = одна задача** — не мешать несвязанные изменения
4. **Конфликт слияния?** — решать в своей ветке, не в main:
   ```bash
   git checkout feature/моя-ветка
   git merge main        # подтянуть изменения из main в свою ветку
   # решить конфликты в редакторе
   git add .
   git commit -m "chore: resolve merge conflicts"
   git push
   ```

---

## 🔒 Защита ветки main (настройка на GitHub)

Путь: **Settings → Branches → Add rule**

| Настройка | Значение |
|---|---|
| Branch name pattern | `main` |
| ✅ Require a pull request before merging | Включить |
| ✅ Require approvals | 1 |
| ✅ Do not allow bypassing | Включить |

Ссылка: https://github.com/FLEXIBLEfarab/cashOS/settings/branches

---

## 🆘 Частые ситуации

### Случайно закоммитил в main?
```bash
git checkout -b feature/моя-ветка   # создать ветку с изменениями
git push -u origin feature/моя-ветка
git checkout main
git reset --hard origin/main        # откатить main
```

### Нужна новая ветка под новую задачу?
```bash
git checkout main
git pull origin main
git checkout -b feature/новая-задача
git push -u origin feature/новая-задача
```

### Посмотреть все ветки?
```bash
git branch -a
```
