---
trigger: always_on
---

## Project Identity

This project is a professional full-stack web application built as a portfolio-quality software engineering project.

Commander Counter is a shared-device companion application for physical Magic: The Gathering Commander games.

The application is designed to help players manage the state of a game from a single shared device such as a phone, tablet, or laptop placed at the table.

It is **not** an online multiplayer platform.

It is **not** a rules engine.

It is **not** intended to synchronize multiple devices.

Always optimize architectural decisions for this shared-device experience.

---

## Development Philosophy

Prioritize:

- correctness
- maintainability
- simplicity
- extensibility
- readability
- production-quality code

Avoid unnecessary complexity.

Favor incremental implementation over large rewrites.

Design for future expansion without implementing future features prematurely.

Always prefer an MVP-first approach.

---

## Technology Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router

Backend

- ASP.NET Core Web API (.NET 10)
- C#
- Entity Framework Core

Database

- PostgreSQL

Infrastructure

- Docker
- Docker Compose

External Services

- Scryfall API

Do not introduce additional frameworks unless they provide a clear and significant benefit.

---

## Architectural Principles

The project follows Clean Architecture.

Responsibilities should remain clearly separated.

### Domain

Contains:

- business entities
- value objects
- enums
- domain rules

The Domain layer must never depend on infrastructure or UI.

### Application

Contains:

- use cases
- services
- DTOs
- validation
- interfaces

Application coordinates business logic but should not depend directly on Entity Framework.

### Infrastructure

Contains:

- Entity Framework Core
- PostgreSQL
- repository implementations
- Scryfall client
- external integrations

Infrastructure implements interfaces defined by the Application layer.

### API

Contains:

- controllers
- dependency injection
- middleware
- OpenAPI configuration

Controllers should remain thin.

Business logic belongs in Application services.

---

## Frontend Principles

Organize the frontend using a feature-based architecture.

Presentation components should remain independent from backend implementation details.

Never call APIs directly from UI components.

Use typed service modules for API communication.

Separate:

- persistent game state
- temporary UI state
- application settings
- API communication

Use Zustand only for client-side application state.

---

## Backend Principles

Prefer asynchronous operations.

Enable nullable reference types.

Validate all external input.

Do not expose Entity Framework entities through the API.

Always communicate using DTOs.

Prefer dependency injection over manual object creation.

---

## Persistence

Frontend persistence and backend persistence serve different purposes.

Frontend is responsible for immediate user experience and local recovery.

Backend is responsible for durable storage and synchronization with persistent data.

Never assume permanent internet connectivity during gameplay.

Design persistence so temporary offline operation remains possible.

---

## External APIs

The frontend must never communicate directly with Scryfall.

All Scryfall communication must occur through the backend.

Normalize external responses before exposing them to the frontend.

Avoid exposing unnecessary third-party fields.

---

## Code Quality

Prefer:

- small classes
- focused methods
- descriptive names
- composition over inheritance
- reusable components

Avoid:

- duplicated logic
- large controllers
- God objects
- premature optimization
- unnecessary abstractions

Introduce new dependencies only when clearly justified.

---

## User Experience

Gameplay speed has higher priority than visual complexity.

Optimize for:

- large touch targets
- fast interactions
- minimal navigation
- high readability
- responsive layouts

Desktop, tablet, and mobile must all remain first-class experiences.

---

## Permanent Constraints

Unless explicitly requested otherwise, do not introduce:

- authentication
- user accounts
- online multiplayer
- player sessions
- join codes
- SignalR
- WebSockets
- turn tracking
- phase tracking
- stack management
- complete Magic rules enforcement

Commander Counter is a game-state companion, not a digital implementation of Magic.

---

## Planning Guidance

When planning or implementing features:

- respect the existing architecture
- avoid unnecessary redesigns
- prefer extension over replacement
- identify architectural trade-offs
- document important technical decisions

Whenever multiple solutions are possible, recommend the simplest solution that satisfies the current requirements while remaining extensible.