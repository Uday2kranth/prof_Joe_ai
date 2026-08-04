let IN_MEMORY_USER_KEYS = {};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const mongodbUri = process.env.MONGODB_URI;

  if (req.method === 'GET') {
    const { username } = req.query || {};
    if (!username) {
      return res.status(400).json({ error: 'Username query parameter is required' });
    }

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');
        const doc = await db.collection('user_api_keys').findOne({ username });
        await client.close();

        if (doc && doc.keys) {
          return res.status(200).json({ success: true, keys: doc.keys });
        }
      } catch (err) {
        console.error('MongoDB fetch keys failed:', err.message);
      }
    }

    // Fallback to in-memory store
    const keys = IN_MEMORY_USER_KEYS[username] || {};
    return res.status(200).json({ success: true, keys });
  }

  if (req.method === 'POST') {
    const { username, keys } = req.body || {};
    if (!username || !keys) {
      return res.status(400).json({ error: 'Username and keys are required in body' });
    }

    // Save to in-memory store
    IN_MEMORY_USER_KEYS[username] = keys;

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');
        await db.collection('user_api_keys').updateOne(
          { username },
          { $set: { username, keys, updatedAt: new Date() } },
          { upsert: true }
        );
        await client.close();
      } catch (err) {
        console.error('MongoDB save keys failed:', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Cloud API keys saved successfully.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
