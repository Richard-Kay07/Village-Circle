# VillageCircle360 frontend (Next.js)

## Run the app locally

**`ERR_CONNECTION_REFUSED` almost always means the dev server is not running** (or you opened the wrong port). Follow these steps in order.

### 1. Install dependencies (required once per clone)

```bash
cd frontend
npm install
```

If you skip this, `npm run dev` will fail or nothing will listen on localhost.

### 2. Start the dev server

```bash
npm run dev
```

Wait until the terminal shows something like:

```text
▲ Next.js ...
- Local: http://localhost:5784
✓ Ready in ...
```

### 3. Open the **exact** URL from the terminal

Default port is **5784** (backend API uses **3000**, so the web app is not on 3000).

- Open: **http://localhost:5784**

If your terminal shows a **different** port (e.g. because 5784 was busy), use **that** URL instead.

### 4. If the port is already in use

```bash
npm run dev -- -p 3003
```

Then open **http://localhost:3003**.

---

## Quick checks

| Problem | What to do |
|--------|------------|
| Connection refused | Run `npm install`, then `npm run dev`. Keep the terminal open. |
| Wrong page | Use the URL printed by Next.js (often `:5784`, not `:3000`). |
| `npm: command not found` | Install [Node.js](https://nodejs.org/) (LTS) so `npm` is on your PATH. |
| Still failing | From `frontend/`, run `npx next dev -p 5784` and read the error output. |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **5784** |
| `npm run dev:3001` | Dev server on port 3001 (if you need it) |
| `npm run build` | Production build |
| `npm run start` | Production server (after `build`) on 5784 |
