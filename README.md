# Shopsense Backend Architecture

This document outlines the high-level technical architecture, internal systems, and design decisions for the Shopsense backend service.

## Core Architecture

The system is built as a monolithic Go service (v1.24.3) leveraging the `gin-gonic/gin` HTTP framework. It uses a structured layout separating routing, authentication, and database layers (`internal/server`, `internal/auth`, and `internal/database`). The build process is orchestrated via a `Makefile` supporting optimized production builds (`-tags netgo -ldflags '-s -w'`) and a hot-reloading development pipeline via `air`.

## Database & Persistence Layer

The application utilizes a distributed edge SQLite architecture via Turso. 
- **ORM Integration**: Uses `gorm.io/gorm` with the `libsql-client-go` driver, allowing standard SQLite syntax to seamlessly interface with remote Turso instances over HTTP/WSS.
- **Relational Integrity**: Enforces strict cascading deletions at the database level (e.g., `OnDelete:CASCADE` constraint between `Cart` and `CartItem`) to maintain referential integrity without application-layer cleanup logic.
- **Bootstrapping**: Implements an automatic data seeding mechanism on startup. It fetches payload data from `fakestoreapi.com` and executes `FirstOrCreate` operations to populate the persistent product catalog if empty.
- **Health Telemetry**: The database layer exposes detailed telemetry (via `/health`), evaluating internal `sql.DB` connection pool metrics such as `OpenConnections`, `MaxIdleClosed`, and `WaitCount` to detect latency bottlenecks or pool exhaustion dynamically.

## Authentication & Security

Authentication is stateful and relies on secure, HTTP-only cookies.
- **Session Management**: Implements `gorilla/sessions` with a secure cookie store (`SameSiteNoneMode` enabled, `Secure` flags set for cross-origin compliance). 
- **Cryptography**: User passwords are computationally hashed utilizing `golang.org/x/crypto/bcrypt` before storage.
- **Middleware**: Custom Gin middleware intercepts protected routes, unwraps the session cookie, performs strict type-assertions on the stored `user_id` (handling `uint`, `int64`, and `string` interoperability), and propagates the authenticated context to downstream handlers.

## Lifecycle Management

The service guarantees data integrity during termination events via a Graceful Shutdown implementation.
- Captures OS-level interrupts (`SIGINT`, `SIGTERM`) using `signal.NotifyContext`.
- Blocks immediate process termination, allowing the HTTP server to drain in-flight requests within a strict 5-second timeout context.
- Safely terminates active database connections and goroutines before exiting the main process.
