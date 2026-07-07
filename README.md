# Contract Architect

MVP шаблонного генератора договора и акта выполненных работ на русском языке.
Обновлённый интерфейс оформлен как premium legal-tech workspace и включает
AI-помощника для объяснений и подсказок по вниманию.

Сервис не пишет юридический текст с нуля и не заменяет юриста. Пользователь
сам вводит данные, система валидирует форму, подставляет значения в заранее
подготовленные DOCX-шаблоны и отдает ZIP-архив с готовыми файлами.

Документы формируются на основе заранее подготовленных шаблонов. Перед
использованием в юридически значимых ситуациях проверьте документ со
специалистом.

## Что работает без базы данных

Основной сценарий генератора не зависит от PostgreSQL:

- главная страница `/`;
- форма генератора `/generator`;
- валидация формы;
- генерация договора в DOCX;
- генерация акта в DOCX;
- скачивание ZIP-архива;
- PDF-preview через страницу `/preview` и печать браузера.
- AI-панель отображается без базы данных. Если AI-ключ не задан, приложение
  показывает понятную ошибку и не ломает генератор.

База нужна только для сохранения черновиков и будущей истории документов.
Если `DATABASE_URL` не задан, `/api/drafts` вернет понятное сообщение на русском,
а генерация документов продолжит работать.

## Локальный запуск

1. Установите Node.js 20 или новее.

2. Установите зависимости:

```bash
npm install
```

После установки выполнится `prisma generate`, чтобы Prisma Client был готов для
локальной разработки и Vercel build.

3. Создайте `.env` на основе `.env.example`.

Для запуска генератора без базы можно оставить значения пустыми:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_ACCESS_TOKEN=""
AI_PROVIDER="openai"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
AI_CUSTOM_INSTRUCTION=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

Для работы сохранения черновиков укажите PostgreSQL/Supabase URL.
Для работы AI-помощника укажите `OPENAI_API_KEY`.

4. Запустите проект:

```bash
npm run dev
```

5. Откройте:

```text
http://localhost:3000
```

## Переменные окружения

Файл `.env.example` содержит только пустые значения и не содержит реальных
ключей:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_APP_URL=""
ADMIN_ACCESS_TOKEN=""
AI_PROVIDER="openai"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
AI_CUSTOM_INSTRUCTION=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

Назначение переменных:

- `DATABASE_URL` — PostgreSQL connection string. Для Supabase обычно это pooled
  connection URL.
- `DIRECT_URL` — прямое подключение к PostgreSQL. Для Supabase используется
  Prisma migrations и прямое подключение к базе.
- `NEXT_PUBLIC_APP_URL` — публичный URL приложения, например
  `https://your-project.vercel.app`.
- `ADMIN_ACCESS_TOKEN` — простой ключ доступа для изменения настроек на
  странице `/admin`. В production без него сохранение настроек заблокировано.
- `AI_PROVIDER` — AI-провайдер. В MVP поддерживается `openai`.
- `AI_ENABLED` — включает или отключает AI по умолчанию.
- `AI_MAX_REQUESTS_PER_WINDOW` — лимит AI-запросов на IP за окно времени.
- `AI_RATE_LIMIT_WINDOW_SECONDS` — длина окна лимита в секундах.
- `AI_CUSTOM_INSTRUCTION` — дополнительная server-side инструкция AI.
- `OPENAI_API_KEY` — серверный ключ OpenAI. Не должен попадать на клиент.
- `OPENAI_MODEL` — модель для AI-помощника, по умолчанию `gpt-4.1-mini`.

`.env` и `.env.local` не должны попадать в Git.

## Supabase

1. Создайте проект в Supabase.
2. Откройте `Project Settings` → `Database`.
3. Скопируйте PostgreSQL connection string.
4. Для `DATABASE_URL` используйте pooled connection string.
5. Для `DIRECT_URL` используйте direct connection string.
6. Убедитесь, что пароль базы закодирован для URL, если содержит спецсимволы.

Пример формата:

```env
DATABASE_URL="postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres"
```

Это пример формата, а не реальные ключи.

## Prisma

Схема находится в `prisma/schema.prisma` и готова для PostgreSQL/Supabase:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Команды:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Для production-миграции можно выполнить:

```bash
npx prisma migrate deploy
```

Перед `prisma validate` или миграциями задайте реальные `DATABASE_URL` и
`DIRECT_URL`, потому что Prisma CLI валидирует datasource.

## Деплой на Vercel через GitHub

1. Создайте репозиторий на GitHub.
2. Инициализируйте Git в папке проекта, если репозиторий еще не создан:

