# Наблюдаемость и SRE

Навигация: [[01_Readme]] | [[03_Цели_и_KPI]] | [[12_Инфраструктура_и_DevOps]]

Версия: v1.2 | Дата: 2026-04-20

## Наблюдаемость

Три сигнала:
- `Metrics` — бизнес и платформенные метрики.
- `Logs` — структурированные логи через `structlog` (используется в `ingestion.py`, `wiki.py`, `search.py`).
- `Traces` — распределённая трассировка (план: OpenTelemetry).

## Встроенный endpoint метрик

`GET /api/v1/metrics` возвращает агрегированные показатели из таблицы `query_logs`:

```json
{
  "total_cases": 142,
  "studied_cases": 38,
  "artifacts_generated": 24,
  "questions_asked": 187,
  "activity": [
    {"date": "2026-04-14", "questions": 12, "generations": 3},
    ...
  ]
}
```

Activity — за последние 7 дней, с заполнением нулями для дней без активности.

## Ключевые SLI

| SLI | Описание |
|---|---|
| API availability | Доля успешных запросов |
| API latency (P50/P95/P99) | Задержка по эндпоинтам |
| Ingestion success rate | Доля документов со статусом `INDEXED` |
| Index freshness lag | Время от загрузки до появления в поиске |
| LLM error rate | Доля неуспешных вызовов AI-провайдера |
| Cost per request | Токены × цена модели |
| Wiki lint pass rate | Доля wiki-страниц со статусом `passing` |
| Pipeline job error rate | Доля `pipeline_jobs` со статусом `failed` |

## SLO

- Доступность: `99.5%`.
- P95 `GET /api/v1/search`: `<= 1.5s`.
- Ошибки pipeline: `< 3%` jobs/day.
- Задержка индексации: `95%` документов в индексе за `<= 20 минут`.

## Статусы pipeline_jobs (мониторинг)

Таблица `pipeline_jobs` отслеживает:

| Статус | Значение |
|---|---|
| `queued` | Ожидает исполнения |
| `running` | В работе |
| `completed` | Успешно завершён |
| `failed` | Завершён с ошибкой |

Поля для диагностики: `attempts`, `error_message`, `started_at`, `finished_at`.

## Статусы обработки документов

Из `ProcessingStatus` enum в `backend/models/enums.py`:

| Статус | Значение |
|---|---|
| `DISCOVERED` | Обнаружен |
| `QUEUED` | В очереди |
| `PROCESSING` | Обрабатывается |
| `INDEXED` | Проиндексирован |
| `FAILED` | Ошибка |
| `QUARANTINED` | Карантин |
| `DUPLICATE` | Дубликат |

## Alerting policy

- `P1`: платформа недоступна / массовая деградация / утечка данных.
- `P2`: частичная недоступность функционала.
- `P3`: некритичные регрессии и тренды.

## Минимальные дашборды

- **Product dashboard**: MAU, usage (total_cases, questions_asked), helpfulness.
- **Platform dashboard**: CPU, memory, queue lag (`pipeline_jobs`), DB health.
- **AI dashboard**: token usage, latency, groundedness, refusal rate, LLM provider error rate.
- **Security dashboard**: auth failures, policy denials, anomaly spikes (`query_logs`).
- **Wiki dashboard**: wiki_pages count по scope/type, lint_status distribution.

## Incident management

1. Детект (алерт).
2. Триаж и назначение Incident Commander.
3. Коммуникация статуса каждые 30 минут.
4. Восстановление сервиса (feature flag / circuit breaker / rollback).
5. Postmortem за 48 часов.

## Health endpoint

`GET /api/v1/health` — проверка состояния сервиса (используется в Docker healthcheck):

```python
test: ["CMD", "python", "-c",
  "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8040/api/health', timeout=3).read()"]
```

## Пример SLI-запроса

```promql
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{route="/api/v1/search"}[5m])) by (le))
```
