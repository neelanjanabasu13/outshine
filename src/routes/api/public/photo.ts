import { createFileRoute } from "@tanstack/react-router";

// Turns a Google Places photo reference into the real image without exposing the API key.
export const Route = createFileRoute("/api/public/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const name = new URL(request.url).searchParams.get("name") ?? "";
        if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)) return new Response("Bad photo", { status: 400 });
        const key = process.env["GOOGLE_PLACES_API_KEY"];
        if (!key) return new Response("Not set up", { status: 503 });
        const res = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=900&skipHttpRedirect=true&key=${key}`);
        if (!res.ok) return new Response("Not found", { status: 404 });
        const { photoUri } = (await res.json()) as { photoUri?: string };
        if (!photoUri) return new Response("Not found", { status: 404 });
        return new Response(null, { status: 302, headers: { Location: photoUri, "Cache-Control": "public, max-age=86400" } });
      },
    },
  },
});
