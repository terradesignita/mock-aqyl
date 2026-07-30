# Цели и KPI

Навигация: [[01_Readme]] | [[02_О_чем_проект]] | [[15_План_релизов_и_roadmap]]

Версия: v1.2 | Дата: 2026-04-20

## Бизнес-цели

- Сократить время поиска управленческих инсайтов.
- Повысить повторное использование корпоративных знаний.
- Ускорить внедрение лучших практик в операционную деятельность.

## Технические цели

- Построить отказоустойчивый ingestion/processing pipeline (chunk 220 токенов / overlap 40 / dedup threshold 0.94).
- Обеспечить объяснимые AI-ответы с ссылками на источники (citation coverage >= 95%).
- Контролировать стоимость LLM при росте пользователей через маршрутизацию (OpenAI → Anthropic → Google → Ollama).
- Поддерживать два scope: INTERNAL (полный RAG) и EXTERNAL (NotebookLM для HBS-контента).

## KPI (пилот, до 31 июля 2026)

| Метрика | Цель | Формула |
|---|---:|---|
| Time-to-Card | <= 30 мин | `t(card_ready) - t(file_uploaded)` |
| Auto-processing rate | >= 85% | `auto_success / total_ingested` |
| Search helpfulness | >= 4.2/5 | Средний рейтинг результатов поиска |
| MAU (Top-100) | >= 60% | `active_30d / 100` |
| Citation coverage | >= 95% | `answers_with_citations / total_answers` |
| P95 API latency | <= 1.5 сек | P95 на `GET /api/v1/search` |

## SLO (production target)

- Доступность API: `99.5%` в месяц.
- Ошибки 5xx: `< 1%` запросов.
- Задержка индексации: `95%` документов в индексе за `<= 20 минут`.
- Ошибки pipeline jobs: `< 3%` jobs/day.

## Анти-метрики

- Рост стоимости без роста полезности (cost-per-active-user растет >20% QoQ).
- Рост доли ответов без цитат.
- Увеличение доли ручной обработки >30%.

## Инструменты измерения

- Product analytics: события в API (`query_logs` таблица — действия LOGIN, UPLOAD, SEARCH, ASK_CARD, ASK_DOCUMENT, ASK_GLOBAL, GENERATE_CARD, EXPORT, DELETE).
- Observability: метрики и трейсы (см. [[13_Наблюдаемость_и_SRE]]).
- Финансовый контроль: LLM token/cost dashboard (см. [[26_FinOps_для_LLM]]).
- AI eval: Golden Dataset >= 200 вопросов (см. [[25_AI_Governance_и_Evaluation]]).
- Endpoint `/api/v1/metrics` — агрегированные показатели платформы в реальном времени (total_cases, studied_cases, artifacts_generated, questions_asked, activity за 7 дней).
