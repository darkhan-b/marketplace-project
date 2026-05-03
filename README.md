# Mini Marketplace API

Backend-сервис для мини-маркетплейса на NestJS.

Проект представляет собой упрощённую версию маркетплейса вроде OLX: пользователи могут регистрироваться, публиковать товары, просматривать чужие товары, добавлять их в корзину и избранное. Также в проекте есть роли пользователей и базовая авторизация через JWT.

## Стек

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Auth
- Passport JWT
- Argon2 для хеширования паролей
- Swagger для документации API

## Роли пользователей

В системе используются 3 роли:

```txt
USER
SELLER
ADMIN
```

### USER

Обычный пользователь.

Может:

- регистрироваться и логиниться;
- просматривать товары;
- просматривать категории;
- добавлять товары в корзину;
- добавлять товары в избранное;
- просматривать и обновлять свой профиль.

### SELLER

Продавец.

Может всё, что может `USER`, а также:

- создавать товары;
- обновлять свои товары;
- удалять свои товары.

### ADMIN

Администратор.

Может:

- управлять категориями;
- просматривать пользователей;
- менять роли пользователей;
- модерировать товары;
- удалять или обновлять любые товары.

## Основные сущности

### User

Пользователь системы.

Поля:

- `id`
- `email`
- `password`
- `name`
- `role`
- `createdAt`

### Product

Товар, который публикует пользователь.

Поля:

- `id`
- `title`
- `description`
- `price`
- `imageUrl`
- `createdAt`
- `userId`
- `categoryId`

### Category

Категория товара.

Поля:

- `id`
- `name`

### CartItem

Элемент корзины пользователя.

Поля:

- `id`
- `userId`
- `productId`
- `quantity`

### Favorite

Избранный товар пользователя.

Поля:

- `id`
- `userId`
- `productId`
- `createdAt`

## Требования

Перед запуском нужно установить:

- Node.js 22
- PostgreSQL
- npm
- nvm

Проект рассчитан на использование Node.js 22.

Перед установкой зависимостей и запуском проекта обязательно выполнить:

```bash
nvm use 22
```

Если Node.js 22 ещё не установлен:

```bash
nvm install 22
nvm use 22
```

Проверить версию Node.js:

```bash
node -v
```

Ожидаемая версия должна начинаться с:

```txt
v22
```

## Установка проекта

Клонировать проект:

```bash
git clone <repository-url>
cd mini-marketplace-api
```

Переключиться на Node.js 22:

```bash
nvm use 22
```

Установить зависимости:

```bash
npm install
```

## Настройка окружения

Создать файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/marketplace_db"
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="7d"
```

Если база данных ещё не создана, создай её в PostgreSQL:

```bash
createdb -U postgres marketplace_db
```

Или через `psql`:

```sql
CREATE DATABASE marketplace_db;
```

## Prisma

В проекте используется Prisma ORM.

После изменения `prisma/schema.prisma` нужно выполнять:

```bash
npx prisma migrate dev
npx prisma generate
```

Для первой миграции:

```bash
npx prisma migrate dev --name init
```

Если добавлялись роли:

```bash
npx prisma migrate dev --name add_user_roles
npx prisma generate
```

Если добавлялось избранное:

```bash
npx prisma migrate dev --name add_favorites
npx prisma generate
```

## Важный момент про Prisma 7

В Prisma 7 строка подключения больше не хранится внутри `schema.prisma`.

Поэтому используется файл:

```txt
prisma.config.ts
```

Пример:

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

Также для PostgreSQL в Prisma 7 используется adapter:

```ts
import { PrismaPg } from '@prisma/adapter-pg';
```

## Запуск проекта

Для разработки:

```bash
nvm use 22
npm run start:dev
```

Обычный запуск:

```bash
nvm use 22
npm run start
```

Production build:

```bash
nvm use 22
npm run build
npm run start:prod
```

После запуска API будет доступен по адресу:

```txt
http://localhost:3000
```

## Swagger

Swagger-документация доступна по адресу:

```txt
http://localhost:3000/api/docs
```

Через Swagger можно тестировать:

- регистрацию;
- логин;
- создание товаров;
- категории;
- корзину;
- избранное;
- роли пользователей.

Для защищённых endpoints нужно нажать кнопку `Authorize` и вставить JWT токен в формате:

```txt
Bearer <accessToken>
```

## Auth endpoints

### Регистрация

```http
POST /auth/register
```

Body:

```json
{
  "email": "user@mail.com",
  "password": "123456",
  "name": "User One"
}
```

### Логин

```http
POST /auth/login
```

Body:

```json
{
  "email": "user@mail.com",
  "password": "123456"
}
```

В ответе возвращается `accessToken`.

## Users endpoints

```txt
GET    /users/me
PATCH  /users/me
DELETE /users/me

