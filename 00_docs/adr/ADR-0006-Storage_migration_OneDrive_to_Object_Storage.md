# ADR-0006: Хранилище файлов — OneDrive (MVP) → Object Storage (Production)
- Status: accepted
- Date: 2026-03-10

## Context

Для MVP необходимо быстро начать ingestion имеющихся материалов, которые уже находятся в OneDrive корпоративной подписки Microsoft 365. Полноценное Object Storage (S3-совместимое) требует инфраструктурного времени на настройку и IAM.

При масштабировании OneDrive ограничивает: API rate limits (10 000 req/day для SharePoint), слабая поддержка presigned URLs, ограниченные lifecycle policies.

## Decision

### MVP (до 31 мая 2026)

- Использовать **OneDrive/SharePoint** как источник файлов через Microsoft Graph API.
- Ingestion pipeline: batch-scan папки `01_in/` → download → process → store chunks в Vector DB.
- Бинарные файлы после обработки хранятся в PostgreSQL (bytea) или временно на локальном диске processing-сервиса.

### Production (Wave 2, июнь 2026+)

- Мигрировать на **Azure Blob Storage** (приоритет — уже в Microsoft-экосистеме) или **AWS S3**.
- Файлы: оригиналы документов, промежуточные артефакты OCR/ASR, аудио.
- Lifecycle policy: архивировать оригиналы в cold storage через 90 дней после последнего доступа.

### Триггеры для миграции (хотя бы одно):

| Триггер | Порог |
|---|---|
| Объём файлов | > 50 GB |
| Активных пользователей | > 200 |
| Graph API rate limit errors | > 1% запросов за сутки |
| Wave 2 go-live дата | 1 июня 2026 |

### Процедура миграции

1. Параллельное сканирование — ingestion работает с обоих источников одновременно.
2. Сравнение контрольных сумм (SHA256) для верификации полноты переноса.
3. Переключение connectors в конфиге (feature flag `storage_backend=azure_blob|onedrive`).
4. OneDrive остаётся read-only источником ещё 30 дней после переключения.
5. Отключение OneDrive connector после подтверждения.

## Alternatives Considered

1. **Сразу Azure Blob Storage**: правильное решение долгосрочно, но требует 2-4 недели на IAM, network peering, CORS — не вписывается в MVP timeline.
2. **PostgreSQL Large Objects**: простота, но не масштабируется на >10GB.
3. **MinIO (self-hosted S3)**: полный контроль, но операционная нагрузка на команду неприемлема для MVP.

## Consequences

- **Плюсы MVP**: нулевые инфраструктурные затраты на хранение, быстрый старт.
- **Минусы MVP**: Graph API rate limits, нет presigned URLs для direct download, версионирование через SharePoint (непредсказуемо).
- **Плюсы Production**: S3-совместимый API, presigned URLs, lifecycle policies, CDN-интеграция, object-level audit log.
- **Технический долг**: migration script должен быть написан и протестирован до Wave 1 go-live, даже если само переключение происходит позже.
