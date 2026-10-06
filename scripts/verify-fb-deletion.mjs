import fs from 'fs';
import crypto from 'crypto';

async function verify() {
  console.log('Starting verification...');

  // 1. Read .env
  let appSecret = '';
  // Default to 3000 if not set, but respect what's likely running
  let appUrl = 'http://localhost:3000'; 

  try {
    if (fs.existsSync('.env')) {
        const envConfig = fs.readFileSync('.env', 'utf8');
        for (const line of envConfig.split('\n')) {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key === 'FACEBOOK_CLIENT_SECRET') appSecret = value;
                // if (key === 'NEXT_PUBLIC_APP_URL') appUrl = value; // Use localhost for test usually
            }
        }
    }
  } catch (e) {
    console.error('Could not read .env file:', e);
  }

  if (!appSecret) {
    console.error('Error: FACEBOOK_CLIENT_SECRET not found in .env');
    // For demo purposes, if secret is missing, we might fail or mock it if we were mocking the server too.
    // But since we are testing the real server, we need the real secret.
    process.exit(1);
  }

  console.log('Using Secret:', appSecret.substring(0, 5) + '...');

  // 2. Construct Signed Request
  const payload = {
    user_id: 'test_user_123',
    algorithm: 'HMAC-SHA256',
    issued_at: Math.floor(Date.now() / 1000),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const sig = crypto
    .createHmac('sha256', appSecret)
    .update(payloadBase64)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const signedRequest = `${sig}.${payloadBase64}`;

  // 3. Send Request
  const targetUrl = `${appUrl}/api/facebook/deletion`;
  console.log(`Sending POST to ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ signed_request: signedRequest }),
    });

    console.log('Response Status:', res.status);
    
    if (res.ok) {
        const data = await res.json();
        console.log('Response Data:', data);
        if (data.url && data.confirmation_code) {
            console.log('SUCCESS: Verification Passed!');
        } else {
            console.log('WARNING: Response missing expected fields.');
        }
    } else {
        const text = await res.text();
        console.log('Response Body:', text);
        console.log('FAILURE: Server returned error status.');
    }

  } catch (error) {
    console.error('Network Error:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    console.log('HINT: Is the development server running on localhost:3000?');
  }
}

verify();
