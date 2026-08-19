let IN_MEMORY_PERSONA_SESSIONS = {};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const mongodbUri = process.env.MONGODB_URI;

  if (req.method === 'GET') {
    const { username, token } = req.query || {};
    if (!username) {
      return res.status(400).json({ error: 'Username query parameter is required' });
    }

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');

        // Verify active token for non-admin single-device restriction
        if (token) {
          const activeDoc = await db.collection('active_device_tokens').findOne({ username });
          if (activeDoc && activeDoc.role !== 'admin' && activeDoc.token && activeDoc.token !== token) {
            await client.close();
            return res.status(403).json({
              success: false,
              displaced: true,
              error: 'Logged out: Your account was logged in on another device.'
            });
          }
        }

        const doc = await db.collection('user_persona_sessions').findOne({ username });
        await client.close();

        if (doc && doc.sessions) {
          return res.status(200).json({ success: true, sessions: doc.sessions });
        }
      } catch (err) {
        console.error('MongoDB fetch persona sessions failed:', err.message);
      }
    }

    // Fallback to in-memory store
    const sessions = IN_MEMORY_PERSONA_SESSIONS[username] || [];
    return res.status(200).json({ success: true, sessions });
  }

  if (req.method === 'POST') {
    const { username, sessions } = req.body || {};
    if (!username || !Array.isArray(sessions)) {
      return res.status(400).json({ error: 'Username and sessions array are required in body' });
    }

    // Save to in-memory store
    IN_MEMORY_PERSONA_SESSIONS[username] = sessions;

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');
        await db.collection('user_persona_sessions').updateOne(
          { username },
          { $set: { username, sessions, updatedAt: new Date() } },
          { upsert: true }
        );
        await client.close();
      } catch (err) {
        console.error('MongoDB save persona sessions failed:', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Cloud persona sessions saved successfully.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
