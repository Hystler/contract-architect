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
- PDF-preview через страницу `/preview` и печать браузера;
- юридические страницы `/privacy`, `/terms`, `/consent`, `/cookies`;
- cookie banner с сохранением выбора в localStorage.

База нужна только для сохранения черновиков и будущей истории документов.
Если `DATABASE_URL` не задан, `/api/drafts` вернет понятное сообщение на русском,
а генерация документов продолжит работать.

Авторизация, аккаунт, админка, premium-доступ и AI-помощник требуют
PostgreSQL/Supabase, потому что пользователи, подписки и usage хранятся в базе.

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
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-mini"
AI_MONTHLY_TOKEN_LIMIT="50000"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
ADMIN_LOGIN=""
ADMIN_PASSWORD=""
AUTH_SECRET=""
```

Для работы сохранения черновиков укажите PostgreSQL/Supabase URL.
Для регистрации, админки и AI нужен `DATABASE_URL`. Для AI также нужен
`OPENAI_API_KEY`, активный пользователь и premium-доступ.

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
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-mini"
AI_MONTHLY_TOKEN_LIMIT="50000"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
ADMIN_LOGIN=""
ADMIN_PASSWORD=""
AUTH_SECRET=""
```

Назначение переменных:

- `DATABASE_URL` — PostgreSQL connection string. Для Supabase в этом MVP
  рекомендуется session pooler URL на порту `5432`: он стабильнее работает с
  Prisma Client и prepared statements.
- `DIRECT_URL` — подключение для Prisma migrations. Если прямой Supabase host
  `db.<project-ref>.supabase.co:5432` недоступен из вашей сети, используйте
  session pooler URL на порту `5432`.
- `NEXT_PUBLIC_APP_URL` — публичный URL приложения, например
  `https://your-project.vercel.app`.
- `OPENAI_API_KEY` — серверный ключ OpenAI. Не должен попадать на клиент.
- `OPENAI_MODEL` — модель для AI-помощника, по умолчанию `gpt-5-mini`.
- `AI_ENABLED` — включает или отключает AI по умолчанию.
- `AI_MAX_REQUESTS_PER_WINDOW` — лимит AI-запросов на IP за окно времени.
- `AI_RATE_LIMIT_WINDOW_SECONDS` — длина окна лимита в секундах.
- `AI_MONTHLY_TOKEN_LIMIT` — месячный лимит токенов AI на пользователя или IP
  для MVP-защиты от абьюза.
- `ADMIN_LOGIN` и `ADMIN_PASSWORD` — логин и пароль скрытой админки `/admin`.
- `AUTH_SECRET` — секрет для подписи пользовательских и админских httpOnly
  cookies. В production обязателен.

`.env` и `.env.local` не должны попадать в Git.

## Supabase

1. Создайте проект в Supabase.
2. Откройте `Project Settings` → `Database`.
3. Скопируйте PostgreSQL connection string.
4. Для `DATABASE_URL` используйте session pooler connection string.
5. Для `DIRECT_URL` используйте direct connection string. Если direct host
   недоступен из-за IPv6/сетевых ограничений, используйте session pooler.
6. Убедитесь, что пароль базы закодирован для URL, если содержит спецсимволы.

Пример формата:

```env
DATABASE_URL="postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require"
```

Это пример формата, а не реальные ключи.

Для Prisma 5 не добавляйте `pgbouncer=true` к Supabase pooler URL: в некоторых
окружениях это приводит к закрытию соединения. Если используете transaction
pooler на `6543`, добавьте `statement_cache_size=0`, но для текущего MVP
надёжнее session pooler на `5432`. Для миграций предпочтителен direct
connection из Supabase; session pooler нужен как fallback, когда direct host
недоступен.

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

В репозитории подготовлена Prisma migration:

```text
prisma/migrations/20260707120000_initial_schema/migration.sql
prisma/migrations/20260707133000_add_auth_premium/migration.sql
```

Не применяйте её к production без проверки текущей базы. Для чистой
Supabase/PostgreSQL базы можно использовать `npx prisma migrate deploy`.

