const BACKEND_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json(
        data?.detail || data?.error || { error: res.statusText },
        { status: res.status }
      );
    }
    return Response.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Backend request failed";
    return Response.json(
      { error: msg, detail: "Is the backend running? (cd backend && uvicorn main:app --reload)" },
      { status: 502 }
    );
  }
}
