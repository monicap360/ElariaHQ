import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM_PHONE;
const notifyTo = process.env.AGENT_NOTIFY_PHONE;

async function sendSms(message: string) {
  if (!twilioAccountSid || !twilioAuthToken || !twilioFrom || !notifyTo) {
    return;
  }

  const payload = new URLSearchParams({
    To: notifyTo,
    From: twilioFrom,
    Body: message,
  });

  const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });
}

export async function notifyAgentUpdate(agentName: string, message: string) {
  await supabase.from("agent_updates").insert({
    agent_name: agentName,
    message,
  });

  await sendSms(`[${agentName}] ${message}`);
}