GET    /users
GET    /users/:id
GET    /users/:id/products
PATCH  /users/:id/role
```

Некоторые endpoints доступны только администратору.

### Обновление своего профиля

```http
PATCH /users/me
```

Body:

```json
{
  "name": "Olzhas"
}
```

### Смена роли пользователя

Только для `ADMIN`.

```http
PATCH /users/:id/role
```

Body:

```json
{
  "role": "SELLER"
}
```

Доступные значения:

```txt
USER
SELLER
ADMIN
```

## Products endpoints

```txt
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
```

Создавать товары могут только пользователи с ролью:

```txt
SELLER
ADMIN
```

### Создание товара

```http
POST /products
```

Body:

```json
{
  "title": "iPhone 13",
  "description": "Good condition",
  "price": 300000,
  "imageUrl": "https://example.com/iphone.jpg",
  "categoryId": 1
}
```

`categoryId` можно не передавать.

### Фильтрация товаров

```http
GET /products?search=iphone
GET /products?minPrice=100000&maxPrice=400000
GET /products?categoryId=1
```

## Categories endpoints

```txt
GET    /categories
GET    /categories/:id
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id
```

Создавать, обновлять и удалять категории может только `ADMIN`.

### Создание категории

```http
POST /categories
```

Body:

```json
{
  "name": "Electronics"
}
```

## Cart endpoints

```txt
GET    /cart
POST   /cart
PATCH  /cart/:productId
DELETE /cart/:productId
DELETE /cart
```

### Добавление товара в корзину

```http
POST /cart
```

Body:

```json
{
  "productId": 1,
  "quantity": 1
}
```

### Обновление количества

```http
PATCH /cart/:productId
```

Body:

```json
{
  "quantity": 3
}
```

## Favorites endpoints

```txt
GET    /favorites
POST   /favorites/:productId
DELETE /favorites/:productId
```

### Добавить товар в избранное

```http
POST /favorites/1
```

### Получить избранные товары

```http
GET /favorites
```

### Удалить из избранного

```http
DELETE /favorites/1
```

## Назначение первого администратора

Все новые пользователи создаются с ролью `USER`.

Чтобы назначить первого администратора, можно выполнить SQL-запрос:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'user@mail.com';
```

После смены роли нужно заново выполнить логин, потому что роль хранится внутри JWT токена.

## Пример сценария тестирования

1. Зарегистрировать пользователя.
2. Назначить ему роль `ADMIN` через SQL.
3. Залогиниться заново.
4. Создать категорию.
5. Зарегистрировать второго пользователя.
6. Назначить ему роль `SELLER`.
7. Залогиниться как `SELLER`.
8. Создать товар.
9. Зарегистрировать обычного пользователя.
10. Добавить товар в корзину и избранное.

## Полезные команды

Запуск проекта:

```bash
nvm use 22
npm run start:dev
```

Миграция Prisma:

```bash
npx prisma migrate dev --name migration_name
```

Генерация Prisma Client:

```bash
npx prisma generate
```

Форматирование кода:

```bash
npm run format
```

Линтинг:

```bash
npm run lint
```

Тесты:

```bash
npm run test
```

## Возможные проблемы

### TypeScript не видит новые модели или поля Prisma

Если после изменения Prisma schema TypeScript не видит новые модели или поля, нужно выполнить:

```bash
npx prisma generate
```

А затем перезапустить TypeScript Server в VSCode:

```txt
Cmd + Shift + P → TypeScript: Restart TS Server
```

### Prisma Studio не запускается

Если `npx prisma studio` падает из-за ошибки совместимости в Prisma 7, роли можно временно менять через SQL:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'user@mail.com';
```

или

```sql
UPDATE users
SET role = 'SELLER'
WHERE email = 'seller@mail.com';
```

### Проверка версии Node.js

Если используется `nvm`, перед запуском проекта всегда проверяй версию Node.js:

```bash
nvm use 22
node -v
```