Для production-миграции можно выполнить:

```bash
npx prisma migrate deploy
```

Если Supabase pooler возвращает `P1002` или `P1017` при миграциях, проверьте
`DIRECT_URL`: сначала попробуйте direct connection, затем session pooler. При
проблемах с advisory lock можно разово запускать команду с
`PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`. Не запускайте миграции автоматически на
каждом Vercel build.

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
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-mini"
AI_MONTHLY_TOKEN_LIMIT="50000"
AI_ENABLED="true"
AI_MAX_REQUESTS_PER_WINDOW="8"
AI_RATE_LIMIT_WINDOW_SECONDS="300"
ADMIN_LOGIN=""
ADMIN_PASSWORD=""
AUTH_SECRET=""
```

Для деплоя только основного генератора `DATABASE_URL` и `DIRECT_URL` можно
оставить пустыми. Для сохранения черновиков укажите Supabase/PostgreSQL URL.
Для регистрации, админки и AI укажите `DATABASE_URL`, `DIRECT_URL`,
`AUTH_SECRET`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`. Для AI-подсказок добавьте
`OPENAI_API_KEY`.
Без ключа OpenAI генератор, DOCX/ZIP экспорт и PDF-preview продолжают работать.
После изменения env в Vercel сделайте Redeploy проекта.

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

## Авторизация и аккаунт

Пользователь может зарегистрироваться на `/register` по email и паролю.
Пароль хранится только как bcrypt-hash в поле `User.passwordHash`.

После регистрации пользователь автоматически входит в аккаунт и попадает на
`/account`. После входа через `/login` пользователь попадает на `/generator`.
Сессия хранится в httpOnly cookie, подписанной через `AUTH_SECRET`.

На странице `/account` показаны:

- email пользователя;
- статус premium-доступа;
- дата окончания premium, если доступ активен;
- количество AI-запросов и токенов за текущий период.

Кнопка “Выйти” очищает пользовательскую cookie через `POST /api/auth/logout`.

## AI-помощник

AI-помощник расположен рядом с формой и печатным preview. Он не пишет договоры
с нуля и не заменяет юриста. AI доступен только авторизованному пользователю с
активным premium-доступом.

Доступные действия после оплаты:

- объяснить пункт простым языком;
- найти потенциально спорные места;
- проверить, каких данных не хватает;
- сделать формулировку понятнее без автоматической замены;
- составить список вопросов к юристу.

Серверный route:

```text
POST /api/ai/contract-check
```

Payload:

