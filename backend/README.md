# Shopsense Backend

Go API for shopsense. Handles auth, products, cart.

## Stack
- **Gin** - HTTP framework
- **GORM** - ORM for database ops
- **Turso/libsql** - Database

## Running

```bash
make build      # compile the binary
make build-prod # optimized build for production
make run        # start the server
make watch      # hot reload (requires air)
make clean      # remove build artifacts
```

## Env (all required)
- `CORS_ORIGINS`: Comma separated list of allowed CORS origins
- `SESSION_SECRET`: Secret for signing session cookies
- `DB_URL`: Database connection URL
- `DB_AUTH_TOKEN`: Auth token for the database
- `PORT`: Port to run the server on
