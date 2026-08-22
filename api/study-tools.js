let IN_MEMORY_STUDY_TOOLS = {};

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

        const doc = await db.collection('user_study_tools').findOne({ username });
        await client.close();

        if (doc) {
          return res.status(200).json({
            success: true,
            pins: doc.pins || [],
            flashcardDecks: doc.flashcardDecks || [],
            quizDecks: doc.quizDecks || []
          });
        }
      } catch (err) {
        console.error('MongoDB fetch study tools failed:', err.message);
      }
    }

    // Fallback to in-memory store
    const local = IN_MEMORY_STUDY_TOOLS[username] || { pins: [], flashcardDecks: [], quizDecks: [] };
    return res.status(200).json({
      success: true,
      pins: local.pins || [],
      flashcardDecks: local.flashcardDecks || [],
      quizDecks: local.quizDecks || []
    });
  }

  if (req.method === 'POST') {
    const { username, pins, flashcardDecks, quizDecks } = req.body || {};
    if (!username) {
      return res.status(400).json({ error: 'Username is required in body' });
    }

    // Save to in-memory store
    const existing = IN_MEMORY_STUDY_TOOLS[username] || { pins: [], flashcardDecks: [], quizDecks: [] };
    IN_MEMORY_STUDY_TOOLS[username] = {
      pins: Array.isArray(pins) ? pins : existing.pins,
      flashcardDecks: Array.isArray(flashcardDecks) ? flashcardDecks : existing.flashcardDecks,
      quizDecks: Array.isArray(quizDecks) ? quizDecks : existing.quizDecks
    };

    if (mongodbUri) {
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongodbUri);
        await client.connect();
        const db = client.db('prof_joe_ai');

        const updateFields = { username, updatedAt: new Date() };
        if (Array.isArray(pins)) updateFields.pins = pins;
        if (Array.isArray(flashcardDecks)) updateFields.flashcardDecks = flashcardDecks;
        if (Array.isArray(quizDecks)) updateFields.quizDecks = quizDecks;

        await db.collection('user_study_tools').updateOne(
          { username },
          { $set: updateFields },
          { upsert: true }
        );
        await client.close();
      } catch (err) {
        console.error('MongoDB save study tools failed:', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Cloud study tools saved successfully.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
