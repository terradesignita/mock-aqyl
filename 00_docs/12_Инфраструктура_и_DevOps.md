# Инфраструктура и DevOps

Навигация: [[01_Readme]] | [[05_Архитектура_системы]] | [[13_Наблюдаемость_и_SRE]]

Версия: v1.2 | Дата: 2026-04-20

## Среды

- `dev` — быстрая разработка и отладка (docker-compose.yml, SEED_DEMO=true).
- `stage` — интеграционные и нагрузочные тесты.
- `prod` — продуктивная среда (docker-compose.prod.yml).

## Сервисы Docker Compose (актуально)

| Сервис | Образ | Порты | Назначение |
|---|---|---|---|
| `postgres` | pgvector/pgvector:pg17 | 127.0.0.1:5433:5432 | PostgreSQL 17 + pgvector |
| `minio` | minio/minio:latest | 127.0.0.1:9000, 9001 | S3-compatible object storage |
| `backend` | ./Dockerfile (Python 3.12) | expose 8040 | FastAPI API сервер |
| `frontend` | ./frontend/Dockerfile | expose 80 | nginx + Vanilla JS SPA |
| `gateway` | nginx:1.27-alpine | 8040:80 | Reverse proxy |

Volumes: `postgres_data`, `minio_data`, `./data:/app/data`.

## Конфигурация backend (ключевые env-переменные)

| Переменная | Default | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://postgres:postgres@localhost:5433/bi_knowledge` | PostgreSQL DSN |
| `APP_PORT` | `8040` | Порт FastAPI |
| `STORAGE_BACKEND` | `local` | `local` или `s3` |
| `S3_ENDPOINT` | `http://minio:9000` | MinIO endpoint |
| `S3_BUCKET` | `bi-knowledge` | Бакет |
| `S3_REGION` | `kz-almaty-1` | Регион |
| `OPENAI_MODEL` | `gpt-4o-mini` | Основная LLM |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Anthropic модель |
| `GOOGLE_GATEWAY_LLM_MODEL` | `gemini-2.5-pro` | Google LLM |
| `GOOGLE_GATEWAY_IMAGE_MODEL` | `imagen-3.0-generate-002` | Image generation |
| `OLLAMA_MODEL` | `llama3.2:3b` | Fallback LLM |
| `EMBEDDING_BACKEND` | `hashing` | `hashing` / `openai` |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding |
| `AUTH_MODE` | `demo` | `demo` / prod |
| `ENABLE_WIKI_GENERATION` | `true` | Karpathy wiki layer |
| `WIKI_LINT_INTERVAL_HOURS` | `6` | Интервал lint wiki |
| `WIKI_MAX_PAGES_PER_DOC` | `4` | Макс. wiki-страниц на документ |
| `NOTEBOOKLM_NOTEBOOK_ID` | `""` | ID ноутбука NotebookLM |
| `SEED_DEMO` | `false` | Авто-наполнение демо-данными |
| `RUN_INLINE_JOBS` | `true` | Выполнять jobs синхронно |
| `INGESTION_MAX_CONCURRENT` | `3` | Параллельных ingestion job |
| `MIN_RELEVANCE_SCORE` | `0.35` | Минимальный косинусный порог поиска |
| `CORS_ORIGINS` | `http://localhost:8040,...` | Разрешённые CORS-источники |

## CI/CD pipeline

```mermaid
flowchart LR
    A[Commit] --> B[Lint + Unit Tests]
    B --> C[Build Image]
    C --> D[SAST + Dependency Scan]
    D --> E[Deploy to Stage]
    E --> F[Integration + E2E]
    F --> G[Manual Approval]
    G --> H[Deploy to Prod]
```

Линтер: `ruff` (line-length=100, target-version=py312).
Тесты: `pytest`, testpaths=["tests"], 25+ тест-файлов.

## Зависимости (pyproject.toml)

Ключевые библиотеки:

| Библиотека | Назначение |
|---|---|
| `fastapi>=0.116.0` | Web framework |
| `sqlalchemy>=2.0.38` | ORM |
| `psycopg[binary]>=3.1` | PostgreSQL driver |
| `pgvector>=0.3` | pgvector ORM extension |
| `openai>=1.68.2` | OpenAI API |
| `anthropic>=0.25` | Anthropic Claude API |
| `langdetect>=1.0.9` | Определение языка |
| `deep-translator>=1.11.4` | Перевод |
| `rapidfuzz>=3.13.0` | Fuzzy dedup (threshold 0.94) |
| `pypdf>=5.4.0` | PDF extraction |
| `python-docx>=1.1.2` | DOCX extraction |
| `python-pptx>=1.0.2` | PPTX extraction |
| `aiobotocore>=2.13.0` | Async S3/MinIO |
| `structlog>=24.1` | Structured logging |
| `scikit-learn>=1.6.1` | ML utils |
| `fpdf2>=2.8.1` | PDF generation |
| `jinja2>=3.1.6` | Шаблоны |

## Конфигурация и секреты

- GitOps-подход для окружений.
- `.env` файл в корне проекта (загружается автоматически через `python-dotenv`).
- Secret manager для ключей и токенов в production.
- Feature flags через env-переменные (e.g. `ENABLE_WIKI_GENERATION`, `ENABLE_LLM_RERANK`).

## Резервное копирование и DR

- PostgreSQL backup: daily full + WAL archiving.
- MinIO backup: ежедневный snapshot.
- Recovery target:
  - `RPO <= 24h`
  - `RTO <= 4h`

## Требования к релизу

- Зеленый CI pipeline (lint + unit + integration).
- Закрыты критические уязвимости.
- Обновлены Alembic-миграции (`alembic/`) и runbook.
- Есть rollback plan.
- Обновлена `openapi.yaml` в `02_docs/`.
