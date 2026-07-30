# ADR-0002: AI Orchestrator как отдельный сервис
- Status: accepted
- Date: 2026-03-10

## Context

Платформа должна быть независима от конкретного LLM-провайдера и управлять prompt/version policy централизованно.

## Decision

Выделить AI Orchestrator как отдельный сервис между API и LLM providers.

## Alternatives Considered

- Прямые вызовы LLM из каждого сервиса: быстрее на старте, но высокий coupling и сложность аудита.

## Consequences

- Плюсы: vendor abstraction, единый guardrail, единый аудит.
- Минусы: дополнительная latency и операционная сложность.
