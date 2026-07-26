export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    let userMap = {};
    if (process.env.AUTHORIZED_USERS_JSON) {
      try {
        const parsed = JSON.parse(process.env.AUTHORIZED_USERS_JSON);
        if (parsed && typeof parsed === 'object') {
          userMap = parsed;
        }
      } catch (e) {
        console.error('Failed to parse AUTHORIZED_USERS_JSON env', e);
      }
    }

    let matchedUser = userMap[username];

    // Fallback environment variable checks for admin login if AUTHORIZED_USERS_JSON is not configured
    if (!matchedUser && process.env.ADMIN_USERNAME && username === process.env.ADMIN_USERNAME) {
      if (password === (process.env.ADMIN_PASSWORD || 'Superm@n62')) {
        matchedUser = { role: 'admin' };
      }
    }

    // Default development fallback check if env vars are completely unconfigured
    if (!matchedUser && !process.env.AUTHORIZED_USERS_JSON && !process.env.ADMIN_USERNAME) {
      const allowedRoles = {
        'Admin@uday': 'admin',
        'Sai_Kiran': 'student',
        'Gagan': 'student',
        'Akash': 'student',
        'Sai_Ram': 'student',
        'Tharun': 'student',
        'Ban': 'student',
        'Balraj': 'guest_student',
        'AV_Student': 'guest_student',
        'uday01': 'guest',
        'uday02': 'guest',
        'uday03': 'guest'
      };
      if (username in allowedRoles) {
        matchedUser = { role: allowedRoles[username], password };
      }
    }

    if (!matchedUser || (matchedUser.password && matchedUser.password !== password)) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    }

    const userToken = `prof-joe-${Date.now()}-${Buffer.from(username).toString('base64')}`;

    // Optional MongoDB Audit & Single-Device Token Registration
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('prof_joe_ai');
        
        await db.collection('user_logins').insertOne({
          username,
          role: matchedUser.role,
          loginTime: new Date(),
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        // Enforce single-device session token for non-admin users
        if (matchedUser.role !== 'admin') {
          await db.collection('active_device_tokens').updateOne(
            { username },
            { $set: { username, token: userToken, role: matchedUser.role, updatedAt: new Date() } },
            { upsert: true }
          );
        }

        await client.close();
      } catch (dbErr) {
        console.error('MongoDB login audit & active token update failed:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        username,
        role: matchedUser.role,
        token: userToken
      }
    });
  } catch (err) {
    console.error('Login Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
