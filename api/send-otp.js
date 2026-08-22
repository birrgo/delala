// api/send-otp.js
export default async function handler(req, res) {
  // Allow CORS headers if calling from frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  // Generate a 6-digit random OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { 
          name: "Hulum App", 
          email: "support@hulum.online" 
        },
        to: [{ email: email }],
        subject: "Your OTP Verification Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333333;">Verification Code</h2>
            <p style="color: #666666; font-size: 15px;">Your one-time password (OTP) for Hulum App is:</p>
            <div style="background-color: #f4f4f7; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 6px;">${otpCode}</span>
            </div>
            <p style="color: #888888; font-size: 13px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully!'
      });
    } else {
      return res.status(400).json({ success: false, error: data });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
