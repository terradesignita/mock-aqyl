# ADR-0004: Strict grounded mode по умолчанию
- Status: proposed
- Date: 2026-03-10

## Context

Для корпоративных решений критична проверяемость ответа и снижение галлюцинаций.

## Decision

По умолчанию включить strict grounded mode: ответ только при наличии достаточного evidence set.

## Alternatives Considered

- Разрешить answer-by-default без обязательных citations.

## Consequences

- Плюсы: меньше риск фактических ошибок.
- Минусы: выше доля ответов `insufficient_evidence` на старте.
