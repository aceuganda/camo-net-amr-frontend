import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SENTRY_HOST = "o910629.ingest.us.sentry.io";
const SENTRY_PROJECT_ID = "4510390394159104";
const MAX_BODY_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const headerEnd = body.indexOf(0x0a);
  const headerLine = new TextDecoder().decode(
    headerEnd === -1 ? body : body.subarray(0, headerEnd),
  );

  let dsn: URL;
  try {
    dsn = new URL(JSON.parse(headerLine).dsn);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const projectId = dsn.pathname.replace(/^\//, "");
  if (dsn.hostname !== SENTRY_HOST || projectId !== SENTRY_PROJECT_ID) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const upstream = await fetch(
      `https://${SENTRY_HOST}/api/${SENTRY_PROJECT_ID}/envelope/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-sentry-envelope" },
        body,
      },
    );

    const headers = new Headers();
    for (const name of ["retry-after", "x-sentry-rate-limits"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(null, { status: upstream.status, headers });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
