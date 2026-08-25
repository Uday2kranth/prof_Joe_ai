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
        const timeoutDuration = (provider === 'local_endpoint' || provider === 'local') ? 2500 : 15000;
        const timeout = setTimeout(() => controller.abort(), timeoutDuration);

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers,
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            if (provider === 'gemini') {
                return res.status(200).json({
                    success: true,
                    provider: 'gemini',
                    count: 7,
                    models: [
                        { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash [Free]', isFree: true },
                        { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash [Free]', isFree: true },
                        { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash [Free]', isFree: true },
                        { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite [Free]', isFree: true },
                        { id: 'gemma-4-31b-it', name: 'Gemma 4 31B [Free]', isFree: true },
                        { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B [Free]', isFree: true },
                        { id: 'gemini-flash-latest', name: 'Gemini Flash Latest [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'groq') {
                return res.status(200).json({
                    success: true,
                    provider: 'groq',
                    count: 6,
                    models: [
                        { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B [Free]', isFree: true },
                        { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B Reasoning [Free]', isFree: true },
                        { id: 'groq/compound', name: 'Groq Compound Agent [Free]', isFree: true },
                        { id: 'groq/compound-mini', name: 'Groq Compound Mini [Free]', isFree: true },
                        { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B [Free]', isFree: true },
                        { id: 'allam-2-7b', name: 'Allam 2 7B [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'cerebras') {
                return res.status(200).json({
                    success: true,
                    provider: 'cerebras',
                    count: 3,
                    models: [
                        { id: 'llama-3.3-70b', name: 'Llama 3.3 70B [Cerebras Fast]', isFree: true },
                        { id: 'llama3.1-8b', name: 'Llama 3.1 8B [Cerebras Fast]', isFree: true },
                        { id: 'llama3.1-70b', name: 'Llama 3.1 70B [Cerebras Fast]', isFree: true }
                    ]
                });
            }
            if (provider === 'nvidia') {
                return res.status(200).json({
                    success: true,
                    provider: 'nvidia',
                    count: 5,
                    models: [
                        { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct [NVIDIA NIM]', isFree: true },
                        { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B Instruct [NVIDIA NIM]', isFree: true },
                        { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct [NVIDIA NIM]', isFree: true },
                        { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2 [NVIDIA NIM]', isFree: true },
                        { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 [NVIDIA NIM]', isFree: true }
                    ]
                });
            }
            if (provider === 'pollinations' || provider === 'pollinations-keyed') {
                return res.status(200).json({
                    success: true,
                    provider: 'pollinations',
                    count: 5,
                    models: [
                        { id: 'openai', name: 'OpenAI GPT-4o Mini [Pollinations]', isFree: true },
                        { id: 'deepseek', name: 'DeepSeek V3 [Pollinations]', isFree: true },
                        { id: 'mistral', name: 'Mistral Small [Pollinations]', isFree: true },
                        { id: 'qwen-coder', name: 'Qwen 2.5 Coder [Pollinations]', isFree: true },
                        { id: 'llama', name: 'Llama 3.3 70B [Pollinations]', isFree: true }
                    ]
                });
            }
            if (provider === 'local_endpoint' || provider === 'local') {
                return res.status(200).json({
                    success: true,
                    provider: 'local_endpoint',
                    count: 5,
                    models: [
                        { id: 'llama3.2:3b', name: 'Llama 3.2 3B [Local Device]', isFree: true },
                        { id: 'llama3.1:8b', name: 'Llama 3.1 8B [Local Device]', isFree: true },
                        { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B [Local Device]', isFree: true },
                        { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B [Local Device]', isFree: true },
                        { id: 'mistral:7b', name: 'Mistral 7B [Local Device]', isFree: true }
                    ]
                });
            }
            if (provider === 'openrouter') {
                return res.status(200).json({
                    success: true,
                    provider: 'openrouter',
                    count: 6,
                    models: [
                        { id: 'openrouter/free', name: 'Free Automated Router [Free]', isFree: true },
                        { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B [Free]', isFree: true },
                        { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B [Free]', isFree: true },
                        { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B [Free]', isFree: true },
                        { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]', isFree: true },
                        { id: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]', isFree: true }
                    ]
                });
            }
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
                        { id: 'mistral-large-latest', name: 'Mistral Large [Free]', isFree: true },
                        { id: 'mistral-medium-latest', name: 'Mistral Medium 3.5 [Free]', isFree: true },
                        { id: 'mistral-small-latest', name: 'Mistral Small [Free]', isFree: true },
                        { id: 'codestral-latest', name: 'Codestral Coding Specialist [Free]', isFree: true },
                        { id: 'ministral-8b-latest', name: 'Ministral 8B [Free]', isFree: true },
                        { id: 'ministral-3b-latest', name: 'Ministral 3B [Free]', isFree: true },
                        { id: 'devstral-medium-latest', name: 'Devstral Medium Agent [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'nararouter') {
                return res.status(200).json({
                    success: true,
                    provider: 'nararouter',
                    count: 6,
                    models: [
                        { id: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                        { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash [Free]', isFree: true },
                        { id: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash [Free]', isFree: true },
                        { id: 'mistral-large', name: 'Mistral Large [Free]', isFree: true },
                        { id: 'mistral-medium-3-5', name: 'Mistral Medium 3.5 [Free]', isFree: true },
                        { id: 'qwen-3.8-max-free', name: 'Qwen 3.8 Max [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'huggingface') {
                return res.status(200).json({
                    success: true,
                    provider: 'huggingface',
                    count: 6,
                    models: [
                        { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct [Free]', isFree: true },
                        { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B [Free]', isFree: true },
                        { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct [Free]', isFree: true },
                        { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct [Free]', isFree: true },
                        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 [Free]', isFree: true },
                        { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 Reasoning [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'opencode') {
                return res.status(200).json({
                    success: true,
                    provider: 'opencode',
                    count: 6,
                    models: [
                        { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash (OpenCode) [Free]', isFree: true },
                        { id: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1 Agent (OpenCode) [Free]', isFree: true },
                        { id: 'ling-3.0-flash-free', name: 'Ling 3.0 Flash (OpenCode) [Free]', isFree: true },
                        { id: 'mimo-v2.5-free', name: 'Mimo V2.5 Reasoning (OpenCode) [Free]', isFree: true },
                        { id: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra 550B (OpenCode) [Free]', isFree: true },
                        { id: 'north-mini-code-free', name: 'North Mini Code Specialist (OpenCode) [Free]', isFree: true }
                    ]
                });
            }
            if (provider === 'poolside') {
                return res.status(200).json({
                    success: true,
                    provider: 'poolside',
                    count: 3,
                    models: [
                        { id: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                        { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]', isFree: true },
                        { id: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]', isFree: true }
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
            } else if (provider === 'huggingface') {
                const activeHFModels = ['Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen2.5-Coder-32B-Instruct', 'meta-llama/Llama-3.3-70B-Instruct', 'Qwen/Qwen2.5-7B-Instruct'];
                if (activeHFModels.includes(id) || id.includes('Qwen') || id.includes('Llama-3.3') || id.includes('free')) {
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
        const reqProvider = (req.body && req.body.provider) || '';

        if (reqProvider === 'poolside') {
            return res.status(200).json({
                success: true,
                provider: 'poolside',
                count: 3,
                models: [
                    { id: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                    { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]', isFree: true },
                    { id: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'opencode') {
            return res.status(200).json({
                success: true,
                provider: 'opencode',
                count: 6,
                models: [
                    { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash (OpenCode) [Free]', isFree: true },
                    { id: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1 Agent (OpenCode) [Free]', isFree: true },
                    { id: 'ling-3.0-flash-free', name: 'Ling 3.0 Flash (OpenCode) [Free]', isFree: true },
                    { id: 'mimo-v2.5-free', name: 'Mimo V2.5 Reasoning (OpenCode) [Free]', isFree: true },
                    { id: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra 550B (OpenCode) [Free]', isFree: true },
                    { id: 'north-mini-code-free', name: 'North Mini Code Specialist (OpenCode) [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'nararouter') {
            return res.status(200).json({
                success: true,
                provider: 'nararouter',
                count: 6,
                models: [
                    { id: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                    { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash [Free]', isFree: true },
                    { id: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash [Free]', isFree: true },
                    { id: 'mistral-large', name: 'Mistral Large [Free]', isFree: true },
                    { id: 'mistral-medium-3-5', name: 'Mistral Medium 3.5 [Free]', isFree: true },
                    { id: 'qwen-3.8-max-free', name: 'Qwen 3.8 Max [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'huggingface') {
            return res.status(200).json({
                success: true,
                provider: 'huggingface',
                count: 6,
                models: [
                    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct [Free]', isFree: true },
                    { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B [Free]', isFree: true },
                    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct [Free]', isFree: true },
                    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct [Free]', isFree: true },
                    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 [Free]', isFree: true },
                    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 Reasoning [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'ollama') {
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

        if (reqProvider === 'openrouter') {
            return res.status(200).json({
                success: true,
                provider: 'openrouter',
                count: 6,
                models: [
                    { id: 'openrouter/free', name: 'Free Automated Router [Free]', isFree: true },
                    { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B [Free]', isFree: true },
                    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B [Free]', isFree: true },
                    { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B [Free]', isFree: true },
                    { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]', isFree: true },
                    { id: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'gemini') {
            return res.status(200).json({
                success: true,
                provider: 'gemini',
                count: 7,
                models: [
                    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash [Free]', isFree: true },
                    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash [Free]', isFree: true },
                    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash [Free]', isFree: true },
                    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite [Free]', isFree: true },
                    { id: 'gemma-4-31b-it', name: 'Gemma 4 31B [Free]', isFree: true },
                    { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B [Free]', isFree: true },
                    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'groq') {
            return res.status(200).json({
                success: true,
                provider: 'groq',
                count: 6,
                models: [
                    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B [Free]', isFree: true },
                    { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B Reasoning [Free]', isFree: true },
                    { id: 'groq/compound', name: 'Groq Compound Agent [Free]', isFree: true },
                    { id: 'groq/compound-mini', name: 'Groq Compound Mini [Free]', isFree: true },
                    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B [Free]', isFree: true },
                    { id: 'allam-2-7b', name: 'Allam 2 7B [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'mistral') {
            return res.status(200).json({
                success: true,
                provider: 'mistral',
                count: 7,
                models: [
                    { id: 'mistral-large-latest', name: 'Mistral Large [Free]', isFree: true },
                    { id: 'mistral-medium-latest', name: 'Mistral Medium 3.5 [Free]', isFree: true },
                    { id: 'mistral-small-latest', name: 'Mistral Small [Free]', isFree: true },
                    { id: 'codestral-latest', name: 'Codestral Coding Specialist [Free]', isFree: true },
                    { id: 'ministral-8b-latest', name: 'Ministral 8B [Free]', isFree: true },
                    { id: 'ministral-3b-latest', name: 'Ministral 3B [Free]', isFree: true },
                    { id: 'devstral-medium-latest', name: 'Devstral Medium Agent [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'sambanova') {
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

        if (reqProvider === 'cerebras') {
            return res.status(200).json({
                success: true,
                provider: 'cerebras',
                count: 3,
                models: [
                    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B [Cerebras Fast]', isFree: true },
                    { id: 'llama3.1-8b', name: 'Llama 3.1 8B [Cerebras Fast]', isFree: true },
                    { id: 'llama3.1-70b', name: 'Llama 3.1 70B [Cerebras Fast]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'nvidia') {
            return res.status(200).json({
                success: true,
                provider: 'nvidia',
                count: 5,
                models: [
                    { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct [NVIDIA NIM]', isFree: true },
                    { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B Instruct [NVIDIA NIM]', isFree: true },
                    { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct [NVIDIA NIM]', isFree: true },
                    { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2 [NVIDIA NIM]', isFree: true },
                    { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 [NVIDIA NIM]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'local_endpoint' || reqProvider === 'local') {
            return res.status(200).json({
                success: true,
                provider: 'local_endpoint',
                count: 5,
                models: [
                    { id: 'llama3.2:3b', name: 'Llama 3.2 3B [Local Device]', isFree: true },
                    { id: 'llama3.1:8b', name: 'Llama 3.1 8B [Local Device]', isFree: true },
                    { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B [Local Device]', isFree: true },
                    { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B [Local Device]', isFree: true },
                    { id: 'mistral:7b', name: 'Mistral 7B [Local Device]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'pollinations' || reqProvider === 'pollinations-keyed') {
            return res.status(200).json({
                success: true,
                provider: 'pollinations',
                count: 5,
                models: [
                    { id: 'openai', name: 'OpenAI GPT-4o Mini [Pollinations]', isFree: true },
                    { id: 'deepseek', name: 'DeepSeek V3 [Pollinations]', isFree: true },
                    { id: 'mistral', name: 'Mistral Small [Pollinations]', isFree: true },
                    { id: 'qwen-coder', name: 'Qwen 2.5 Coder [Pollinations]', isFree: true },
                    { id: 'llama', name: 'Llama 3.3 70B [Pollinations]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'huggingface') {
            return res.status(200).json({
                success: true,
                provider: 'huggingface',
                count: 6,
                models: [
                    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B Instruct [Free]', isFree: true },
                    { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B [Free]', isFree: true },
                    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct [Free]', isFree: true },
                    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B Instruct [Free]', isFree: true },
                    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 [Free]', isFree: true },
                    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 Reasoning [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'opencode') {
            return res.status(200).json({
                success: true,
                provider: 'opencode',
                count: 6,
                models: [
                    { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash (OpenCode) [Free]', isFree: true },
                    { id: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1 Agent (OpenCode) [Free]', isFree: true },
                    { id: 'ling-3.0-flash-free', name: 'Ling 3.0 Flash (OpenCode) [Free]', isFree: true },
                    { id: 'mimo-v2.5-free', name: 'Mimo V2.5 Reasoning (OpenCode) [Free]', isFree: true },
                    { id: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra 550B (OpenCode) [Free]', isFree: true },
                    { id: 'north-mini-code-free', name: 'North Mini Code Specialist (OpenCode) [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'poolside') {
            return res.status(200).json({
                success: true,
                provider: 'poolside',
                count: 3,
                models: [
                    { id: 'poolside/laguna-s-2.1:free', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                    { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1 Code Engine [Free]', isFree: true },
                    { id: 'poolside/laguna-m.1:free', name: 'Laguna M 2.1 Specialist [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'nararouter') {
            return res.status(200).json({
                success: true,
                provider: 'nararouter',
                count: 6,
                models: [
                    { id: 'laguna-s-2.1', name: 'Laguna S 2.1 Agent [Free]', isFree: true },
                    { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash [Free]', isFree: true },
                    { id: 'agnes-2.0-flash', name: 'Agnes 2.0 Flash [Free]', isFree: true },
                    { id: 'mistral-large', name: 'Mistral Large [Free]', isFree: true },
                    { id: 'mistral-medium-3-5', name: 'Mistral Medium 3.5 [Free]', isFree: true },
                    { id: 'qwen-3.8-max-free', name: 'Qwen 3.8 Max [Free]', isFree: true }
                ]
            });
        }

        if (reqProvider === 'ollama') {
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

        return res.status(500).json({
            error: err.name === 'AbortError' 
                ? 'Request timed out while fetching provider models.' 
                : `Network error: ${err.message}`
        });
    }
}
