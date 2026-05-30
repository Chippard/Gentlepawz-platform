import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusPayload {
  customer_email: string;
  customer_name: string;
  pet_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  dropoff_time: string | null;
  status: "confirmed" | "cancelled";
}

/**
 * Format a date string (ISO or yyyy-MM-dd) as "July 15, 2026".
 * Handles both "2026-07-15" and "2026-07-15T00:00:00+00:00" formats.
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  // Strip time component if present, then parse as local date to avoid
  // timezone-shift issues (e.g. "2026-07-15T00:00:00+00:00" → "2026-07-15")
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildConfirmedHtml(payload: StatusPayload): string {
  const startFormatted = formatDate(payload.start_date);
  const endFormatted = formatDate(payload.end_date);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f6f3;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f6f3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c5e3c 0%, #a67c52 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                🐾 Gentle Pawz
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Booking Confirmed!
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">
                Hi ${payload.customer_name}! Great news — your booking has been confirmed! 🎉
              </p>

              <!-- Success Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 24px;">
                      <span style="color:#065f46;font-size:14px;font-weight:600;">✅ Booking Confirmed</span>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f5;border-radius:12px;border:1px solid #e8e2da;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:40%;">Pet</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🐕 ${payload.pet_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Service</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${payload.service_type === "boarding" ? "🌙 Boarding" : "☀️ Day Care"}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Start Date</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${startFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">End Date</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${endFormatted}</td>
                      </tr>
                      ${payload.dropoff_time ? `
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Drop-off Time</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🕐 ${payload.dropoff_time}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#333;font-size:16px;line-height:1.6;font-weight:500;">
                Your booking has been confirmed! See you on ${startFormatted}! 🐾
              </p>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                If you have any questions or need to make changes, feel free to reach out to us at
                <a href="mailto:emily@gentlepawz.ca" style="color:#7c5e3c;text-decoration:none;font-weight:500;">emily@gentlepawz.ca</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#faf8f5;border-top:1px solid #e8e2da;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                Gentle Pawz — Boutique Dog Boarding & Day Care
              </p>
              <p style="margin:4px 0 0;color:#bbb;font-size:11px;">
                <a href="https://gentlepawz.ca" style="color:#a67c52;text-decoration:none;">gentlepawz.ca</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCancelledHtml(payload: StatusPayload): string {
  const startFormatted = formatDate(payload.start_date);
  const endFormatted = formatDate(payload.end_date);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f6f3;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f6f3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c5e3c 0%, #a67c52 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                🐾 Gentle Pawz
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Booking Update
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">
                Hi ${payload.customer_name},
              </p>

              <!-- Status Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 24px;">
                      <span style="color:#991b1b;font-size:14px;font-weight:600;">❌ Booking Not Approved</span>
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f5;border-radius:12px;border:1px solid #e8e2da;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:40%;">Pet</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🐕 ${payload.pet_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Service</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${payload.service_type === "boarding" ? "🌙 Boarding" : "☀️ Day Care"}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Requested Dates</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${startFormatted} — ${endFormatted}</td>
                      </tr>
                      ${payload.dropoff_time ? `
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Drop-off Time</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🕐 ${payload.dropoff_time}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#333;font-size:16px;line-height:1.6;">
                Unfortunately your booking was not approved. Please contact us for more info.
              </p>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                You can reach Emily directly at
                <a href="mailto:emily@gentlepawz.ca" style="color:#7c5e3c;text-decoration:none;font-weight:500;">emily@gentlepawz.ca</a>
                to discuss alternative dates or arrangements.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#faf8f5;border-top:1px solid #e8e2da;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                Gentle Pawz — Boutique Dog Boarding & Day Care
              </p>
              <p style="margin:4px 0 0;color:#bbb;font-size:11px;">
                <a href="https://gentlepawz.ca" style="color:#a67c52;text-decoration:none;">gentlepawz.ca</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: StatusPayload = await req.json();

    // Validate required fields
    if (!payload.customer_email || !payload.customer_name || !payload.pet_name || !payload.service_type || !payload.start_date || !payload.end_date || !payload.status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["confirmed", "cancelled"].includes(payload.status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status. Must be 'confirmed' or 'cancelled'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = payload.status === "confirmed"
      ? buildConfirmedHtml(payload)
      : buildCancelledHtml(payload);

    const startFormatted = formatDate(payload.start_date);
    const endFormatted = formatDate(payload.end_date);

    const subject = payload.status === "confirmed"
      ? `✅ Booking Confirmed — ${payload.pet_name} (${startFormatted} to ${endFormatted})`
      : `Booking Update — ${payload.pet_name} (${startFormatted} to ${endFormatted})`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Gentle Pawz <${FROM_EMAIL}>`,
        to: [payload.customer_email],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
