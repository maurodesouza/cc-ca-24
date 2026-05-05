# Clean Code, Clean Architecture Course Project

This repository contains the code developed during a [course](https://www.branas.io/formacoes/arquitetura-de-software) focused on **Clean Code** and **Clean Architecture** principles applied to a distributed trading system.

The project explores topics such as:

- **Hexagonal Architecture**
- **Clean Architecture**
- **DDD (Domain-Driven Design)**
- **TDD (Test-Driven Development)**
- **Event-Driven Architecture**
- **API Composition**
- **CQRS**
- **RabbitMQ messaging**
- **Resilience patterns** like **Retry**, **Fallback**, and **Circuit Breaker**
- **Registry pattern** for dependency management
- **SOLID principles**

## Project Overview

The system is split into multiple services that communicate through HTTP and asynchronous events:

- **account-service**
  - Manages user account creation and publishing of account creation events.

- **order-service**
  - Handles deposits, withdrawals, and order placement.
  - Uses account references to validate whether an account exists.
  - Publishes order and balance events.

- **match-engine-service**
  - Matches buy and sell orders.
  - Emits order-filled events when trades happen.

- **projection-service**
  - Builds read models from events.
  - Exposes query endpoints for account balances and market depth.

- **frontend**
  - Consumes the backend APIs.

## Architectural Style

The project is intentionally organized to demonstrate how different architectural ideas can work together:

- **Domain layer** contains the core business rules.
- **Application layer** contains use cases and orchestration logic.
- **Infrastructure layer** contains external integrations such as databases, queues, and HTTP adapters.
- **Interface layer** contains HTTP and queue consumers/publishers.

## Main Concepts Demonstrated

### Clean Architecture

Business rules are kept independent from frameworks, databases, and external systems.

### Hexagonal Architecture

The application communicates with the outside world through ports and adapters.

### DDD

The domain model is designed around business entities such as:

- Accounts
- Wallets
- Orders
- Book / Depth models

### Event-Driven Architecture

Services communicate using events through RabbitMQ, reducing coupling and enabling asynchronous workflows.

### CQRS

Read and write concerns are separated through different models and repositories, especially in the projection service.

### Resilience Patterns

The project includes patterns to make external communication more robust:

- **Retry**: repeats a failing operation
- **Fallback**: tries alternative strategies when the primary one fails
- **Circuit Breaker**: prevents repeated failures from overwhelming the system

## Services and Ports

Typical local ports used by the project:

- **account-service**: `4156`
- **order-service**: `4157`
- **match-engine-service**: `4158`
- **projection-service**: `4159`
- **frontend**: depends on the local setup

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Docker and Docker Compose
- RabbitMQ
- MongoDB / PostgreSQL depending on the service being run

### Running the Project

First, start the infrastructure containers:

```bash
pnpm compose:up
```

Then use the root `Makefile` to start the services:

```bash
make dev
```

Each service can also be started individually from its own directory.

## Testing

The project includes unit and integration tests to support the TDD workflow.

Run tests from each service folder depending on what you want to validate.

## API Files

Several services include `request.http` files to help manually test endpoints during development.

## Notes

This repository is primarily educational. The goal is to demonstrate how to structure a real-world backend using clean architectural principles, event-driven communication, and strong testing practices.
