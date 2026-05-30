import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "emily@gentlepawz.ca";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingPayload {
  customer_name: string;
  customer_email: string;
  pet_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  dropoff_time: string | null;
  notes: string | null;
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

function buildEmailHtml(booking: BookingPayload): string {
  const startFormatted = formatDate(booking.start_date);
  const endFormatted = formatDate(booking.end_date);

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
                New Booking Request
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">
                Hi Emily! A new booking request has been submitted. Here are the details:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f5;border-radius:12px;border:1px solid #e8e2da;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:40%;">Customer</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${booking.customer_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Email</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">
                          <a href="mailto:${booking.customer_email}" style="color:#7c5e3c;text-decoration:none;">${booking.customer_email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Pet Name</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🐕 ${booking.pet_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Service</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${booking.service_type === "boarding" ? "🌙 Boarding" : "☀️ Day Care"}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Start Date</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${startFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">End Date</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${endFormatted}</td>
                      </tr>
                      ${booking.dropoff_time ? `
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Drop-off Time</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">🕐 ${booking.dropoff_time}</td>
                      </tr>
                      ` : ""}
                      ${booking.notes ? `
                      <tr>
                        <td style="padding:8px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Notes</td>
                        <td style="padding:8px 0;color:#333;font-size:15px;font-weight:500;">${booking.notes}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 16px;">
                    <a href="https://gentlepawz.ca/admin" style="display:inline-block;background:linear-gradient(135deg,#7c5e3c 0%,#a67c52 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      View in Admin Panel →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#faf8f5;border-top:1px solid #e8e2da;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                This is an automated notification from Gentle Pawz Booking System.
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
    const booking: BookingPayload = await req.json();

    // Validate required fields
    if (!booking.customer_name || !booking.customer_email || !booking.pet_name || !booking.service_type || !booking.start_date || !booking.end_date) {
      return new Response(
        JSON.stringify({ error: "Missing required booking fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildEmailHtml(booking);
    const startFormatted = formatDate(booking.start_date);
    const endFormatted = formatDate(booking.end_date);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Gentle Pawz Bookings <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `🐾 New Booking: ${booking.pet_name} — ${booking.service_type} (${startFormatted} to ${endFormatted})`,
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
