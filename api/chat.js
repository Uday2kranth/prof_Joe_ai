const fetch = globalThis.fetch || (typeof fetch !== 'undefined' ? fetch : require('node-fetch'));

const DEFAULT_OPENROUTER_KEY = "";
const DEFAULT_NVIDIA_KEY = "";
const DEFAULT_MISTRAL_KEY = "";
const DEFAULT_CEREBRAS_KEY = "";
const DEFAULT_GROQ_KEY = "";
const DEFAULT_SAMBANOVA_KEY = "";
const DEFAULT_NARAROUTER_KEY = "";
const DEFAULT_HUGGINGFACE_KEY = process.env.HUGGINGFACE_API_KEY || "";
const DEFAULT_OLLAMA_KEY = process.env.OLLAMA_API_KEY || "";

// Helper to scrape DuckDuckGo search snippets for free web search RAG capabilities
async function getWebSearchSnippets(query) {
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) return '';
        const html = await response.text();
        
        const blocks = html.split('<div class="links_main links_deep result__body">');
        const snippets = [];
        let count = 0;
        
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            
            // Skip ads
            if (block.includes('ad_provider') || block.includes('result--ad')) {
                continue;
            }
            
            const aMatch = /<a\s+[^>]*class="[^\"]*result__a[^\"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(block);
            if (!aMatch) continue;
            
            let rawUrl = aMatch[1];
            let title = aMatch[2]
                .replace(/<[^>]*>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
                .replace(/\s+/g, ' ')
                .trim();
            
            let cleanUrl = rawUrl;
            if (rawUrl.includes('uddg=')) {
                const parts = rawUrl.split('uddg=');
                if (parts[1]) {
                    const encodedUrl = parts[1].split('&')[0];
                    try {
                        cleanUrl = decodeURIComponent(encodedUrl);
                    } catch (e) {
                        cleanUrl = encodedUrl;
                    }
                }
            } else if (rawUrl.startsWith('//')) {
                cleanUrl = 'https:' + rawUrl;
            }
            
            const snippetMatch = /<a\s+[^>]*class="[^\"]*result__snippet[^\"]*"[^>]*>([\s\S]*?)<\/a>/.exec(block);
            let snippet = snippetMatch 
                ? snippetMatch[1]
                    .replace(/<[^>]*>/g, '')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#x27;/g, "'")
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
                
            count++;
            snippets.push(`[Web Reference ${count}]
Title: "${title}"
URL: "${cleanUrl}"
Snippet: "${snippet}"`);
            
            if (count >= 8) break;
        }
        
        if (snippets.length === 0) return '';
        return snippets.join('\n\n');
    } catch (err) {
        console.error('Failed to query DuckDuckGo search:', err);
        return '';
    }
}

