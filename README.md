# Jinso Live

Jinso Live is a standalone interactive product demo with four experiences:

- Student: The Dream Vacation Challenge, a branching B2 travel-agent role-play with three customer personalities, evidence-based progress tracking, and a recap.
- Teacher: an illustrative 25-learner classroom dashboard, learner drawers, and Ask Jinso.
- Institutional leader: an illustrative center-wide dashboard with period controls, trends, course drawers, and Ask Jinso.
- Ask Jinso Anything: a product-advisor conversation grounded in `content/product-knowledge.md`.

The application is intentionally not an LMS or company marketing site. It has no accounts, database, production learner data, or paid dependency in its default mode.

## Local setup

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Mock AI mode is automatic when `OPENAI_API_KEY` is absent.

Useful checks:

```bash
npm run typecheck
npm test
npm run build
```

## Configuration

Copy `.env.example` to `.env.local` only when configuration is needed.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CALENDLY_URL` | Overrides the Talk to Us booking link. It defaults to Jinso's confirmed Calendly URL. |
| `OPENAI_API_KEY` | Activates real server-side text AI. When absent, every experience uses the complete scripted mock mode. |
| `OPENAI_MODEL` | Optional model override; defaults to `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | Optional OpenAI-compatible base URL; defaults to the OpenAI API. |
| `AI_REQUESTS_PER_MINUTE` | Per-IP server limit; defaults to 8. |
| `AI_SESSION_MESSAGE_LIMIT` | Server-enforced conversation cap; defaults to 30. |

Never prefix the API key with `NEXT_PUBLIC_`. The browser sends chat messages only to `/api/chat`; credentials remain on the server. Adding `OPENAI_API_KEY` switches that route from mock replies to real replies without changing the UI or architecture. On Vercel, saving an environment-variable change normally triggers or requires a new deployment so the running server receives it; no source rebuild or redesign is needed.

## AI behavior and safeguards

`app/api/chat/route.ts` contains isolated instructions for student, teacher, institution, and general-product contexts. It validates inputs, keeps only a short message history, limits response length, applies a 15-second timeout, rate-limits by IP, caps a server-issued HTTP-only session, and avoids transcript persistence. The student response combines the in-character conversation, updated scenario state, and structured language evidence in one request.

The product advisor’s editable knowledge source is `content/product-knowledge.md`. Add only confirmed Jinso information there. Fictional datasets live in `lib/data.ts` and remain isolated from product claims.

The in-memory rate limiter is appropriate for this low-cost prototype, but production traffic across many serverless instances should use a shared rate-limit store before enabling a paid public endpoint.

## Deployment

The app is Vercel-ready as a standard Next.js project:

1. Import the repository into Vercel.
2. Leave `OPENAI_API_KEY` unset for the first full-demo review.
3. Optionally override `NEXT_PUBLIC_CALENDLY_URL` if Jinso's booking link changes.
4. Deploy and test all routes.
5. Later, add the company-owned `OPENAI_API_KEY` and optionally `OPENAI_MODEL`, then redeploy the same code.

Estimated operating cost in mock mode is only hosting/bandwidth within the selected Vercel plan. Real AI cost begins only after a key is configured and depends on model, usage, and provider pricing.

## Visual assets

The header uses the official logo supplied for this project at `public/jinso-logo.png`, preserving its original proportions. The Student experience uses three local, generated destination images in `public/destinations/`; uncatalogued destinations fall back to an elegant text-only card.

## Accessibility and responsive behavior

The app uses semantic buttons and dialogs, keyboard-focus styles, Escape-to-close drawers, accessible form labels, responsive dashboard stacking, mobile-friendly full-width detail drawers, and `prefers-reduced-motion` support. Voice controls are explicitly shown as unavailable rather than simulating microphone behavior.
