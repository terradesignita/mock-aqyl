# API контракты

Навигация: [[01_Readme]] | [[06_Модель_данных]] | [[11_Безопасность_и_комплаенс]]

> **Версия:** 1.2 | **Обновлено:** 2026-06-19

## Общие правила

- Base URL: `/api/v1`
- Auth: `Bearer JWT` (SSO) или demo-сессия (`auth_mode=demo`).
- Формат: `application/json`.
- Correlation ID: заголовок `X-Request-Id`.
- Версия API: `v1` во всех путях (кроме `/api/health`).

## Полный реестр роутеров и endpoints

### Health

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/health` | Health-check сервиса |

---

### Auth (`/api/v1/auth`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/auth/login` | Авторизация, получение сессии |

---

### Uploads (`/api/v1/uploads`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/uploads` | Загрузка файла в pipeline ingestion |

**Запрос** (multipart/form-data):
```json
{
  "file": "<binary>",
  "classification": "internal",
  "scope": "INTERNAL",
  "business_unit": "corporate"
}
```

**Ответ:**
```json
{
  "document_id": "uuid",
  "version_id": "uuid",
  "status": "queued",
  "job_id": "uuid"
}
```

---

### Documents (`/api/v1/documents`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/documents` | Список документов (с фильтрами) |
| GET | `/api/v1/documents/{document_id}` | Детали документа и статус обработки |
| PATCH | `/api/v1/documents/{document_id}` | Обновление метаданных документа |
| DELETE | `/api/v1/documents/{document_id}` | Удаление документа |
| DELETE | `/api/v1/documents/{document_id}/versions/{version_id}` | Удаление конкретной версии |
| GET | `/api/v1/documents/{document_id}/dossier` | Полное досье документа (с артефактами) |
| GET | `/api/v1/documents/{document_id}/tags` | Теги документа |
| GET | `/api/v1/documents/{document_id}/related` | Похожие документы |
| POST | `/api/v1/documents/{document_id}/ask` | Q&A в контексте документа |
| GET | `/api/v1/documents/{document_id}/transcript` | Транскрипт аудио/видео |
| GET | `/api/v1/documents/{document_id}/sources` | Источники документа |

**GET /documents** — параметры запроса:
- `language` (default: `ru`)
- `scope` (`INTERNAL` / `EXTERNAL`)
- `classification`
- `business_unit`
- `topic_id`
- `limit`, `offset`

**POST /documents/{id}/ask** — запрос:
```json
{
  "question": "Какой фреймворк применить?",
  "language": "ru",
  "strict_grounded": true
}
```

---

### Cards (`/api/v1/cards`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/cards` | Список карточек инсайтов |
| POST | `/api/v1/cards/generate` | Запуск генерации карточки |
| GET | `/api/v1/cards/{card_id}` | Детали карточки |
| POST | `/api/v1/cards/{card_id}/ask` | Q&A в контексте карточки |

**POST /cards/generate** — запрос:
```json
{
  "document_id": "uuid",
  "languages": ["ru", "en"],
  "template": "default_v1"
}
```

**GET /cards/{id}** — параметры: `?language=ru&version=latest`

**POST /cards/{id}/ask** — запрос:
```json
{
  "question": "Какой фреймворк применить для масштабирования?",
  "language": "ru",
  "strict_grounded": true
}
```

**Ответ ask:**
```json
{
  "answer": "...",
  "confidence": 0.82,
  "sources": [
    {"chunk_id": "uuid", "anchor": "p.12", "score": 0.91, "quote": "..."}
  ]
}
```

---

### Artifacts (`/api/v1/artifacts`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/artifacts/dossier` | Сводное досье (все артефакты) |
| GET | `/api/v1/artifacts` | Список артефактов (с фильтрами) |
| GET | `/api/v1/artifacts/{artifact_id}` | Детали артефакта |
| POST | `/api/v1/artifacts/{artifact_id}/export` | Экспорт артефакта (PDF / DOCX) |

---