```bash
git init
git add .
git commit -m "Initial MVP"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

3. В Vercel выберите `Add New Project`.
4. Подключите GitHub и импортируйте репозиторий.
5. Framework Preset: `Next.js`.
6. Install Command: `npm install`.
7. Build Command: `npm run build`.
8. Output Directory оставьте пустым, Vercel определит Next.js автоматически.
9. Добавьте env-переменные:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
ADMIN_ACCESS_TOKEN=""
AI_PROVIDER="openai"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
AI_CUSTOM_INSTRUCTION=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

Для деплоя только основного генератора `DATABASE_URL` и `DIRECT_URL` можно
оставить пустыми. Для сохранения черновиков укажите Supabase/PostgreSQL URL.
Для работы AI-подсказок добавьте `OPENAI_API_KEY`. Без ключа генератор,
DOCX/ZIP экспорт и PDF-preview продолжают работать.
Для изменения настроек на `/admin` в production добавьте `ADMIN_ACCESS_TOKEN`.

## Миграции на Supabase

После добавления Supabase URL выполните локально:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Для уже настроенного production окружения:

```bash
npx prisma migrate deploy
```

Если миграции выполняются из CI/CD, убедитесь, что `DATABASE_URL` и `DIRECT_URL`
заданы в окружении команды.

## DOCX-шаблоны

Шаблоны лежат в папке `src/templates/`:

- `contract-template.docx`
- `act-template.docx`

Они включены в production build через `next.config.mjs`, чтобы серверный route
`/api/generate` мог читать их после деплоя на Vercel.

Минимальные рабочие заглушки можно пересоздать командой:

```bash
node scripts/create-docx-templates.mjs
```

Для production замените заглушки на аккуратно сверстанные DOCX-шаблоны,
подготовленные в Word или совместимом редакторе. Важно, чтобы переменные вида
`{{contract_number}}` не были разорваны редактором на несколько фрагментов.

### Переменные договора

- `{{contract_number}}`
- `{{contract_date}}`
- `{{city}}`
- `{{customer_name}}`
- `{{customer_type}}`
- `{{customer_representative}}`
- `{{customer_basis}}`
- `{{customer_requisites}}`
- `{{contractor_name}}`
- `{{contractor_type}}`
- `{{contractor_representative}}`
- `{{contractor_basis}}`
- `{{contractor_requisites}}`
- `{{subject}}`
- `{{works_description}}`
- `{{total_amount}}`
- `{{total_amount_words}}`
- `{{prepayment_percent}}`
- `{{prepayment_amount}}`
- `{{prepayment_amount_words}}`
- `{{final_payment_amount}}`
- `{{final_payment_amount_words}}`
- `{{start_date}}`
- `{{end_date}}`

Список работ:

```text
{{#works}}
* {{name}}
{{/works}}
```

### Переменные акта

- `{{act_number}}`
- `{{act_date}}`
- `{{contract_number}}`
- `{{contract_date}}`
- `{{customer_name}}`
- `{{contractor_name}}`
- `{{subject}}`
- `{{works_description}}`
- `{{total_amount}}`
- `{{total_amount_words}}`
- `{{customer_requisites}}`
- `{{contractor_requisites}}`

## Как работает генерация

`POST /api/generate`:

1. принимает данные формы;
2. валидирует их через Zod;
3. преобразует данные в переменные шаблона;
4. рендерит `contract-template.docx` и `act-template.docx` через
   `docxtemplater` + `pizzip`;
5. упаковывает оба DOCX в ZIP через `JSZip`;
6. возвращает ZIP пользователю.

Файлы в архиве:

- `dogovor-{contractNumber}.docx`
- `akt-{actNumber}.docx`

Документы не сохраняются на сервере.

## PDF-preview

PDF для MVP создается через HTML-preview на странице `/preview` и стандартную
печать браузера. Кнопка `Скачать / распечатать PDF` вызывает `window.print()`.
CSS задает формат A4, поля, типографику и разрыв страницы между договором и
актом.

Серверная конвертация DOCX в PDF через LibreOffice намеренно не используется.

## AI-помощник

AI-помощник расположен рядом с формой и печатным preview. Он не пишет договоры
с нуля и не заменяет юриста. Доступные действия:

- объяснить пункт простым языком;
- найти потенциально спорные места;
- сделать формулировку понятнее без автоматической замены;
- составить список вопросов к юристу.

Серверный route:

```text
POST /api/ai/contract-assistant
```

Payload:

```ts
{
  action: "explain" | "risk_hints" | "rewrite" | "questions";
  contractType?: string;
  selectedText?: string;
  fullText?: string;
  userQuestion?: string;
}
```

Ответ:

```ts
{
  success: boolean;
  result?: string;
  error?: string;
}
```

Ключ OpenAI используется только на сервере. Route ограничивает размер текста,
имеет простой rate limit и возвращает русские ошибки без внутренних деталей.

## Админка

Страница `/admin` позволяет управлять runtime-настройками AI:

- включить или отключить AI-помощника;
- выбрать модель;
- настроить rate limit;
- добавить дополнительную инструкцию AI;
- проверить статус `OPENAI_API_KEY` и `ADMIN_ACCESS_TOKEN`.

Важно: API-ключ OpenAI нельзя вводить и хранить через интерфейс. Его нужно
добавлять как env-переменную `OPENAI_API_KEY` в Vercel или локальном окружении.
Runtime-настройки из админки хранятся в памяти serverless-инстанса и могут
сброситься при cold start или redeploy. Для постоянных production-настроек
следующим шагом стоит добавить хранение в PostgreSQL/Supabase.

## API

- `POST /api/generate` — формирует ZIP с договором и актом, не зависит от базы.
- `POST /api/drafts` — сохраняет данные формы как черновик, требует базу.
- `GET /api/templates` — возвращает активные шаблоны из базы или fallback-список.
- `POST /api/ai/contract-assistant` — возвращает AI-подсказки, требует
  `OPENAI_API_KEY`.
- `GET /api/admin/ai-settings` — возвращает безопасный статус AI-настроек.
- `POST /api/admin/ai-settings` — сохраняет runtime-настройки AI, в production
  требует `ADMIN_ACCESS_TOKEN`.

## Что не входит в MVP

- Авторизация.
- Личный кабинет.
- Платежная система.
- AI-генерация юридического текста.
- Полноценная юридическая экспертиза AI.
- Автоматическое применение AI-правок в договор.
- Редактор шаблонов.
- Загрузка пользовательских шаблонов.
- Сложная CRM.
- Серверная конвертация DOCX в PDF.

## Безопасность

API не логирует персональные данные и не раскрывает внутренние пути сервера в
ответах об ошибках. Для production нужно добавить авторизацию, разграничение
доступа к черновикам, политику хранения персональных данных, сроки удаления
данных и аудит действий.
