# OpenAPI и версионирование

Навигация: [[01_Readme]] | [[10_API_контракты]] | [[14_Тестирование_и_качество]]

Версия: v1.2 | Дата: 2026-04-20

## Цель

Формализовать API-контракты и правила эволюции API без breaking изменений.

## Артефакты

- Спецификация: `openapi.yaml` (в папке `02_docs/`).
- Авто-генерация: FastAPI генерирует OpenAPI 3.x на `/openapi.json` и Swagger UI на `/docs`.
- Валидация схемы в CI.
- Contract tests против stage окружения.

## Текущие роутеры и префиксы (22 роутера)

| Роутер | Prefix | Tags |
|---|---|---|
| auth | `/api/v1/auth` | auth |
| search | `/api/v1/search` | search |
| chat | `/api/v1/chat` | chat |
| advisor | `/api/v1/advisor` | advisor |
| artifacts | `/api/v1/artifacts` | artifacts |
| assets | `/api/v1/assets` | assets |
| audit | `/api/v1/audit` | audit |
| cards | `/api/v1/cards` | cards |
| connectors | `/api/v1/connectors` | connectors |
| documents | `/api/v1/documents` | documents |
| glossary | `/api/v1/glossary` | glossary |
| health | `/api/v1/health` (или `/api/health`) | health |
| images | `/api/v1/images` | images |
| jobs | `/api/v1/jobs` | jobs |
| metrics | `/api/v1` | metrics |
| notifications | `/api/v1/notifications` | notifications |
| skills | `/api/v1/skills` | skills |
| speech | `/api/v1/speech` | speech |
| studio | `/api/v1/studio` | studio |
| tags | `/api/v1/tags` | tags |
| topics | `/api/v1/topics` | topics |
| uploads | `/api/v1/uploads` | uploads |
| wiki | `/api/v1/wiki` | wiki |

## Ключевые эндпоинты

| Method | Path | Описание |
|---|---|---|
| POST | `/api/v1/auth/login` | Аутентификация (demo-mode) |
| GET/POST | `/api/v1/search` | Гибридный поиск |
| POST | `/api/v1/chat` | Global Q&A с SSE streaming |
| POST | `/api/v1/uploads` | Загрузка файла |
| POST | `/api/v1/connectors/folder-sync` | Синхронизация папки (admin) |
| GET | `/api/v1/artifacts/dossier` | Набор артефактов по doc/topic |
| GET | `/api/v1/metrics` | Агрегированные метрики платформы |
| GET | `/api/v1/wiki` | Список wiki-страниц |
| POST | `/api/v1/wiki/lint` | Запуск lint wiki (admin) |
| GET | `/api/v1/health` | Health check |

## Стратегия версий

- URL-versioning: `/api/v1/...`.
- Minor изменения: обратносовместимые поля/эндпоинты (добавление nullable полей, новые query-параметры).
- Major изменения: новый префикс `/api/v2/...`.

## Streaming (SSE)

Эндпоинт `POST /api/v1/chat?stream=true` возвращает Server-Sent Events:
- Content-Type: `text/event-stream`
- Headers: `Cache-Control: no-cache`, `X-Accel-Buffering: no`
- Финальное событие содержит `{"citations": [...]}`.

## Политика депрекации

1. Пометка endpoint как `deprecated` в OpenAPI (`openapi.yaml`).
2. Уведомление за 60 дней до отключения.
3. Параллельная поддержка минимум 1 релизный цикл.

## Требования к контрактам

У каждого endpoint:
- request schema (Pydantic модель);
- response schema (Pydantic модель или `dict`);
- error model (HTTPException с detail);
- примеры payload;
- security requirements (роль, scope).

## CI checks

```text
[ ] OpenAPI lint (openapi.yaml валиден)
[ ] Breaking-change detection (diff с предыдущей версией)
[ ] Contract tests (test_api_smoke.py)
[ ] Backward compatibility report
[ ] ruff lint — 0 ошибок
```
