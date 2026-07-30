# ADR-0003: Гибридный поиск keyword+vector
- Status: accepted
- Date: 2026-03-10

## Context

Чистый keyword-поиск теряет семантические связи, чистый vector-поиск иногда теряет точные термины.

## Decision

Использовать hybrid retrieval с re-ranking.

## Alternatives Considered

- Только BM25.
- Только vector kNN.

## Consequences

- Плюсы: лучшая полнота и точность.
- Минусы: выше вычислительная стоимость и сложнее тюнинг.
