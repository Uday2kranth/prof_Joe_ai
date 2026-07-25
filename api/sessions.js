import { MongoClient } from 'mongodb';

async function getDbClient() {
  if (!process.env.MONGODB_URI) return null;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  const { username } = req.query || req.body || {};
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const client = await getDbClient();
  if (!client) {
    // Graceful fallback if MongoDB is not connected
    return res.status(200).json({ success: true, sessions: [], storage: 'local' });
  }

  try {
    const db = client.db('prof_joe_ai');
    const sessionsCol = db.collection('chat_sessions');

    if (req.method === 'GET') {
      const userSessions = await sessionsCol.find({ username }).sort({ updatedAt: -1 }).toArray();
      await client.close();
      return res.status(200).json({ success: true, sessions: userSessions });
    }

    if (req.method === 'POST') {
      const { session } = req.body;
      if (!session || !session.id) {
        await client.close();
        return res.status(400).json({ error: 'Valid session payload required' });
      }

      await sessionsCol.updateOne(
        { id: session.id, username },
        { $set: { ...session, username, updatedAt: Date.now() } },
        { upsert: true }
      );

      await client.close();
      return res.status(200).json({ success: true, message: 'Session saved to MongoDB' });
    }

    if (req.method === 'DELETE') {
      const { sessionId } = req.body || req.query;
      if (!sessionId) {
        await client.close();
        return res.status(400).json({ error: 'Session ID required for deletion' });
      }

      await sessionsCol.deleteOne({ id: sessionId, username });
      await client.close();
      return res.status(200).json({ success: true, message: 'Session deleted from MongoDB' });
    }

    await client.close();
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    if (client) await client.close();
    console.error('Sessions API Error:', err);
    return res.status(500).json({ error: err.message || 'Database error' });
  }
}