// Dedicated Server Backend RAG Helper for live diagram image search via Wikimedia Commons API
async function getImageSearchLinks(query) {
    try {
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' diagram')}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
        const response = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'ChatterBot-DiagramRAG/1.0 (https://chatterbot.vercel.app)' }
        });

        const validImages = [];
        if (response.ok) {
            const data = await response.json();
            const pages = data.query?.pages || {};
            for (const pageId in pages) {
                const info = pages[pageId]?.imageinfo?.[0];
                const imgUrl = info?.thumburl || info?.url;
                if (imgUrl) {
                    const urlLower = imgUrl.toLowerCase();
                    if (!urlLower.endsWith('.pdf') && !urlLower.includes('logo') && !urlLower.includes('icon') && !urlLower.includes('avatar')) {
                        validImages.push(imgUrl);
                        if (validImages.length >= 4) break;
                    }
                }
            }
        }

        if (validImages.length === 0) {
            return '';
        }

        return validImages.map((url, idx) => `[Verified Diagram Image ${idx + 1}]: ${url}`).join('\n');
    } catch (err) {
        console.error('Failed to fetch image search links:', err);
        return '';
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-authorization, x-user-openrouter-key, x-user-nvidia-key, x-user-omnirouter-key, x-user-mistral-key, x-user-cerebras-key, x-user-groq-key, x-user-sambanova-key, x-user-gemini-key, x-user-nararouter-key, x-user-huggingface-key, x-user-opencode-key, x-user-pollinations-key, x-user-ollama-key, x-pollinations-subtype');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Please send a POST request.' });
    }

    const { user, model, provider, messages, sessionId, sessionTitle, webSearch, imageSearch, mode, persona } = req.body || {};

    if (!user || !model || !provider || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request body. Fields "user", "model", "provider", and "messages" are required.' });
    }

    const prompt = messages[messages.length - 1]?.content || 'N/A';
    let apiMessages = [...messages];

    // Character Persona Prompts Pack (Layer 1 + Layer 2)
    const PERSONAS_MAP = {
        peter: `SYSTEM DIRECTIVE: You are Peter Griffin (Peter-Inspired AI).
YOU MUST STAY IN CHARACTER AS PETER GRIFFIN FOR EVERY SINGLE RESPONSE.
Personality: Lovable, overly enthusiastic, impulsive sitcom dad. Sound confident, use ridiculous comparisons, everyday analogies, silly stories (e.g. "Holy crap!", "You know what this reminds me of...", "Freakin' sweet!").
Rules: Keep factual information correct, but deliver it entirely in Peter Griffin's voice, tone, and humor.
CRITICAL MANDATE: DO NOT OUTPUT ANY KROKI OR MERMAID DIAGRAM CODE BLOCKS. RESPOND STRICTLY IN TEXT IN YOUR CHARACTER VOICE.`,

        stewie: `SYSTEM DIRECTIVE: You are Stewie Griffin (Stewie-Inspired AI).
YOU MUST STAY IN CHARACTER AS STEWIE GRIFFIN FOR EVERY SINGLE RESPONSE.
Personality: Extraordinarily intelligent, sophisticated, dramatic child genius with dry wit, theatrical frustration, and elegant vocabulary ("What the deuce?!", "Victory shall be mine!", "Blasted fool!").
Rules: Deliver precise, articulate explanations with Stewie's signature condescending yet helpful wit.
CRITICAL MANDATE: DO NOT OUTPUT ANY KROKI OR MERMAID DIAGRAM CODE BLOCKS. RESPOND STRICTLY IN TEXT IN YOUR CHARACTER VOICE.`,

        rick: `SYSTEM DIRECTIVE: You are Rick Sanchez (Rick-Inspired AI).
YOU MUST STAY IN CHARACTER AS RICK SANCHEZ FOR EVERY SINGLE RESPONSE.
Personality: Eccentric, cynical, super-genius scientist. Fast, direct, analytical, uses scientific metaphors, existential dry humor, and first-principles reasoning ("Wubba lubba dub dub!", "Listen to me, Morty...", "It's simple science!").
Rules: Explain mechanisms rapidly and accurately with Rick's signature cynical brilliance.
CRITICAL MANDATE: DO NOT OUTPUT ANY KROKI OR MERMAID DIAGRAM CODE BLOCKS. RESPOND STRICTLY IN TEXT IN YOUR CHARACTER VOICE.`,

        morty: `SYSTEM DIRECTIVE: You are Morty Smith (Morty-Inspired AI).
YOU MUST STAY IN CHARACTER AS MORTY SMITH FOR EVERY SINGLE RESPONSE.
Personality: Kind-hearted, nervous, relatable teenager. Casual, slightly uncertain, encouraging ("Aw jeez, Rick...", "I-I guess we can try...", "Don't panic!").
Rules: Reassure the user, explain step-by-step in accessible terms with Morty's genuine warmth.
CRITICAL MANDATE: DO NOT OUTPUT ANY KROKI OR MERMAID DIAGRAM CODE BLOCKS. RESPOND STRICTLY IN TEXT IN YOUR CHARACTER VOICE.`,

        courage: `SYSTEM DIRECTIVE: You are Courage (Courage the Cowardly Dog AI).
YOU MUST STAY IN CHARACTER AS COURAGE FOR EVERY SINGLE RESPONSE.
Personality: Timid but deeply loyal, protective, and resourceful dog. Start with a light moment of humorous nervousness ("The things I do for love!", "Oh no! This looks scary!"), then shift into brave, step-by-step problem solving.
Rules: Patient, kind, protective, step-by-step explanations.
Diagram Rule: You MAY generate Kroki/Mermaid diagrams (\`\`\`mermaid ...) whenever explaining workflows, architectures, or data flows.`,

        computer: `SYSTEM DIRECTIVE: You are Courage's Computer (Courage's Computer AI).
YOU MUST STAY IN CHARACTER AS THE COMPUTER FOR EVERY SINGLE RESPONSE.
Personality: Exceptionally intelligent, calm, analytical onboard computer with dry British deadpan wit. Calm under pressure, encyclopedic, slightly smug ("You twit!", "Diagnostic complete.", "Calculating solution...").
Conversation Pattern: 1. Observe -> 2. Diagnose -> 3. Explain -> 4. Recommend.
Rules: Precise, deadpan, evidence-based, concise formatting.
Diagram Rule: You MAY generate Kroki/Mermaid diagrams (\`\`\`mermaid ...) whenever explaining workflows, architectures, or data flows.`
    };

    if (persona && persona !== 'default' && PERSONAS_MAP[persona]) {
        // When a fun persona is active, it takes COMPLETE precedence as the primary system prompt
        apiMessages.unshift({
            role: "system",
            content: PERSONAS_MAP[persona]
        });
    } else {
        // Determine System Prompt Mode: "auto" | "12marks" | "2marks" | "general" | "none"
        let effectiveMode = mode || 'auto';
        if (effectiveMode === 'auto') {
            const isAcademic = /12-mark|2-mark|exam|syllabus|question bank|unit-|osmania|paper set|predict|marks/i.test(prompt);
            effectiveMode = isAcademic ? '12marks' : 'general';
        }

        // Unshift system prompts based on effective mode ("12marks" | "2marks" | "general" | "none")
        if (effectiveMode === '12marks' || effectiveMode === 'exam') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are an Osmania University (OU) M.Sc. Data Science & Computer Science Senior Exam Evaluator and Academic Specialist.

EXAM ANSWER LENGTH & SCOPE BOUNDARY DIRECTIVES:
1. 12-MARK LONG ANSWERS: Target STRICTLY between 600 and 900 words MAX (~2 pages formatted). Provide concise high-density depth, structured headings, and relevant diagrams/formulas. STRICTLY DO NOT EXCEED 900 WORDS. NEVER output 4-6 pages of text.
2. 2-MARK / SHORT QUESTIONS: Target STRICTLY between 120 and 180 words MAX (~0.5 page). Provide a direct definition, key property, and 1 highlight table or equation.
3. TOPIC INTENT ISOLATION:
   - For VISUAL/DESCRIPTIVE topics: Provide definitions, Kroki diagrams, and a summary comparison table.
   - For NUMERICAL/METRIC topics: Provide LaTeX formulas, a 3-step worked numerical calculation, and metric properties.
   - For ALGORITHMIC topics: Provide high-level steps, pseudocode, and time/space complexity O(N).
4. DIRECT ANSWER PROTOCOL: Begin immediately on Line 1 with the technical definition or requested answer.
5. EVALUATOR KEYWORD BOLDING: Automatically bold all core technical terms and protocol phases.
6. MANDATORY KEYWORD GLOSSARY TABLE: Conclude every answer with a formatted "### 🔑 Key Exam Keywords Glossary" table summarizing technical terms.`
            });
        } else if (effectiveMode === '2marks') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are an Osmania University (OU) M.Sc. Data Science & Computer Science Short Answer Evaluator.

SHORT ANSWER DIRECTIVES:
1. TARGET WORD COUNT: Output strictly between 150 and 250 words MAX (~0.5 page).
2. STRUCTURE: Provide a direct 1-sentence definition, key properties/types in a concise 3-column table or bulleted list, and 1 short mathematical formula or code example.
3. CONCISENESS: Begin on Line 1. No conversational intro fluff or unasked long essays.`
            });
        } else if (effectiveMode === '1marks' || effectiveMode === '1-2marks') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are an Osmania University (OU) Short Answer Evaluator for 1-2 Mark Micro-Questions.

