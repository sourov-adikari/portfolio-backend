# Portfolio API

Lightweight Express + TypeScript API for the portfolio frontend. Portfolio content is loaded from MongoDB, and the API is deployable as a Vercel serverless function.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

Set `MONGODB_URI` and `MONGODB_DATABASE` in `.env` before starting the API. The API listens on `http://localhost:5000` by default. Set SMTP values in `.env` to enable the contact endpoint.

## API endpoints

- `GET /api/health` — service status, uptime, environment, and timestamp
- `GET /api/portfolio` — complete portfolio dataset
- `GET /api/projects` — all projects and featured projects
- `GET /api/projects/:slug` — one project by slug
- `GET /api/skills` — technical skills, skill details, and professional traits
- `GET /api/experience` — career timeline
- `GET /api/education` — education timeline
- `GET /api/languages` — language proficiency
- `GET /api/socials` — social links
- `GET /api/services` — professional service/focus areas
- `GET /api/projects/github` — public GitHub repository data
- `POST /api/contact` — validated contact form submission

## Newsletter API

Subscribe an email address to the portfolio newsletter.

`POST /api/newsletter/subscribe`

Request (`Content-Type: application/json`):

```json
{
  "email": "user@example.com"
}
```

Successful subscription:

```json
{
  "success": true,
  "message": "Subscription successful",
  "status": "subscribed"
}
```

Already subscribed:

```json
{
  "success": true,
  "message": "You are already subscribed",
  "status": "already_subscribed"
}
```

Invalid email addresses return `400` with an `INVALID_NEWSLETTER_EMAIL` error. The endpoint is rate limited to 3 requests per minute and returns `429` when the limit is exceeded. Database failures return `503`, and subscription email delivery failures return `502`.

## Response format

Successful portfolio endpoints keep their existing top-level fields for frontend compatibility and also include:

```json
{
  "success": true,
  "dataField": "...",
  "meta": {
    "apiVersion": "1.0",
    "generatedAt": "..."
  }
}
```

Errors use a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  },
  "meta": {
    "requestId": "..."
  }
}
```

## Database collections

The API reads portfolio content from the configured MongoDB database. It does not use a local `data.ts` file or embed the complete portfolio dataset in the source code.

Collections used by the API:

- `personal_info` and `profile` — primary profile information
- `navigation` — ordered navigation items
- `skills`, `skill_details`, and `professional_traits` — skills and professional traits
- `services`, `experience`, `education`, and `languages` — portfolio history and services
- `socials` — social links
- `projects` — project catalog, including featured projects

Singleton collections such as `personal_info` and `profile` must contain a document with `key: "main"`. Ordered collections use the `order` field where applicable. GitHub repository results are fetched separately through `/api/projects/github` and are not stored in the portfolio collection automatically.
