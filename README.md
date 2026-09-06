# Portfolio API

Lightweight Express + TypeScript API for the portfolio frontend. It uses curated TypeScript data, has no database or authentication, and is deployable as a Vercel serverless function.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default. Set SMTP values in `.env` to enable the contact endpoint.

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

## Data organization

- `src/data/data.ts` contains profile, navigation, skills, traits, services, experience, education, languages, and social data.
- `src/data/projects.ts` contains the detailed project catalog.
- Repeated presentation copy should be avoided; project-specific details belong in the project record, while reusable profile information belongs in the profile data.

The project data is manually curated. GitHub repository results are only available through the separate GitHub endpoint and are not merged into the curated project catalog automatically.
