# How to run PinkRibbon

Use **two separate terminals**. The backend runs until you stop it; use the second terminal for the frontend.

**Easiest (from project root):**

- **Terminal 1:** `./run-backend.sh`
- **Terminal 2:** `./run-frontend.sh`

---

## Terminal 1 — Backend (leave this running)

From the **project root** (`medical-tracker`):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see: `Uvicorn running on http://127.0.0.1:8000`. **Leave this terminal open.** Stop with `Ctrl+C` when you're done.

---

## Terminal 2 — Frontend

Open a **new terminal**. From the **project root** (`medical-tracker`):

```bash
cd frontend
npm install
npm run dev
```

You should see: `Local: http://localhost:3000`. Open that URL in your browser.

---

## If you're in the wrong folder

- **Backend:** `requirements.txt` and `uvicorn` must run **inside** the `backend` folder. If you see "No such file or directory: requirements.txt", run `cd backend` first (from project root).
- **Frontend:** `npm run dev` must run **inside** the `frontend` folder. If you're in `backend`, run `cd ../frontend` then `npm run dev`. If you're in project root, run `cd frontend` then `npm run dev`.

## Quick reference

| Where you are      | To start backend              | To start frontend             |
|--------------------|-------------------------------|-------------------------------|
| Project root       | `cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000` | `cd frontend && npm run dev` |
| Already in backend | `pip install -r requirements.txt && uvicorn main:app --reload --port 8000` | `cd ../frontend && npm run dev` |
| Already in frontend | `cd ../backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000` | `npm run dev`                 |
