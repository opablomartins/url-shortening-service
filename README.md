# URL Shortener API

A RESTful API for shortening URLs, built with NestJS, TypeScript, and PostgreSQL.

## Technologies

- **[NestJS](https://nestjs.com/)** — Node.js framework with modular architecture and built-in dependency injection
- **[TypeScript](https://www.typescriptlang.org/)** — Static typing for safer, more maintainable code
- **[TypeORM](https://typeorm.io/)** — ORM with native NestJS integration
- **[PostgreSQL](https://www.postgresql.org/)** — Relational database
- **[nanoid](https://github.com/ai/nanoid)** — Cryptographically secure unique ID generator for short codes
- **[Swagger](https://swagger.io/)** — Interactive API documentation
- **[Docker](https://www.docker.com/)** — Containerized development and deployment

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)

### Running with Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/opablomartins/url-shortening-service.git
cd url-shortening-service

# Start the application and database
docker-compose up --build
```

The API will be available at `http://localhost:3000`.  
Interactive Swagger docs at `http://localhost:3000/docs`.

### Running locally

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env

# Start a PostgreSQL instance (or use Docker just for the DB)
docker-compose up db -d

# Start in development mode (with hot reload)
npm run start:dev
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Application port |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASS` | `postgres` | PostgreSQL password |
| `DB_NAME` | `url_shortener` | PostgreSQL database name |
| `DB_SYNCHRONIZE` | `true` | Force TypeORM schema sync (`true`/`false`) |
| `THROTTLE_TTL` | `60000` | Rate limit window in milliseconds |
| `THROTTLE_LIMIT` | `10` | Max requests per window per IP |

## API Endpoints

### Create Short URL

```
POST /shorten
```

**Request body:**
```json
{
  "url": "https://www.example.com/some/long/url"
}
```

**Response `201 Created`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "xK9mNp",
  "createdAt": "2026-04-07T12:00:00.000Z",
  "updatedAt": "2026-04-07T12:00:00.000Z"
}
```

---

### Retrieve Original URL

```
GET /shorten/:code
```

Increments the access counter on every call.

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "xK9mNp",
  "createdAt": "2026-04-07T12:00:00.000Z",
  "updatedAt": "2026-04-07T12:00:00.000Z"
}
```

---

### Update Short URL

```
PUT /shorten/:code
```

**Request body:**
```json
{
  "url": "https://www.example.com/updated/url"
}
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://www.example.com/updated/url",
  "shortCode": "xK9mNp",
  "createdAt": "2026-04-07T12:00:00.000Z",
  "updatedAt": "2026-04-07T13:00:00.000Z"
}
```

---

### Delete Short URL

```
DELETE /shorten/:code
```

**Response `204 No Content`**

---

### Redirect to Original URL

```
GET /:code
```

Although the specification suggests that the frontend handles redirection,
this endpoint was also implemented to simulate real-world URL shortening
services and improve user experience. It increments the access counter and
issues an HTTP 301 redirect directly to the original URL.

**Response `302 Found`** — redirects to the original URL

> Uses 302 (temporary redirect) intentionally so browsers never cache the response, ensuring every visit is counted in `accessCount`.

---

### Get URL Statistics

```
GET /shorten/:code/stats
```

**Response `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "xK9mNp",
  "createdAt": "2026-04-07T12:00:00.000Z",
  "updatedAt": "2026-04-07T12:00:00.000Z",
  "accessCount": 10
}
```

### Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 404,
  "message": "Short code \"xK9mNp\" not found",
  "error": "Not Found",
  "path": "/shorten/xK9mNp",
  "timestamp": "2026-04-07T12:00:00.000Z"
}
```

| Status | Meaning |
|---|---|
| `400` | Validation error (invalid URL format, unexpected fields) |
| `404` | Short code not found |
| `409` | Failed to generate a unique short code |
| `429` | Rate limit exceeded (10 req/min per IP) |

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov
```

## Project Structure

```
src/
├── modules/
│   └── url/
│       ├── dto/
│       │   ├── create-url.dto.ts      # POST body validation
│       │   ├── update-url.dto.ts      # PUT body validation
│       │   └── url-response.dto.ts    # Default response shape (without accessCount)
│       ├── entities/
│       │   └── url.entity.ts          # TypeORM entity mapping the urls table
│       ├── url.controller.ts          # HTTP layer — routes only, no business logic
│       ├── url.service.ts             # Business logic and short code generation
│       ├── url.repository.ts          # Database access layer
│       ├── url.service.spec.ts        # Unit tests for UrlService
│       └── url.module.ts
├── common/
│   └── filters/
│       └── global-exception.filter.ts # Centralized error handling
├── database/
│   └── database.module.ts             # TypeORM async configuration
├── app.module.ts
└── main.ts
```

## Technical Decisions

### NestJS
Chosen for its modular architecture, native dependency injection, built-in support for Swagger and testing, and widespread adoption in enterprise Node.js environments.

### TypeORM with `synchronize`
`synchronize` can be controlled with `DB_SYNCHRONIZE`. If this variable is not provided, the app falls back to enabling sync only in non-production environments.

### nanoid for short codes
`nanoid(6)` generates a 6-character URL-safe string with ~68 billion possible combinations, making collisions extremely rare. A retry mechanism (up to 3 attempts) handles the unlikely event of a collision.

### Separated read/write in repository
`findByCode` (read) and `incrementAccessCount` (write) are intentionally separate methods. This follows the principle of separating reads from writes, making each operation independently testable and easier to optimize (e.g., caching reads in the future).

### Response shape separation
`UrlResponseDto` is used for create/retrieve/update responses, deliberately excluding `accessCount`. The stats endpoint returns the full entity. This enforces a clean API contract and prevents leaking internal counters where they are not expected.

### Rate limiting
`@nestjs/throttler` is configured as a global guard (10 requests/minute per IP by default), protecting all endpoints uniformly without any per-route configuration. Values are configurable via environment variables.
