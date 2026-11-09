# KOA Game Client

A React interface for a multiplayer strategy game prototype. The client connects to the [KOA Game Server](https://github.com/King1121-sudo/koa-mmo-server) to display a world map, send attack marches, and exchange alliance messages.

**Status:** Early prototype. The interface and API integration are implemented, but the companion server has known authentication blockers described below.

## Features

- Login form and authenticated API requests.
- Interactive terrain map with player cities and active march destinations.
- Player inspection and attack march controls.
- Alliance chat and player notifications through Socket.IO.
- Map and march refresh every three seconds after login.

## Stack

JavaScript · React 19 · Vite 8 · Axios · Socket.IO client

## Local development

Use Node.js 22.12 or later and npm. Set up the [companion server](https://github.com/King1121-sudo/koa-mmo-server#local-development) on `http://localhost:3000` first.

```bash
git clone https://github.com/King1121-sudo/koa-client.git
cd koa-client
npm ci
npm run dev
```

Open the local URL printed by Vite. There is no registration form; the server exposes `POST /auth/register` with a JSON body containing `username` and `password`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production bundle |
| `npm run preview` | Preview the built bundle locally |
| `npm run lint` | Run ESLint |

## Project structure

- `src/App.jsx` — login, map rendering, marches, chat, and notifications.
- `src/main.jsx` — React entry point.
- `vite.config.js` — Vite and React plugin configuration.

## Current limitations

- API and Socket.IO URLs are hardcoded to `http://localhost:3000`; the chat uses alliance ID `1`.
- The server currently imports an undeclared `bcryptjs` dependency and reads a different JWT claim from the one it signs. Resolve those server issues before expecting authenticated map and player requests to work.
- Map updates use polling; chat and notifications use sockets. Authentication state is held in memory and resets on page reload.
- Attack controls currently send a fixed march of 100 Infantry. Account registration, troop training, and alliance management have no client forms.
- No automated test suite or hosted demo is included. Build and lint scripts do not verify the complete client/server flow.

## Related project

[KOA Game Server](https://github.com/King1121-sudo/koa-mmo-server) provides the Express API, PostgreSQL persistence, game logic, and Socket.IO events.
