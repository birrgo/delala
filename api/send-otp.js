export default async function handler(req, res) {
  // 1. Set CORS Headers to allow requests from your frontend app
  // FIX: 'Access-Control-Allow-Credentials' removed to prevent CORS conflict with '*'
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle HTTP OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp, name } = req.body;

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // Stored in Vercel Environment Variables
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Delala App',
          email: 'support@hulum.online' // Must match authenticated domain
        },
        to: [{ email: email, name: name || 'User' }],
        subject: `${otp} is your Delala Verification Code`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verification Code</h2>
            <p>Your OTP code for Delala registration is:</p>
            <h1 style="color: #10b981; letter-spacing: 4px;">${otp}</h1>
            <p>This code expires in 15 minutes.</p>
          </div>
        `
      })
    });

    const data = await brevoResponse.json();

    if (!brevoResponse.ok) {
      return res.status(400).json({ success: false, error: data.message || 'Brevo API error' });
    }

    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
