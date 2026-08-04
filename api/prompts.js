import { MongoClient } from 'mongodb';

async function getDbClient() {
  if (!process.env.MONGODB_URI) return null;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query || req.body || {};
  const client = await getDbClient();

  if (!client) {
    return res.status(200).json({ success: true, customPrompts: [], storage: 'local' });
  }

  try {
    const db = client.db('prof_joe_ai');
    const promptsCol = db.collection('user_custom_prompts');

    if (req.method === 'GET') {
      const customPrompts = await promptsCol.find({ username }).sort({ createdAt: -1 }).toArray();
      await client.close();
      return res.status(200).json({ success: true, customPrompts });
    }

    if (req.method === 'POST') {
      const { prompt } = req.body;
      if (!prompt || !prompt.title || !prompt.promptText) {
        await client.close();
        return res.status(400).json({ error: 'Valid prompt object with title and text required' });
      }

      const newPrompt = {
        id: prompt.id || `prompt-${Date.now()}`,
        username,
        title: prompt.title,
        promptText: prompt.promptText,
        category: prompt.category || 'Custom User Prompt',
        createdAt: Date.now()
      };

      await promptsCol.updateOne(
        { id: newPrompt.id, username },
        { $set: newPrompt },
        { upsert: true }
      );

      await client.close();
      return res.status(200).json({ success: true, prompt: newPrompt });
    }

    if (req.method === 'DELETE') {
      const { promptId } = req.body || req.query;
      if (!promptId) {
        await client.close();
        return res.status(400).json({ error: 'Prompt ID required' });
      }

      await promptsCol.deleteOne({ id: promptId, username });
      await client.close();
      return res.status(200).json({ success: true, message: 'Custom prompt deleted' });
    }

    await client.close();
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    if (client) await client.close();
    console.error('Custom Prompts API Error:', err);
    return res.status(500).json({ error: err.message || 'Database error' });
  }
}
