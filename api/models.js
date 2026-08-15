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
                fetchUrl = 'https://gen.pollinations.ai/v1/models';
                if (keyStr && keyStr !== 'keyless_anonymous') {
                    headers['Authorization'] = `Bearer ${keyStr.split(',')[0].trim()}`;
                }
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
            if (provider === 'sambanova') {
                return res.status(200).json({
                    success: true,
                    provider: 'sambanova',
                    count: 2,
                    models: [
                        { id: 'MiniMax-M2.7', name: 'MiniMax M2.7 [Free Quota]', isFree: true },
                        { id: 'gemma-4-31B-it', name: 'Gemma 4 31B [Free Quota]', isFree: true }
                    ]
                });
            }
            if (provider === 'ollama') {
                return res.status(200).json({
                    success: true,
                    provider: 'ollama',
                    count: 7,
                    models: [
                        { id: 'gpt-oss:20b', name: 'GPT-OSS 20B [Free]', isFree: true },
                        { id: 'gpt-oss:120b', name: 'GPT-OSS 120B [Free]', isFree: true },
                        { id: 'gemma4:31b', name: 'Gemma 4 31B [Free]', isFree: true },
                        { id: 'nemotron-3-nano:30b', name: 'Nemotron 3 Nano 30B [Free]', isFree: true },
                        { id: 'nemotron-3-super', name: 'Nemotron 3 Super 120B [Free]', isFree: true },
                        { id: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra 550B [Free]', isFree: true },
                        { id: 'minimax-m3', name: 'MiniMax M3 [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'mistral') {
                return res.status(200).json({
                    success: true,
                    provider: 'mistral',
                    count: 7,
                    models: [
                        { id: 'mistral-large-latest', name: 'Mistral Large [Free Tier]', isFree: true },
                        { id: 'mistral-medium-latest', name: 'Mistral Medium 3.5 [Free Tier]', isFree: true },
                        { id: 'mistral-small-latest', name: 'Mistral Small [Free Tier]', isFree: true },
                        { id: 'codestral-latest', name: 'Codestral [Free Tier]', isFree: true },
                        { id: 'ministral-8b-latest', name: 'Ministral 8B [Free Tier]', isFree: true },
                        { id: 'ministral-3b-latest', name: 'Ministral 3B [Free Tier]', isFree: true },
                        { id: 'devstral-medium-latest', name: 'Devstral Medium Agent [Free Tier]', isFree: true }
                    ]
                });
            }
            if (provider === 'nararouter') {
                return res.status(200).json({
                    success: true,
                    provider: 'nararouter',
                    count: 4,
                    models: [
                        { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash [Free Router]', isFree: true },
                        { id: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent [Free Router]', isFree: true },
                        { id: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash [Free Router]', isFree: true },
                        { id: 'tencent-hy3-free', name: 'Tencent Hunyuan 3 [Free Router]', isFree: true }
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
            
            if (provider === 'gemini') {
                id = id.replace(/^models\//, '');
                name = name.replace(/^models\//, '');
            }

            const contextLength = m.context_length || m.context_window || m.input_token_limit || m.inputTokenLimit || undefined;
            
            let isFree = false;
            let freeTag = '';

            if (provider === 'openrouter') {
                const isPromptZero = m.pricing && (m.pricing.prompt === '0' || m.pricing.prompt === 0);
                if (isPromptZero || id.endsWith(':free') || id === 'openrouter/free') {
                    isFree = true;
                    freeTag = '[Free]';
                }
            } else if (provider === 'gemini') {
                if (id.includes('flash') || id.includes('gemma') || id.includes('lite') || id.includes('3.5') || id.includes('3.6') || id.includes('3.7')) {
                    isFree = true;
                    freeTag = '[Free Quota]';
                }
            } else if (provider === 'groq') {
                isFree = true;
                freeTag = '[Free Tier]';
            } else if (provider === 'mistral') {
                const activeMistralModels = ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest', 'ministral-8b-latest', 'ministral-3b-latest', 'ministral-14b-latest', 'devstral-medium-latest', 'mistral-code-agent-latest'];
                if (activeMistralModels.includes(id) || id.includes('mistral') || id.includes('codestral') || id.includes('devstral')) {
                    isFree = true;
                    freeTag = '[Free Tier]';
                }
            } else if (provider === 'sambanova') {
                const activeSambaModels = ['MiniMax-M2.7', 'gemma-4-31B-it', 'gemma-4-31b-it'];
                if (activeSambaModels.includes(id)) {
                    isFree = true;
                    freeTag = '[Free Quota]';
                }
            } else if (provider === 'opencode') {
                if (id.endsWith('-free')) {
                    isFree = true;
                    freeTag = '[Free]';
                }
            } else if (provider === 'local_endpoint' || provider === 'local') {
                isFree = true;
                freeTag = '[Local Free]';
            } else if (provider === 'ollama') {
                const freeOllamaModels = ['gpt-oss:20b', 'gpt-oss:120b', 'gemma4:31b', 'nemotron-3-nano:30b', 'nemotron-3-super', 'nemotron-3-ultra', 'minimax-m3'];
                if (freeOllamaModels.includes(id) || id.includes('free')) {
                    isFree = true;
                    freeTag = '[Free]';
                }
            } else if (provider === 'pollinations' || provider === 'pollinations-keyed') {
                const freePolliModels = ['vendouple/laguna-s-2.1:free', 'YoannDev90/diffusiongemma-26b-a4b-it:free', 'chirag-gamer/gpt-oss-120b', 'guus6457/solar-pro-4', 'guus6457/ling-2.6-flash', 'chigwell/llm7-fast'];
                if (freePolliModels.includes(id) || id.includes(':free') || id.includes('-free')) {
                    isFree = true;
                    freeTag = '[Free]';
                }
            } else if (provider === 'nararouter') {
                const activeNaraModels = ['agnes-2.5-flash', 'laguna-s-2.1', 'agnes-2.0-flash', 'tencent-hy3-free'];
                if (activeNaraModels.includes(id) || id.includes('free') || id.includes('agnes') || id.includes('laguna') || id.includes('tencent')) {
                    isFree = true;
                    freeTag = '[Free Router]';
                }
            }

            // Clean redundant existing brackets and parentheses and append clean freeTag
            let cleanName = name
                .replace(/\s*\((free|free tier|keyless)\)/gi, '')
                .replace(/\s*\[(Free|Free Quota|Free Tier|Local Free|Local \/ Free|Free Router|WS)\]/gi, '')
                .trim();
            if (freeTag && !cleanName.includes(freeTag)) {
                cleanName = `${cleanName} ${freeTag}`;
            }

            return {
                id,
                name: cleanName || id,
                isFree,
                contextLength
            };
        }).filter(m => m.id && m.id.length > 0)
        .sort((a, b) => {
            // Sort free models to top
            if (a.isFree && !b.isFree) return -1;
            if (!a.isFree && b.isFree) return 1;
            return a.name.localeCompare(b.name);
        });

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