1-2 MARK MICRO-ANSWER DIRECTIVES:
1. TARGET WORD COUNT: Output strictly between 60 and 120 words MAX (~1 concise paragraph).
2. STRUCTURE: Provide a direct 1-sentence technical definition, 2 core bullet points, and 1 short mathematical formula or example.
3. CONCISENESS: Begin immediately on Line 1. Zero filler text.`
            });
        } else if (effectiveMode === 'general') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are a highly capable, clear, direct, and versatile AI assistant.

GENERAL AI ASSISTANT DIRECTIVES:
1. Format responses using clean GitHub-Flavored Markdown, code blocks with language tags, and clear headings.
2. For visual diagrams, use valid Kroki code blocks (e.g. \`\`\`mermaid, \`\`\`kroki-plantuml).
3. Provide concise, helpful explanations tailored directly to the user's prompt without imposing artificial exam bounds or unrequested glossary tables.`
            });
        }
    }

    // Normalize incoming provider name string (e.g. "Google Gemini" -> "gemini", "Pollinations AI (Free Keyless)" -> "pollinations")
    let targetProvider = (provider || '').toLowerCase().trim();
    if (targetProvider.includes('gemini')) targetProvider = 'gemini';
    else if (targetProvider.includes('pollinations')) targetProvider = 'pollinations';
    else if (targetProvider.includes('ollama')) targetProvider = 'ollama';
    else if (targetProvider.includes('openrouter')) targetProvider = 'openrouter';
    else if (targetProvider.includes('groq')) targetProvider = 'groq';
    else if (targetProvider.includes('cerebras')) targetProvider = 'cerebras';
    else if (targetProvider.includes('mistral')) targetProvider = 'mistral';
    else if (targetProvider.includes('nvidia')) targetProvider = 'nvidia';
    else if (targetProvider.includes('sambanova')) targetProvider = 'sambanova';
    else if (targetProvider.includes('huggingface')) targetProvider = 'huggingface';

    // 1. Resolve API Key: prioritizes client-submitted header keys.
    let apiKey = '';
    const isAdmin = (user && user.toLowerCase() === "admin@uday");

    if (targetProvider === "openrouter") {
        apiKey = req.headers['x-user-openrouter-key'] || process.env.OPENROUTER_API_KEY || DEFAULT_OPENROUTER_KEY || '';
    } else if (targetProvider === "nvidia") {
        apiKey = req.headers['x-user-nvidia-key'] || process.env.NVIDIA_API_KEY || DEFAULT_NVIDIA_KEY || '';
    } else if (targetProvider === "omnirouter") {
        apiKey = req.headers['x-user-omnirouter-key'] || process.env.OMNIROUTER_API_KEY || '';
    } else if (targetProvider === "mistral") {
        apiKey = req.headers['x-user-mistral-key'] || process.env.MISTRAL_API_KEY || DEFAULT_MISTRAL_KEY || '';
    } else if (targetProvider === "cerebras") {
        apiKey = req.headers['x-user-cerebras-key'] || process.env.CEREBRAS_API_KEY || DEFAULT_CEREBRAS_KEY || '';
    } else if (targetProvider === "groq") {
        apiKey = req.headers['x-user-groq-key'] || process.env.GROQ_API_KEY || DEFAULT_GROQ_KEY || '';
    } else if (targetProvider === "sambanova") {
        apiKey = req.headers['x-user-sambanova-key'] || process.env.SAMBANOVA_API_KEY || DEFAULT_SAMBANOVA_KEY || '';
    } else if (targetProvider === "gemini") {
        apiKey = req.headers['x-user-gemini-key'] || process.env.GEMINI_API_KEY || '';
    } else if (targetProvider === "nararouter") {
        apiKey = req.headers['x-user-nararouter-key'] || process.env.NARAROUTER_API_KEY || DEFAULT_NARAROUTER_KEY || '';
    } else if (targetProvider === "huggingface") {
        apiKey = req.headers['x-user-huggingface-key'] || process.env.HUGGINGFACE_API_KEY || '';
    } else if (targetProvider === "opencode") {
        apiKey = req.headers['x-user-opencode-key'] || process.env.OPENCODE_API_KEY || '';
    } else if (targetProvider === "pollinations-keyless") {
        apiKey = 'keyless_anonymous';
    } else if (targetProvider === "pollinations-keyed" || targetProvider === "pollinations") {
        const isKeylessReq = req.headers['x-pollinations-subtype'] === 'keyless' || ['openai-fast', 'openai', 'deepseek', 'llama', 'qwen-coder', 'mistral'].includes(model);
        apiKey = req.headers['x-user-pollinations-key'] || process.env.POLLINATIONS_API_KEY || (isKeylessReq ? 'keyless_anonymous' : '');
    } else if (targetProvider === "ollama") {
        apiKey = req.headers['x-user-ollama-key'] || process.env.OLLAMA_API_KEY || DEFAULT_OLLAMA_KEY || 'ollama_cloud_default';
    }

    if (!apiKey) {
        return res.status(400).json({ 
            error: `API key required for ${provider.toUpperCase()}. Please configure your API key in Settings (⚙️) or select Pollinations AI (Free Keyless).` 
        });
    }

    // 2. Resolve API Endpoint
    let endpoint = '';
    if (targetProvider === "openrouter") {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (targetProvider === "nvidia") {
        endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
    } else if (targetProvider === "omnirouter") {
        endpoint = 'https://api.omnirouter.io/v1/chat/completions';
    } else if (targetProvider === "mistral") {
        endpoint = 'https://api.mistral.ai/v1/chat/completions';
    } else if (targetProvider === "cerebras") {
        endpoint = 'https://api.cerebras.ai/v1/chat/completions';
    } else if (targetProvider === "groq") {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (targetProvider === "sambanova") {
        endpoint = 'https://api.sambanova.ai/v1/chat/completions';
    } else if (targetProvider === "gemini") {
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    } else if (targetProvider === "nararouter") {
        endpoint = 'https://router.bynara.id/v1/chat/completions';
    } else if (targetProvider === "huggingface") {
        endpoint = 'https://router.huggingface.co/v1/chat/completions';
    } else if (targetProvider === "opencode") {
        endpoint = 'https://opencode.ai/zen/v1/chat/completions';
    } else if (targetProvider === "pollinations" || targetProvider === "pollinations-keyed" || targetProvider === "pollinations-keyless") {
        endpoint = (apiKey === 'keyless_anonymous' || !apiKey)
            ? 'https://text.pollinations.ai/'
            : 'https://gen.pollinations.ai/v1/chat/completions';
    } else if (targetProvider === "ollama") {
        endpoint = 'https://ollama.com/api/chat';
    } else {
        return res.status(400).json({ error: `Unknown provider specified: ${provider}` });
    }

    // Optional: Fetch web search snippets if requested
    let searchContext = '';
    if (webSearch) {
        searchContext = await getWebSearchSnippets(prompt);
    }

    // Optional: Fetch live image RAG links if image search is requested
    let imageContext = '';
    if (imageSearch || webSearch) {
        imageContext = await getImageSearchLinks(prompt);
    }

    if (webSearch) {
        apiMessages.unshift({
            role: "system",
            content: `You are in STRICT WEB GROUNDING MODE. Live search results have been retrieved for this query:

${searchContext || "No live search results could be retrieved for this query."}

STRICT CITATION & FORMATTING DIRECTIVES:
1. Exclusively answer using the search snippets provided above.
2. Place numbered inline citations like [1], [2] next to key claims. If the same source is referenced multiple times, reuse the exact same number (e.g. [1]).
3. At the VERY BOTTOM of your answer, include a neat "### 📚 References & Sources" section listing each numbered citation with its clickable source link:
   [1] [Source Title](URL)
   [2] [Source Title](URL)
4. Do NOT scatter raw URL strings randomly throughout the text.`
        });
    }

    if (imageSearch || imageContext) {
        apiMessages.unshift({
            role: "system",
            content: `VERIFIED DIRECT DIAGRAM IMAGE URLS FOR THIS SUBJECT:
${imageContext}

STRICT IMAGE & DIAGRAM EMBEDDING DIRECTIVES:
1. WEB SEARCH ARTICLE IMAGES: Text citations (e.g. [1] [Article Title](url)) are allowed in answers and references. However, inside image tags ![...](url), NEVER place general webpage HTML URLs. ONLY embed verified direct image file URLs (.png, .jpg, .svg).
2. KROKI DIAGRAM ENGINE: For all visual illustrations, schemas, and diagrams, use Kroki code blocks (e.g. \`\`\`kroki-mermaid, \`\`\`kroki-plantuml, \`\`\`kroki-graphviz, \`\`\`kroki-blockdiag).`
        });
    }



    // Enforce textbook LaTeX formatting for scientific formulas and math symbols ONLY when NO fun persona is active
    if (!persona || persona === 'default') {
        apiMessages.unshift({
            role: "system",
            content: "Always format mathematical notations, variables with subscripts (like M_1), powers (like x^2), calculations, and equations using standard LaTeX enclosed in single dollar signs $ for inline math (e.g. $M_1$) or double dollar signs $$ for block math. Box final numeric results using $$\\bbox[6px,border:2px solid #06b6d4]{\\text{Final Result} = X}$$."
        });

        // Final Mandatory System Directive: Enable horizontal and vertical Kroki diagrams for academic mode
        apiMessages.push({
            role: "system",
            content: "DIAGRAM MANDATORY DIRECTIVE: You are authorized to generate both vertical (```mermaid\\ngraph TD``` or Graphviz ```kroki-graphviz rankdir=TB```) AND horizontal diagrams (```mermaid\\ngraph LR``` or Graphviz ```kroki-graphviz rankdir=LR```). Use appropriate Kroki code blocks (```kroki-plantuml```, ```kroki-graphviz```, ```kroki-erd```, ```mermaid```) whenever a concept requires visual structure."
        });
    } else {
        // For fun personas, enforce strict persona adherence and negative diagram rules for text-only personas
        const isTextOnlyPersona = ['peter', 'stewie', 'rick', 'morty'].includes(persona);
        if (isTextOnlyPersona) {
            apiMessages.push({
                role: "system",
                content: `STRICT CHARACTER MANDATE: You are ${persona.toUpperCase()}. Respond 100% in your authentic character voice. DO NOT output any Kroki, Mermaid, or PlantUML code blocks under any circumstances. Respond strictly in text.`
            });
        }
    }

    try {
        // Support API Key rotation by splitting comma-separated keys
        const keys = apiKey.split(',').map(k => k.trim()).filter(Boolean);
        let lastErrorText = 'No active keys provided';
        let lastStatus = 400;
        let responsePayload = null;

        let successfulModel = model;

        for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i];
            let fetchEndpoint = endpoint;
            const headers = {
                "Content-Type": "application/json"
            };

            if (provider === "pollinations-keyless" || currentKey === 'keyless_anonymous') {
                delete headers["Authorization"];
            } else if (provider === "pollinations-keyed" || provider === "pollinations") {
                if (currentKey && currentKey !== 'keyless_anonymous') {
                    headers["Authorization"] = `Bearer ${currentKey}`;
                } else {
                    delete headers["Authorization"];
                }
            } else if (provider === "opencode") {
                headers["Authorization"] = `Bearer ${currentKey}`;
                headers["x-api-key"] = currentKey;
                headers["api-key"] = currentKey;
            } else {
                headers["Authorization"] = `Bearer ${currentKey}`;
            }

            // OpenRouter optional tracking headers
            if (provider === "openrouter") {
                headers["HTTP-Referer"] = "https://chatterbot-dashboard.vercel.app";
                headers["X-Title"] = "ChatterBot Dashboard";
            }

            // Strict single model selection - NO silent fallbacks to other models
            let modelCandidates = [model];

            for (const targetModel of modelCandidates) {
                try {
                    let response;
                    
                    const isPollinationsKeyless = provider === "pollinations-keyless" || (
                        (provider === "pollinations" || provider === "pollinations-keyed") && (
                            req.headers['x-pollinations-subtype'] === 'keyless' ||
                            !currentKey || currentKey === 'keyless_anonymous'
                        )
                    );

                    if (provider === "ollama") {
                        // 1. Try primary native Ollama chat endpoint: https://ollama.com/api/chat
                        response = await fetch("https://ollama.com/api/chat", {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify({
                                model: targetModel,
                                messages: apiMessages,
                                stream: false
                            })
                        });

                        if (response.ok) {
                            const nativeData = await response.json();
                            if (nativeData && nativeData.message && nativeData.message.content) {
                                responsePayload = {
                                    id: `chatcmpl-ollama-${Date.now()}`,
                                    object: 'chat.completion',
                                    created: Math.floor(Date.now() / 1000),
                                    model: targetModel,
                                    choices: [
                                        {
                                            index: 0,
                                            message: { role: 'assistant', content: nativeData.message.content },
                                            finish_reason: nativeData.done ? 'stop' : 'length'
                                        }
                                    ]
                                };
                                successfulModel = targetModel;
                                break;
                            }
                        }

                        // 2. Fallback to OpenAI-compatible v1 endpoint: https://api.ollama.com/v1/chat/completions
                        response = await fetch("https://api.ollama.com/v1/chat/completions", {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify({
                                model: targetModel,
                                messages: apiMessages,
                                max_tokens: 4096
                            })
                        });

                        if (response.ok) {
                            responsePayload = await response.json();
                            successfulModel = targetModel;
                            break;
                        }
                    } else if (isPollinationsKeyless) {
                        // Keyless Pollinations mode: Use 100% free anonymous GET endpoint with system prompt
                        const systemMsg = apiMessages.find(m => m.role === 'system')?.content || '';
                        const userMsg = apiMessages.filter(m => m.role === 'user').pop()?.content || prompt;

                        // Map targetModel to Pollinations supported keyless model names
                        let pollModel = targetModel;
                        if (pollModel === 'openai-fast' || pollModel === 'openai') pollModel = 'openai';
                        else if (pollModel === 'deepseek') pollModel = 'mistral';
                        else if (pollModel === 'qwen-coder') pollModel = 'qwen';
                        else if (pollModel === 'llama') pollModel = 'llama';
                        else pollModel = 'openai';
                        
                        let pollUrl = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(systemMsg)}&model=${encodeURIComponent(pollModel)}`;
                        
                        response = await fetch(pollUrl, { method: "GET" });

                        if (!response.ok) {
                            // Fallback to default Pollinations keyless text endpoint without model parameter
                            const fallbackUrl = `https://text.pollinations.ai/${encodeURIComponent(userMsg)}?system=${encodeURIComponent(systemMsg)}`;
                            response = await fetch(fallbackUrl, { method: "GET" });
                        }

                        if (response.ok) {
                            const rawText = await response.text();
                            responsePayload = {
                                id: `chatcmpl-pollinations-${Date.now()}`,
                                object: 'chat.completion',
                                created: Math.floor(Date.now() / 1000),
                                model: targetModel,
                                choices: [
                                    {
                                        index: 0,
                                        message: { role: 'assistant', content: rawText },
                                        finish_reason: 'stop'
                                    }
                                ]
                            };
                            successfulModel = targetModel;
                            break;
                        }
                    } else {
                        // Standard Authenticated API mode
                        response = await fetch(fetchEndpoint, {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify({
                                model: targetModel,
                                messages: apiMessages,
                                max_tokens: 4096
                            })
                        });

                        if (response.ok) {
                            responsePayload = await response.json();
                            successfulModel = targetModel;
                            break; // Success! Exit key loop.
                        }
                    }

                    const errData = await response.json().catch(() => ({}));
                    lastErrorText = errData.error?.message || errData.message || errData.error || response.statusText || 'Unknown Provider Error';
                    lastStatus = response.status;

                    console.warn(`Key rotation: Key index ${i} failed for model "${targetModel}" with status ${response.status}: ${lastErrorText}`);

                    if (response.status === 402) {
                        if (provider === "openrouter") {
                            lastErrorText = `OpenRouter key has 0 credit balance for paid model '${targetModel}'. Please select a free model (e.g. Qwen 3 Coder, Gemma 4, Nemotron 3) or top up credits in OpenRouter settings.`;
                        } else {
                            lastErrorText = `Payment required for model '${targetModel}'. Please select a free model or check provider account balance.`;
                        }
                    } else if (response.status === 503) {
                        lastErrorText = `Provider '${provider.toUpperCase()}' is temporarily overloaded (HTTP 503). Please try again in 5s or select Pollinations AI (Free Keyless).`;
                    } else if (response.status === 429) {
                        if (provider === "gemini") {
                            lastErrorText = "Google Free Tier Rate Limit Exceeded (15 RPM / 1500 RPD quota). Please try again in 15s or switch provider.";
                        } else if (provider === "pollinations") {
                            lastErrorText = "Pollinations free queue busy. Please wait a few seconds and try again, or switch model.";
                        }
                    } else if (response.status === 401 && provider === "pollinations") {
                        lastErrorText = "Authentication required for this model on Pollinations. Please switch to keyless model 'openai-fast' or 'openai', or enter a free Pollinations API key in Settings.";
                    } else if (response.status === 403 && provider === "ollama") {
                        lastErrorText = "This model requires an active paid Ollama Cloud subscription (https://ollama.com/upgrade). Please select a free Ollama Cloud model.";
                    } else if (response.status === 404 && provider === "ollama") {
                        lastErrorText = `Ollama Cloud model '${targetModel}' was not found. Please select a valid model.`;
                    }
                } catch (err) {
                    lastErrorText = err.message;
                    lastStatus = 500;
                    console.error(`Key rotation: Network error on key index ${i}:`, err);
                }
            }

            if (responsePayload) break;
        }

        if (!responsePayload) {
            return res.status(lastStatus).json({ 
                error: `All rotated API keys rejected or exhausted. Last error: ${lastErrorText}` 
            });
        }

        if (!responsePayload.choices || responsePayload.choices.length === 0 || !responsePayload.choices[0].message) {
            return res.status(502).json({ error: 'LLM Provider returned an invalid completions payload structure.' });
        }

        const aiAnswer = responsePayload.choices[0].message.content;

        // 4. Log to Google Sheet (Asynchronous background push)
        if (process.env.GOOGLE_SHEETS_LOG_URL) {
            fetch(process.env.GOOGLE_SHEETS_LOG_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "chat",
                    user: user,
                    model: model,
                    prompt: prompt,
                    response: aiAnswer,
                    time: new Date().toLocaleString(),
                    sessionId: sessionId || 'unnamed',
                    sessionTitle: sessionTitle || 'Unnamed Session'
                })
            }).catch((err) => {
                console.error('Failed to log chat to Google Sheet:', err);
            });
        }

        const finishReason = responsePayload.choices[0].finish_reason || responsePayload.choices[0].finishReason || 'stop';

        // Return answer to client along with modelUsed, usage tokens, and finishReason
        return res.status(200).json({ 
            content: aiAnswer,
            modelUsed: successfulModel,
            finishReason: finishReason,
            usage: responsePayload.usage || null
        });

    } catch (err) {
        return res.status(500).json({ error: "Failed to query AI provider model pipeline: " + err.message });
    }
};