```ts
{
  action: "explain" | "risk_hints" | "missing_data" | "rewrite" | "questions";
  contractType?: string;
  selectedText?: string;
  fullText?: string;
  userQuestion?: string;
  personalDataConsent: true;
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

Ключ OpenAI используется только на сервере. Route обращается к OpenAI Responses
API через SDK `openai`, ограничивает размер текста, очищает вход через
`sanitizeContractInput`, проверяет согласие на обработку персональных данных,
проверяет авторизацию и premium, ограничивает частоту запросов и месячный лимит
токенов.

Если пользователь не вошёл, endpoint возвращает `401`:

```text
Войдите в аккаунт, чтобы использовать AI-помощника.
```

Если premium не активен, endpoint возвращает `402`:

```text
AI-помощник доступен только после оплаты или выдачи premium-доступа.
```

Директивы AI лежат в `src/lib/ai/contractAssistantPrompt.ts`. Они запрещают
генерацию договора с нуля, обещания юридической силы, роль юриста и ответы вне
темы документа.

Старый route `POST /api/ai/contract-assistant` оставлен как совместимый alias и
использует тот же защищённый обработчик.

## Подписка и платежная подготовка

Страница `/pricing` содержит тариф `Старт` и текст-заглушку: “Оплата будет
подключена позже.” AI-блок на генераторе ведёт на `/pricing`.

В Prisma добавлены модели:

- `User`;
- `Subscription`;
- `AiUsage`;
- `Payment`.

Helper `src/lib/billing/hasActiveSubscription.ts` проверяет активную запись
`Subscription`: `status = ACTIVE` и
`currentPeriodEnd > now`. Premium можно выдать вручную через скрытую админку.
Когда появится платежный провайдер, в эту же модель нужно синхронизировать
статусы подписки через webhook.

AI usage сохраняется только агрегированно: входные токены, выходные токены,
общее количество токенов и количество запросов. Персональные данные и тексты
договоров в usage не сохраняются.

## Юридические страницы и согласие

Добавлены страницы:

- `/privacy` — политика обработки персональных данных;
- `/terms` — пользовательское соглашение;
- `/consent` — согласие на обработку персональных данных;
- `/cookies` — политика использования cookies.

В форме генератора есть обязательный чекбокс согласия на обработку персональных
данных. Без него нельзя сформировать ZIP, открыть preview, сохранить черновик или
отправить текст в AI. Cookie banner показывает кнопки “Принять” и “Отклонить” и
сохраняет выбор в localStorage.

## Админка

Страница `/admin` скрытая: ссылки на неё нет в header/footer. Чтобы открыть,
введите `/admin` вручную.

Если админ не вошёл, страница показывает форму входа. Данные входа берутся из
env:

```env
ADMIN_LOGIN="admin"
ADMIN_PASSWORD=""
```

После входа админка ставит httpOnly admin cookie. Dashboard позволяет:

- искать пользователя по email;
- видеть email, дату регистрации, premium-статус, дату окончания premium;
- видеть количество AI-запросов за текущий период;
- выдать premium на 7, 30 или 90 дней;
- отключить premium.

При выдаче premium создаётся или обновляется `Subscription`:

- `status = ACTIVE`;
- `plan = PREMIUM`;
- `provider = MANUAL_ADMIN`;
- `currentPeriodStart = now`;
- `currentPeriodEnd = now + выбранное количество дней`.

Чтобы проверить AI:

1. Зарегистрируйтесь на `/register`.
2. Откройте `/admin` вручную.
3. Войдите по `ADMIN_LOGIN` / `ADMIN_PASSWORD`.
4. Найдите пользователя по email.
5. Нажмите “30 дней”.
6. Вернитесь на `/generator`, отметьте согласие на ПДн и нажмите
   “Проверить документ через AI”.

## API

- `POST /api/generate` — формирует ZIP с договором и актом, не зависит от базы.
- `POST /api/drafts` — сохраняет данные формы как черновик, требует базу.
- `GET /api/templates` — возвращает активные шаблоны из базы или fallback-список.
- `POST /api/auth/register` — регистрация пользователя.
- `POST /api/auth/login` — вход пользователя.
- `POST /api/auth/logout` — выход пользователя.
- `POST /api/ai/contract-check` — возвращает AI-подсказки после оплаты
  подписки, требует вход, premium, согласие на ПДн и `OPENAI_API_KEY`.
- `POST /api/ai/contract-assistant` — совместимый alias нового AI endpoint.
- `GET /api/admin/users` — список пользователей для админки.
- `POST /api/admin/grant-premium` — выдача premium на 7, 30 или 90 дней.
- `POST /api/admin/revoke-premium` — отключение premium.
- `POST /api/admin/logout` — выход из админки.

## Что не входит в MVP

- Платежная система.
- Автоматическая покупка/продление подписки.
- AI-генерация юридического текста.
- Полноценная юридическая экспертиза AI.
- Автоматическое применение AI-правок в договор.
- Редактор шаблонов.
- Загрузка пользовательских шаблонов.
- Сложная CRM.
- Серверная конвертация DOCX в PDF.

## Безопасность

API не логирует персональные данные и не раскрывает внутренние пути сервера в
ответах об ошибках. Для production дальше нужно добавить полноценное
разграничение доступа к черновикам, политику хранения персональных данных, сроки
удаления данных и аудит действий.

OpenAI API key должен храниться только в Vercel Environment Variables или
локальном `.env.local`. Если ключ случайно попал в чат, issue, лог или commit,
его нужно отозвать в OpenAI dashboard и создать новый.
