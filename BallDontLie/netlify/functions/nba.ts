// netlify/functions/nba.ts
import type { Handler } from "@netlify/functions";

const BASE = "https://v2.nba.api-sports.io";

export const handler: Handler = async (event) => {
  try {
    const apiKey = process.env.NBA_API_KEY; // Set this on Netlify (Site settings → Environment variables)
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing NBA_API_KEY on server" }),
      };
    }

    // Build target URL from the function path and query string
    // e.g. /.netlify/functions/nba/teams?season=2024 -> https://v2.nba.api-sports.io/teams?season=2024
    const pathPart = (event.path || "").replace(/.*\/nba/, ""); // strip "/.netlify/functions/nba"
    const qs = event.rawQuery ? `?${event.rawQuery}` : "";
    const url = `${BASE}${pathPart}${qs}`;

    const init: RequestInit = {
      method: event.httpMethod,
      // Pass body for POST/PUT/PATCH, etc.
      body:
        event.httpMethod !== "GET" &&
        event.httpMethod !== "HEAD" &&
        event.body
          ? event.isBase64Encoded
            ? Buffer.from(event.body, "base64")
            : event.body
          : undefined,
      headers: {
        // Force the required headers to the upstream
        "x-apisports-key": apiKey,
        accept: "application/json",
        // Optional: pass content-type if client sent it
        ...(event.headers["content-type"]
          ? { "content-type": event.headers["content-type"] }
          : {}),
      },
    };

    const resp = await fetch(url, init);
    const text = await resp.text(); // return as-is (JSON or error string)

    return {
      statusCode: resp.status,
      headers: {
        "content-type": resp.headers.get("content-type") || "application/json",
        // CORS for your site; tighten as needed
        "access-control-allow-origin": "*",
      },
      body: text,
    };
  } catch (err: any) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Upstream fetch failed", detail: err?.message }),
    };
  }
};