### Topics / Коллекции (`/api/v1/topics`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/topics` | Список коллекций |
| POST | `/api/v1/topics` | Создание коллекции |
| GET | `/api/v1/topics/{topic_id}` | Детали коллекции |
| PATCH | `/api/v1/topics/{topic_id}` | Обновление коллекции |
| DELETE | `/api/v1/topics/{topic_id}` | Удаление коллекции |
| POST | `/api/v1/topics/{topic_id}/documents` | Добавить документы в коллекцию |
| DELETE | `/api/v1/topics/{topic_id}/documents/{document_id}` | Убрать документ из коллекции |
| GET | `/api/v1/topics/{topic_id}/children` | Дочерние коллекции |
| GET | `/api/v1/topics/{topic_id}/members` | Участники коллекции |
| POST | `/api/v1/topics/{topic_id}/members` | Добавить участника |
| PATCH | `/api/v1/topics/{topic_id}/members/{member_id}` | Изменить роль участника |
| DELETE | `/api/v1/topics/{topic_id}/members/me` | Покинуть коллекцию |
| DELETE | `/api/v1/topics/{topic_id}/members/{member_id}` | Удалить участника |
| GET | `/api/v1/topics/{topic_id}/activity` | Лента активности коллекции |

**POST /topics** — запрос:
```json
{
  "title": "Стратегия роста",
  "scope": "INTERNAL",
  "business_unit": "corporate",
  "description": "Материалы по стратегии",
  "difficulty": "foundation",
  "parent_id": null
}
```

**Роли участников:** `owner`, `editor`, `viewer`

---

### Search (`/api/v1/search`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/search` | Гибридный поиск (GET) |
| POST | `/api/v1/search` | Гибридный поиск (POST) |

**Параметры:**
- `q` (string) — поисковый запрос
- `scope` (`INTERNAL` / `EXTERNAL` / `all`)
- `language` (`ru` / `en` / `kk` / `uz` / `az`)
- `business_unit`
- `topic_id`
- `limit`, `offset`

---

### Chat (`/api/v1/chat`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/chat` | Глобальный чат по всей базе знаний |

---

### Advisor (`/api/v1/advisor`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/advisor/ask` | Структурированный AI-советник |

---

### Speech (`/api/v1/speech`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/speech/transcribe` | STT: транскрибация аудио/видео |
| POST | `/api/v1/speech/synthesize` | TTS: синтез речи из текста |
| POST | `/api/v1/speech/podcast` | Генерация подкаста (диалог) |
| POST | `/api/v1/speech/podcast/asset` | Генерация подкаста → сохранить как ассет |
| GET | `/api/v1/speech/audio/{path}` | Стриминг аудиофайла |

**POST /speech/transcribe** — multipart/form-data, поле `file` (MP3/WAV/M4A/WEBM/OGG/MP4).

**POST /speech/synthesize** — запрос:
```json
{
  "text": "Текст для озвучки",
  "language": "ru",
  "voice": "alloy"
}
```

---

### Images (`/api/v1/images`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/images/generate` | Генерация изображения (DALL-E 3 / Imagen 3) |

---

### Studio (`/api/v1/studio`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/studio/generate` | Генерация артефакта (карточка / summary / podcast / …) |
| POST | `/api/v1/studio/compare` | Сравнение двух артефактов |

---

### Assets (`/api/v1/assets`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/assets` | Список сгенерированных ассетов |
| GET | `/api/v1/assets/{asset_id}` | Детали ассета |
| GET | `/api/v1/assets/{asset_id}/content` | Содержимое ассета (binary) |

---

### Tags (`/api/v1/tags`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/tags` | Список тегов |
| POST | `/api/v1/tags` | Создать тег |
| DELETE | `/api/v1/tags/{tag_id}` | Удалить тег |
| POST | `/api/v1/tags/suggest` | AI-предложение тегов для текста |
| POST | `/api/v1/tags/topics/{topic_id}` | Назначить теги коллекции |
| DELETE | `/api/v1/tags/topics/{topic_id}/{tag_id}` | Снять тег с коллекции |
| GET | `/api/v1/tags/documents/{document_id}` | Теги документа |
| POST | `/api/v1/tags/documents/{document_id}` | Назначить теги документу |
| DELETE | `/api/v1/tags/documents/{document_id}/{tag_id}` | Снять тег с документа |

---

