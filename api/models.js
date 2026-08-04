export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { provider, apiKey, customEndpoint } = req.body || {};

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required.' });
        }

        let fetchUrl = '';
        const headers = { 'Content-Type': 'application/json' };

        const keyStr = typeof apiKey === 'string' ? apiKey : (apiKey ? String(apiKey) : '');

        if (keyStr && keyStr !== 'keyless_anonymous') {
            const firstKey = keyStr.split(',')[0].trim();
            headers['Authorization'] = `Bearer ${firstKey}`;
            headers['x-api-key'] = firstKey;
            headers['api-key'] = firstKey;
        }

        switch (provider) {
            case 'openrouter':
                fetchUrl = 'https://openrouter.ai/api/v1/models';
                break;
            case 'pollinations':
            case 'pollinations-keyed':
            case 'pollinations-keyless':
                fetchUrl = 'https://gen.pollinations.ai/v1/models';
                delete headers['Authorization'];
                break;
            case 'ollama':
                fetchUrl = 'https://api.ollama.com/v1/models';
                break;
            case 'local_endpoint':
            case 'local':
                fetchUrl = customEndpoint ? (customEndpoint.endsWith('/api/tags') ? customEndpoint : `${customEndpoint.replace(/\/$/, '')}/api/tags`) : 'http://localhost:11434/api/tags';
                delete headers['Authorization'];
                break;
            case 'gemini':
                const gKey = keyStr ? keyStr.split(',')[0].trim() : '';
                fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${gKey}`;
                delete headers['Authorization'];
                delete headers['x-api-key'];
                delete headers['api-key'];
                break;
            case 'groq':
                fetchUrl = 'https://api.groq.com/openai/v1/models';
                break;
            case 'nvidia':
                fetchUrl = 'https://integrate.api.nvidia.com/v1/models';
                break;
            case 'mistral':
                fetchUrl = 'https://api.mistral.ai/v1/models';
                break;
            case 'cerebras':
                fetchUrl = 'https://api.cerebras.ai/v1/models';
                break;
            case 'sambanova':
                fetchUrl = 'https://api.sambanova.ai/v1/models';
                break;
            case 'nararouter':
                fetchUrl = 'https://router.bynara.id/v1/models';
                break;
            case 'huggingface':
                fetchUrl = 'https://router.huggingface.co/v1/models';
                break;
            case 'opencode':
                fetchUrl = 'https://opencode.ai/zen/v1/models';
                break;
            case 'poolside':
                fetchUrl = 'https://api.poolside.ai/v1/models';
                break;
            default:
                return res.status(400).json({ error: `Unsupported provider for model fetching: ${provider}` });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers,
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            if (provider === 'ollama') {
                return res.status(200).json({
                    success: true,
                    provider: 'ollama',
                    count: 9,
                    models: [
                        { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash (Ollama Cloud/Local)', isFree: true },
                        { id: 'deepseek-v3', name: 'DeepSeek V3 (Ollama Cloud/Local)', isFree: true },
                        { id: 'deepseek-r1', name: 'DeepSeek R1 (Ollama Cloud/Local)', isFree: true },
                        { id: 'deepseek-r1:70b', name: 'DeepSeek R1 70B (Ollama)', isFree: true },
                        { id: 'llama3.3', name: 'Llama 3.3 70B (Ollama)', isFree: true },
                        { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Ollama)', isFree: true },
                        { id: 'mistral-nemo', name: 'Mistral Nemo (Ollama)', isFree: true },
                        { id: 'phi4', name: 'Phi-4 (Ollama)', isFree: true },
                        { id: 'gemma2', name: 'Gemma 2 (Ollama)', isFree: true }
                    ]
                });
            }
            const errText = await response.text().catch(() => '');
            return res.status(response.status).json({
                error: `Failed to fetch models from ${provider} (HTTP ${response.status}): ${errText.substring(0, 150)}`
            });
        }

        const data = await response.json();
        let rawModels = [];

        if (Array.isArray(data)) {
            rawModels = data;
        } else if (data.data && Array.isArray(data.data)) {
            rawModels = data.data;
        } else if (data.models && Array.isArray(data.models)) {
            rawModels = data.models;
        } else if (data.result && Array.isArray(data.result)) {
            rawModels = data.result;
        }

        const normalizedModels = rawModels.map(m => {
            let id = typeof m === 'string' ? m : (m.id || m.name || m.model || '');
            let name = typeof m === 'string' ? m : (m.displayName || m.name || m.id || m.model || id);
            
            if (provider === 'gemini' && id.startsWith('models/')) {
                id = id.replace(/^models\//, '');
            }
            if (provider === 'gemini' && name.startsWith('models/')) {
                name = name.replace(/^models\//, '');
            }

            const contextLength = m.context_length || m.context_window || m.input_token_limit || m.inputTokenLimit || undefined;
            const isFree = id.includes('free') || id.includes('keyless') || m.pricing?.prompt === '0';

            return {
                id,
                name: name || id,
                isFree,
                contextLength
            };
        }).filter(m => m.id && m.id.length > 0);

        return res.status(200).json({
            success: true,
            provider,
            count: normalizedModels.length,
            models: normalizedModels
        });

    } catch (err) {
        console.error('Error fetching live models:', err);
        if (req.body && req.body.provider === 'ollama') {
            return res.status(200).json({
                success: true,
                provider: 'ollama',
                count: 9,
                models: [
                    { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash (Ollama Cloud/Local)', isFree: true },
                    { id: 'deepseek-v3', name: 'DeepSeek V3 (Ollama Cloud/Local)', isFree: true },
                    { id: 'deepseek-r1', name: 'DeepSeek R1 (Ollama Cloud/Local)', isFree: true },
                    { id: 'deepseek-r1:70b', name: 'DeepSeek R1 70B (Ollama)', isFree: true },
                    { id: 'llama3.3', name: 'Llama 3.3 70B (Ollama)', isFree: true },
                    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder (Ollama)', isFree: true },
                    { id: 'mistral-nemo', name: 'Mistral Nemo (Ollama)', isFree: true },
                    { id: 'phi4', name: 'Phi-4 (Ollama)', isFree: true },
                    { id: 'gemma2', name: 'Gemma 2 (Ollama)', isFree: true }
                ]
            });
        }
        return res.status(500).json({
            error: err.name === 'AbortError' 
                ? 'Request timed out while fetching provider models.' 
                : `Network error: ${err.message}`
        });
    }
}
