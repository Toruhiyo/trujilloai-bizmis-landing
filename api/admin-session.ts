import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, timingSafeEqual } from "node:crypto";

// Checks the admin password on the server. It used to be a VITE_ variable, and every VITE_
// value is compiled into the public JavaScript, so anyone could read it from the bundle.
// The admin pages themselves still ship in the bundle; this gate only keeps the password
// private and stops casual access.

const NOT_CONFIGURED_STATUS = 503;

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

// Hashing both sides first gives equal-length buffers, so the comparison takes the same
// time whatever the length of the guess.
function passwordMatches(candidate: string, configured: string): boolean {
  return timingSafeEqual(sha256(candidate), sha256(configured));
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false });
    return;
  }

  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    res.status(NOT_CONFIGURED_STATUS).json({ ok: false });
    return;
  }

  const candidate = typeof req.body?.password === "string" ? req.body.password : "";
  if (!passwordMatches(candidate, configured)) {
    res.status(401).json({ ok: false });
    return;
  }

  res.status(200).json({ ok: true });
}
