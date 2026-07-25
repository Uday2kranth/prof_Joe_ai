import { MongoClient } from 'mongodb';

const DEFAULT_USERS = {
  "Admin@uday": { password: "Superm@n62", role: "admin" },
  "sai_kiran": { password: "kiransir@bava", role: "student" },
  "gagan": { password: "gagan@kranthi", role: "student" },
  "akash": { password: "labbe@kiransir", role: "student" },
  "sai_ram": { password: "sai@ram", role: "student" },
  "tharun": { password: "mama@kiransir", role: "student" },
  "ban": { password: "DataScientist", role: "student" },
  "balraj": { password: "labbe@kiransir", role: "guest_student" },
  "AV_Student": { password: "avcollege@student", role: "guest_student" },
  "uday01": { password: "uday@01", role: "guest" },
  "uday02": { password: "uday@02", role: "guest" },
  "uday03": { password: "uday@03", role: "guest" }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    let userMap = DEFAULT_USERS;
    if (process.env.AUTHORIZED_USERS_JSON) {
      try {
        userMap = JSON.parse(process.env.AUTHORIZED_USERS_JSON);
      } catch (e) {
        console.error('Failed to parse AUTHORIZED_USERS_JSON env', e);
      }
    }

    const matchedUser = userMap[username];
    if (!matchedUser || matchedUser.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    }

    // Optional MongoDB Audit logging
    if (process.env.MONGODB_URI) {
      try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('prof_joe_ai');
        await db.collection('user_logins').insertOne({
          username,
          role: matchedUser.role,
          loginTime: new Date(),
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });
        await client.close();
      } catch (dbErr) {
        console.error('MongoDB login audit failed:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        username,
        role: matchedUser.role,
        token: `prof-joe-${Date.now()}-${Buffer.from(username).toString('base64')}`
      }
    });
  } catch (err) {
    console.error('Login Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
