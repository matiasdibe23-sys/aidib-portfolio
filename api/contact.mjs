// Vercel Function (backend) for the contact form.
// Flow: browser form -> POST /api/contact -> this function -> Resend API -> owner's inbox.
// Secrets come from environment variables, never from the browser:
//   RESEND_API_KEY  (required)  API key created in the Resend dashboard
//   CONTACT_TO      (required)  inbox that receives messages
//   CONTACT_FROM    (optional)  defaults to Resend's shared test sender

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid request" }, 400);
    }

    // Honeypot: real users never see this field; bots fill it. Pretend success, send nothing.
    if (typeof data.website === "string" && data.website.trim() !== "") {
      return json({ ok: true });
    }

    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const message = String(data.message ?? "").trim();

    if (!name || name.length > 100) return json({ ok: false, error: "Please enter your name." }, 400);
    if (!EMAIL_RE.test(email) || email.length > 200) return json({ ok: false, error: "Please enter a valid email." }, 400);
    if (message.length < 10 || message.length > 5000) return json({ ok: false, error: "Message must be 10–5000 characters." }, 400);

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;
    if (!apiKey || !to) {
      console.error("Missing RESEND_API_KEY or CONTACT_TO");
      return json({ ok: false, error: "Server is not configured." }, 500);
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Portfolio contact from ${name.replace(/[\r\n]+/g, " ")}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!resp.ok) {
      console.error("Resend error", resp.status, await resp.text());
      return json({ ok: false, error: "Could not send your message. Please try again later." }, 502);
    }
    return json({ ok: true });
  },
};
