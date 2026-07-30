# План релизов и roadmap

Навигация: [[01_Readme]] | [[03_Цели_и_KPI]] | [[16_Операционная_модель]]

Версия: v1.3 | Дата: 2026-06-19

## Фазирование

### Фаза 0: Discovery + Legal (11–24 марта 2026)
- Юридическое заключение по HBS-контенту.
- Архитектурный blueprint и согласование NFR.
- Формирование backlog MVP.

### Фаза 1: MVP (25 марта – 31 мая 2026)
- Ingestion pipeline + metadata DB (PostgreSQL 17 + pgvector) + vector index (HNSW).
- Карточки инсайтов RU/EN (artifact_versions).
- Базовый поиск (гибридный: keyword 0.45 + vector 0.55) и Vanilla JS SPA.
- Базовые роли доступа (viewer/editor/owner/admin) и аудит (query_logs).
- 22 REST-роутера: advisor, artifacts, assets, audit, auth, cards, chat, connectors, documents, glossary, health, images, jobs, metrics, notifications, search, skills, speech, studio, tags, topics, uploads, wiki.
- Docker Compose: postgres (pg17+pgvector), minio, backend, frontend, gateway (nginx:1.27-alpine).
- NotebookLM connector для EXTERNAL scope (quiz, report, podcast, slides).
- Karpathy Wiki layer: WikiPage, WikiCrossRef, WikiLintJob — генерация при ingest, lint каждые 6 ч.

### Фаза 2: Pilot (1 июня – 31 июля 2026)
- Мультиязычность RU/EN/KK/UZ/AZ (langdetect + deep-translator + term_glossary).
- Q&A внутри карточки и глобальный chat с SSE streaming.
- Режим «две кнопки» (INTERNAL RAG / EXTERNAL NotebookLM).
- Метрики adoption и quality (`/api/v1/metrics`, golden dataset 200+ вопросов).
- Position-based access control (`access_layer`, `allowed_positions`).
- **Twin CEO Simulator** (реализовано 2026-06-19): тренажёр переговоров, 10 CEO-архетипов с MD-профилями, фазовый UX, AI-дебрифинг, голосовой ввод. Роутер `/api/v1/twin`.

### Фаза 3: Scale (1 августа – 31 октября 2026)
- Top-500 rollout.
- Оптимизация стоимости LLM (routing: OpenAI → Anthropic → Google Gateway → Ollama).
- LLM reranking (`ENABLE_LLM_RERANK`).
- Усиление SRE/DR: RPO <= 24h, RTO <= 4h, SLA support.
- SSO/BILife production integration (JWT claims).

### Фаза 4: Enterprise readiness (1 ноября – 31 декабря 2026)
- Готовность к массовому доступу (Top-100 → all employees).
- Регламент операционной поддержки.
- Финальный security/legal audit.
- S3/Azure Blob migration от OneDrive (триггер: >50 GB или >500 пользователей, ADR-0006).

## Milestones и критерии

| ID | Milestone | Критерий |
|---|---|---|
| M1 | Ingestion pipeline | 100% ingestion success на тестовом датасете |
| M2 | Card generation | Time-to-Card <= 30 минут |
| M3 | Citation coverage | >= 95% ответов с цитатами |
| M4 | Adoption Wave 1 | MAU Top-100 >= 60% |

## Текущий статус реализации (2026-06-19)

- Ingestion pipeline: реализован (chunk 220 токенов, overlap 40, dedup 0.94).
- 23 роутера: реализованы и смонтированы в `backend/main.py`.
- Wiki layer: реализован (WikiPage, WikiCrossRef, WikiLintJob, WikiService).
- NotebookLM: реализован (generate_quiz, generate_report, generate_podcast, generate_slides).
- Auth: demo-mode (любые credentials → роль из config). Prod SSO — план Фаза 3.
- Storage: local (dev) и S3/MinIO (prod через docker-compose).
- **Twin CEO Simulator**: реализован. 10 CEO-архетипов, MD-профили, `ceo_loader.py` с `@lru_cache`, AI-дебрифинг, голосовой ввод, горячие клавиши, tooltip, session timer.
- Wiki UX: Obsidian-callouts, Source footnotes, YAML frontmatter, wikilinks, Mermaid, syntax highlighting, плавающий TOC (реализовано 2026-06-17–18).

## Зависимости

- Legal approval (OI-001 — HBS-контент).
- SSO/BILife integration readiness (OI-003).
- Доступность бюджетов LLM.
- Назначенные владельцы контента.
- Golden Dataset >= 200 вопросов (OI-011).
