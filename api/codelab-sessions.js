let IN_MEMORY_CODELAB_SESSIONS = {};

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

        // Verify active token for single-device security restriction
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

        const doc = await db.collection('user_codelab_sessions').findOne({ username });
        await client.close();

        if (doc && doc.presetSessions) {
          return res.status(200).json({ success: true, presetSessions: doc.presetSessions });
        }
      } catch (err) {
        console.error('MongoDB fetch codelab sessions failed:', err.message);
      }
    }

    // Fallback to in-memory store
    const presetSessions = IN_MEMORY_CODELAB_SESSIONS[username] || {};
    return res.status(200).json({ success: true, presetSessions });
  }

  if (req.method === 'POST') {
    const { username, presetSessions } = req.body || {};
    if (!username || !presetSessions || typeof presetSessions !== 'object') {
      return res.status(400).json({ error: 'Username and presetSessions object are required in body' });
    }

    // Save to in-memory store
    IN_MEMORY_CODELAB_SESSIONS[username] = presetSessions;

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');
        await db.collection('user_codelab_sessions').updateOne(
          { username },
          { $set: { username, presetSessions, updatedAt: new Date() } },
          { upsert: true }
        );
        await client.close();
      } catch (err) {
        console.error('MongoDB save codelab sessions failed:', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Cloud Code Lab preset sessions saved successfully.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