### Glossary (`/api/v1/glossary`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/glossary` | Список терминов глоссария |
| POST | `/api/v1/glossary` | Добавить термин |

---

### Notifications (`/api/v1/notifications`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/notifications` | Список уведомлений пользователя |
| GET | `/api/v1/notifications/unread-count` | Количество непрочитанных |
| POST | `/api/v1/notifications/read` | Отметить как прочитанные |

---

### Jobs (`/api/v1/jobs`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/jobs` | Список фоновых заданий |
| GET | `/api/v1/jobs/{job_id}` | Статус конкретного задания |
| GET | `/api/v1/jobs/{job_id}/stream` | SSE-стрим статуса задания |

---

### Skills (`/api/v1/skills`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/skills` | Список системных промптов |
| GET | `/api/v1/skills/{slug}` | Получить промпт по slug |
| PUT | `/api/v1/skills/{slug}` | Создать или обновить промпт |

**Slug формат:** `modes/expert`, `positions/cfo`, `positions/engineer` и т.д.

---

### Connectors (`/api/v1/connectors`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/connectors/folder-sync` | Запустить синхронизацию папки |

---

### Metrics (`/api/v1/metrics`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/metrics` | Метрики использования платформы |

---

### Audit (`/api/v1/audit`)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/v1/audit` | Журнал аудита (admin) |

---

### Twin (`/api/v1/twin`)

AI-тренажёр переговоров с CEO. Один endpoint обслуживает и обычный диалог, и запрос дебрифинга (определяется по содержанию `message`).

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/v1/twin/chat` | Один ход переговорной сессии; возвращает реплику CEO и флаг завершения |

**Запрос:**
```json
{
  "ceo_id": "АЖ",
  "sector": "Финансы и банкинг",
  "difficulty": "medium",
  "history": [
    { "role": "user", "text": "Добрый день, я хотел бы..." },
    { "role": "assistant", "text": "Ближе к делу." }
  ],
  "message": "Мы предлагаем сократить ваши операционные расходы на 15%..."
}
```

**Ответ:**
```json
{
  "reply": "Цифры. Как считали?",
  "session_end": false
}
```

**Поля:**

| Поле | Тип | Описание |
|---|---|---|
| `ceo_id` | string (1–10) | ID архетипа из `CEO_PROFILES` фронтенда |
| `sector` | string (1–60) | Сфера бизнеса (10 предустановленных вариантов) |
| `difficulty` | `easy` / `medium` / `hard` | Уровень сложности, влияет на системный промпт |
| `history` | array | История диалога текущей сессии |
| `message` | string (1–2000) | Текущее сообщение пользователя |
| `session_end` | bool | `true` — CEO завершил встречу (маркер `[SESSION_END]` в ответе LLM) |

**Профили CEO** загружаются из `01_backend/ceo_profiles/<ceo_id>.md` через `ceo_loader.py` (`@lru_cache`). Fallback: `_default.md`. Правка профилей не требует деплоя — только рестарт процесса.

---

## Сводная статистика API

| Показатель | Значение |
|---|---|
| Роутеров | 23 |
| Endpoints (методов) | 56+ |
| Версия API | v1 |

## Коды ошибок

```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "User role is not allowed for this resource",
    "request_id": "req-..."
  }
}
```

| Код | Значение |
|---|---|
| `400` | Validation error |
| `401` | Unauthorized |
| `403` | Forbidden (RBAC) |
| `404` | Not found |
| `409` | Conflict (versioning / duplicate) |
| `429` | Rate limited |
| `500` | Internal error |

## Идемпотентность

Для `POST /uploads` и `POST /cards/generate` поддерживается заголовок `Idempotency-Key`.

## Аутентификация

- **demo-режим** (`AUTH_MODE=demo`): фиксированный пользователь из конфига (`AUTH_DEMO_EMAIL`, `AUTH_DEMO_ROLE`, `AUTH_DEMO_BUSINESS_UNIT`, `AUTH_DEMO_GEO`).
- **SSO-режим** (`AUTH_MODE=sso`): Bearer JWT от корпоративного SSO.
- CORS origins настраиваются через `CORS_ORIGINS` (default: `localhost:8040,5173,3000`).
