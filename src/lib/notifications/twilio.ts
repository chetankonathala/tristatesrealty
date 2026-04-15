// Minimal Twilio REST client (no SDK to keep deps small)
export async function sendListingAlertSms(opts: {
  to: string;
  searchName: string;
  matchCount: number;
  firstListingUrl: string;
}): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("[twilio] credentials not set, skipping SMS");
    return;
  }

  const body =
    opts.matchCount === 1
      ? `Tri States Realty: 1 new home matches '${opts.searchName}'. ${opts.firstListingUrl}`
      : `Tri States Realty: ${opts.matchCount} new homes match '${opts.searchName}'. ${opts.firstListingUrl}`;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: opts.to, From: from, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    console.error("[twilio] send failed:", res.status, await res.text());
  }
}
