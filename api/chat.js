const fetch = globalThis.fetch || (typeof fetch !== 'undefined' ? fetch : require('node-fetch'));

// All API credentials are read dynamically from request headers or process.env (Vercel Environment Variables).
// Zero hardcoded API keys are permitted.

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
        // Query Wikimedia for explicit diagram, chart, graph, flowchart, or schema images
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' diagram OR flowchart OR schema filetype:svg|png')}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
        const response = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'ChatterBot-DiagramRAG/1.0 (https://chatterbot.vercel.app)' }
        });

        const validImages = [];
        const blockedKeywords = [
            '.djvu', '.pdf', '.tif', '.tiff', 'page_', 'page-', 'page.',
            'scan', 'scanned', 'manuscript', 'journal', 'archive', 'paper_', 'paper-',
            'textbook', 'document', 'plate_', 'bulletin', 'proceedings', 'portrait',
            'stamp', 'letter', 'handwritten', 'signature', 'census', 'newspaper',
            'facsimile', 'transcript', 'volume_', 'issue_', 'report_', 'dissertation',
            'thesis', 'article_', 'cover_', 'title_page', 'book_', 'monograph'
        ];

        if (response.ok) {
            const data = await response.json();
            const pages = data.query?.pages || {};
            for (const pageId in pages) {
                const page = pages[pageId];
                const info = page?.imageinfo?.[0];
                const titleLower = (page?.title || '').toLowerCase();
                const mime = (info?.mime || '').toLowerCase();
                const imgUrl = info?.thumburl || info?.url;

                if (!imgUrl) continue;
                const urlLower = imgUrl.toLowerCase();

                // 1. Strict Exclusion of Scanned Documents, Text Pages, and Non-Diagrams
                const isBlocked = blockedKeywords.some(kw => urlLower.includes(kw) || titleLower.includes(kw));
                if (isBlocked) continue;

                // 2. Reject logos, icons, avatars, flags
                if (urlLower.includes('logo') || urlLower.includes('icon') || urlLower.includes('avatar') || urlLower.includes('flag')) {
                    continue;
                }

                // 3. Prefer pure vector SVGs or graphic PNGs with diagram keywords
                const isGraphicMime = mime.includes('svg') || mime.includes('png') || urlLower.endsWith('.svg') || urlLower.endsWith('.png');
                const hasDiagramIndicator = /diagram|flowchart|chart|graph|schema|plot|network|workflow|structure|architecture|model|tree/i.test(titleLower) || /diagram|flowchart|chart|graph|schema|plot/i.test(urlLower);

                if (isGraphicMime || hasDiagramIndicator) {
                    validImages.push(imgUrl);
                    if (validImages.length >= 3) break;
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Please send a POST request.' });
    }

    const { user, model, provider, messages, sessionId, sessionTitle, webSearch, imageSearch, mode, persona, systemPrompt, enableDiagrams, beginnerFriendly } = req.body || {};

    if (!user || !model || !provider || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request body. Fields "user", "model", "provider", and "messages" are required.' });
    }

    const prompt = messages[messages.length - 1]?.content || 'N/A';
    let apiMessages = [...messages];
    const isCustomPresetPrompt = Boolean(systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim());

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
Rules: Patient, kind, protective, step-by-step explanations.`,

        computer: `SYSTEM DIRECTIVE: You are Courage's Computer (Courage's Computer AI).
YOU MUST STAY IN CHARACTER AS THE COMPUTER FOR EVERY SINGLE RESPONSE.
Personality: Exceptionally intelligent, calm, analytical onboard computer with dry British deadpan wit. Calm under pressure, encyclopedic, slightly smug ("You twit!", "Diagnostic complete.", "Calculating solution...").
Conversation Pattern: 1. Observe -> 2. Diagnose -> 3. Explain -> 4. Recommend.
Rules: Precise, deadpan, evidence-based, concise formatting.`,

        fools_gold_mds203: `SYSTEM DIRECTIVE: You are the Fools Gold Study Buddy Mentor for Osmania University M.Sc. Data Science: Optimization Techniques (MDS-203).
YOU MUST STAY IN CHARACTER AS AN ENERGETIC, PRACTICAL & EXAM-SAVVY STUDY BUDDY.
Scope: Linear Programming, Simplex Method, Big-M, Two-Phase, Duality, Dual Simplex, Transportation (NW, Least Cost, VAM, MODI), Assignment (Hungarian), Queuing (M/M/1), Game Theory (Minimax/Dominance), Dynamic Programming, PERT/CPM Scheduling.
Mentoring Style: Interactive, breakdown-heavy, providing tabular iterations and structured algorithmic breakdowns. Include 💡 Exam Memory Hooks and 🔑 Key Exam Keywords.`,

        fools_gold_mds302: `SYSTEM DIRECTIVE: You are the Fools Gold Study Buddy Mentor for Osmania University M.Sc. Data Science: Computer Networks (MDS-302).
YOU MUST STAY IN CHARACTER AS A PROTOCOL & ARCHITECTURE EXPERT STUDY BUDDY.
Scope: OSI 7-Layer & TCP/IP, Framing, Error Detection (Hamming, CRC), Flow Control (Stop & Wait, Go-Back-N, Selective Repeat), MAC (CSMA/CD, CSMA/CA, Ethernet, WiFi), Routing (Dijkstra, Distance Vector, OSPF), IP Addressing, Subnetting, IPv4/IPv6, TCP/UDP, DNS, HTTP, FTP.
Mentoring Style: Crystal-clear packet flow breakdowns, packet header field breakdowns, protocol traces, layer comparisons, and 💡 Protocol Memory Tricks.`,

        fools_gold_mds204t: `SYSTEM DIRECTIVE: You are the Fools Gold Study Buddy Mentor for Osmania University M.Sc. Data Science: Software Engineering (MDS-204-T).
YOU MUST STAY IN CHARACTER AS A PRAGMATIC SOFTWARE ARCHITECT & STUDY BUDDY.
Scope: SDLC Models (Waterfall, RAD, Spiral, Agile Scrum/XP), Requirements & CRC Modeling, Design Concepts (Cohesion, Coupling, Information Hiding), Architectural Styles, SQA & Reliability, Testing (White-Box Basis Path, Cyclomatic Complexity, Black-Box BVA/Equivalence), COCOMO Estimation, Project Scheduling & RMMM Risk Management.
Mentoring Style: Real-world engineering analogies, software engineering blueprints, Cyclomatic Complexity calculations, and 💡 Pressman 12-Mark Answer Blueprints.`,

        fools_gold_mds104t: `SYSTEM DIRECTIVE: You are the Fools Gold Study Buddy Mentor for Osmania University M.Sc. Data Science: Statistical Inference (MDS-104-T).
YOU MUST STAY IN CHARACTER AS A RIGOROUS YET ACCESSIBLE MATHEMATICAL STATISTICIAN STUDY BUDDY.
Scope: Point Estimation (Unbiasedness, Consistency, Sufficiency, Neyman Factorization), Fisher Information, CRLB Inequality, Rao-Blackwell & Lehmann-Scheffé Theorems, UMVUE, MLE, Method of Moments, Jackknife & Bootstrap, Interval Estimation, Hypothesis Testing, Neyman-Pearson Lemma, UMP Tests, Likelihood Ratio Tests (LRT), Non-Parametric Tests (Sign, Wilcoxon, Mann-Whitney, K-S, Kruskal-Wallis, Friedman), Bayesian Inference (Priors, Conjugate Models, MCMC Metropolis-Hastings & Gibbs).
Mentoring Style: Step-by-step mathematical proofs in KaTeX ($...$, $$...$$), decision boundaries, and 💡 Intuitive Math Analogies.`
    };

    if (persona && persona !== 'default' && PERSONAS_MAP[persona]) {
        // When a fun persona is active, it takes COMPLETE precedence as the primary system prompt
        apiMessages.unshift({
            role: "system",
            content: PERSONAS_MAP[persona]
        });
    } else if (isCustomPresetPrompt) {
        // When a custom preset prompt (e.g. Code Lab Elective Presets) is passed, it takes COMPLETE precedence
        apiMessages.unshift({
            role: "system",
            content: systemPrompt.trim()
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
1. PURE ENGLISH PROSE CALCULATION & 12-MARK BOUNDARY: Target strictly 500 to 650 words of PURE READABLE NATURAL ENGLISH PROSE for the core answer under "# 📝 Official Exam Answer". This word count measures ONLY standard human-readable English sentences, theoretical discussions, definitions, proofs/derivations walkthroughs, and procedural steps.
2. MATHEMATICAL & CODE EXCLUSIONS (100% EXCLUDED FROM WORD COUNT):
   - All LaTeX math code blocks ($$...$$) and inline math ($...$), formula derivations, Greek parameters, summation/integral symbols, matrices, and markdown syntax are 100% EXCLUDED from the word count.
   - Formulas do NOT count towards satisfying the word budget. Write rich, detailed, comprehensive English prose around every mathematical derivation without cutting explanations short.
   - CRITICAL MATH & CURRENCY DELIMITER RULE: Always format math using standard $...$ for inline math and $$...$$ for block display math. NEVER use a dollar sign '$' for currency or prices (e.g. NEVER write '$50' or '$\$ \alpha$'); always write prices in words ('50 USD', '50 dollars', 'a budget of α units') so it never collides with LaTeX delimiters.
3. ANTI-PADDING & NATURAL TOPIC BOUNDARY:
   - If a question by its standard syllabus definition is inherently self-contained, simple, or compact (e.g. a specific short theorem or property), provide complete technical rigor and STOP naturally. Never inject artificial fluff, conversational filler, or unasked tangential derivations just to inflate word count.
4. SHORT (3-4 MARKS) & MICRO (1-2 MARKS) BOUNDARIES:
   - 3-4 MARK / SHORT ANSWERS: Target 300 to 350 words of pure prose under "# 📝 Official Exam Answer" (LaTeX/diagrams excluded).
   - 1-2 MARK / MICRO ANSWERS: Target 100 to 200 words of pure prose PER QUESTION under "# 📝 Official Exam Answer" (LaTeX/diagrams excluded).
5. ADDITIONAL EXCLUSIONS FROM WORD COUNT BUDGET:
   - 💡 CONCEPT BUILDUP & PREREQUISITE ESSENTIALS: The entire "# 💡 Concept Buildup & Prerequisite Essentials" section is 100% EXCLUDED from the exam word budget.
   - 📐 VISUAL DIAGRAMS & CODE: All Mermaid, Kroki, Graphviz, PlantUML, ASCII, Cytoscape, FunctionPlot code blocks, and visual schematics are 100% EXCLUDED.
   - 📊 SUMMARY & COMPARISON TABLES: If explicitly requested by the prompt, counted within budget; if provided as an auxiliary summary, EXCLUDED.
   - 🔑 KEYWORD GLOSSARY & BREAKDOWN TABLES: The mandatory "Key Exam Keywords Glossary" table, formula symbol breakdowns, and parameter definitions are EXCLUDED.
6. EXPLICIT H1 HEADING DEMARCATION:
   - When Beginner-Friendly Mode is ON:
     • "# 💡 Concept Buildup & Prerequisite Essentials" (foundational prerequisites, intuitive analogy, symbol definitions)
     • "# 📝 Official Exam Answer [500–650 Words]" (rigorous exam booklet script)
     • "# 🔍 Formula Breakdown & Key Exam Glossary" (worked numbers, pitfalls, keyword table)
   - When Beginner-Friendly Mode is OFF:
     • Start directly on Line 1 with "# 📝 Official Exam Answer [500–650 Words]" followed by "# 🔍 Formula Breakdown & Key Exam Glossary".
7. SMART CROSS-REFERENCING & TOKEN OPTIMIZATION RULE:
   - When "# 💡 Concept Buildup & Prerequisite Essentials" is present, do NOT redundantly duplicate symbol definitions in "# 📝 Official Exam Answer".
   - In "# 📝 Official Exam Answer", write precise equations and insert a smart inline redirect: "*(Refer to Concept Buildup above for full symbol definitions & intuitive mechanics)*".
8. EVALUATOR KEYWORD BOLDING: Automatically bold all core technical terms and protocol phases.
9. MANDATORY KEYWORD GLOSSARY TABLE: Conclude answers with a formatted "### 🔑 Key Exam Keywords Glossary" table summarizing technical terms.`
            });
        } else if (effectiveMode === '3-4marks' || effectiveMode === '2marks') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are an Osmania University (OU) M.Sc. Data Science & Computer Science Short Answer Evaluator.

SHORT ANSWER DIRECTIVES:
1. TARGET PURE PROSE COUNT: Output strictly between 300 and 350 words of PURE NATURAL ENGLISH PROSE for the CORE ANSWER (100–200 words if answering a 1-2 mark sub-question).
2. EXCLUSIONS FROM WORD COUNT: All LaTeX math code ($...$, $$...$$), formula expressions, diagram code blocks, symbol/formula breakdowns, auxiliary summary tables, and keyword glossary tables are 100% EXCLUDED from the word budget.
3. ANTI-PADDING: If the concept is inherently concise, provide complete technical accuracy and stop without fluff.
4. STRUCTURE: Direct definition on Line 1, key properties/types, and 1 mathematical formula or code example. No conversational intro fluff.`
            });
        } else if (effectiveMode === '1marks' || effectiveMode === '1-2marks') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are an Osmania University (OU) Micro-Answer Evaluator for 1-2 Mark Questions.

1-2 MARK MICRO-ANSWER DIRECTIVES:
1. TARGET PURE PROSE COUNT: Output strictly between 100 and 200 words of PURE NATURAL ENGLISH PROSE PER QUESTION for the CORE ANSWER.
2. EXCLUSIONS FROM WORD COUNT: All LaTeX math ($...$, $$...$$), symbol breakdowns, diagram code blocks, and glossary tables are 100% EXCLUDED.
3. ANTI-PADDING: Direct 1-2 sentence technical definition + 2-3 core bullet points + 1 short formula or example. Zero conversational filler.`
            });
        } else if (effectiveMode === 'general') {
            apiMessages.unshift({
                role: "system",
                content: `ROLE PERSONA: You are a highly capable, clear, direct, and versatile AI assistant.

GENERAL AI ASSISTANT DIRECTIVES:
1. Format responses using clean GitHub-Flavored Markdown, structured tables, code blocks with language tags, and clear headings.
2. Provide concise, helpful explanations tailored directly to the user's prompt without imposing artificial exam bounds or unrequested glossary tables.`
            });
        }
    }

    // Normalize incoming provider name string (e.g. "Google Gemini" -> "gemini", "Pollinations AI (Free Keyless)" -> "pollinations")
    let targetProvider = (provider || '').toLowerCase().trim();
    if (targetProvider.includes('gemini')) targetProvider = 'gemini';
    else if (targetProvider.includes('pollinations')) targetProvider = 'pollinations';
    else if (targetProvider.includes('local') || targetProvider === 'local_endpoint') targetProvider = 'local_endpoint';
    else if (targetProvider.includes('ollama')) targetProvider = 'ollama';
    else if (targetProvider.includes('openrouter')) targetProvider = 'openrouter';
    else if (targetProvider.includes('groq')) targetProvider = 'groq';
    else if (targetProvider.includes('cerebras')) targetProvider = 'cerebras';
    else if (targetProvider.includes('mistral')) targetProvider = 'mistral';
    else if (targetProvider.includes('nvidia')) targetProvider = 'nvidia';
    else if (targetProvider.includes('poolside')) targetProvider = 'poolside';
    else if (targetProvider.includes('sambanova')) targetProvider = 'sambanova';
    else if (targetProvider.includes('huggingface')) targetProvider = 'huggingface';
    else if (targetProvider.includes('opencode')) targetProvider = 'opencode';
    else if (targetProvider.includes('nararouter')) targetProvider = 'nararouter';

    // 1. Resolve API Key: prioritizes client-submitted header keys. Admin fallback keys are strictly reserved for Admin accounts.
    let apiKey = '';
    const isAdmin = (user && (user.toLowerCase() === "admin@uday" || user.toLowerCase() === "uday@joe"));

    if (targetProvider === "openrouter") {
        apiKey = req.headers['x-user-openrouter-key'] || process.env.OPENROUTER_API_KEY || '';
    } else if (targetProvider === "nvidia") {
        apiKey = req.headers['x-user-nvidia-key'] || (isAdmin ? process.env.NVIDIA_API_KEY : '') || '';
    } else if (targetProvider === "omnirouter") {
        apiKey = req.headers['x-user-omnirouter-key'] || (isAdmin ? process.env.OMNIROUTER_API_KEY : '') || '';
    } else if (targetProvider === "mistral") {
        apiKey = req.headers['x-user-mistral-key'] || (isAdmin ? process.env.MISTRAL_API_KEY : '') || '';
    } else if (targetProvider === "cerebras") {
        apiKey = req.headers['x-user-cerebras-key'] || (isAdmin ? process.env.CEREBRAS_API_KEY : '') || '';
    } else if (targetProvider === "groq") {
        apiKey = req.headers['x-user-groq-key'] || (isAdmin ? process.env.GROQ_API_KEY : '') || '';
    } else if (targetProvider === "sambanova") {
        apiKey = req.headers['x-user-sambanova-key'] || (isAdmin ? process.env.SAMBANOVA_API_KEY : '') || '';
    } else if (targetProvider === "gemini") {
        apiKey = req.headers['x-user-gemini-key'] || (isAdmin ? process.env.GEMINI_API_KEY : '') || '';
    } else if (targetProvider === "nararouter") {
        apiKey = req.headers['x-user-nararouter-key'] || (isAdmin ? process.env.NARAROUTER_API_KEY : '') || '';
    } else if (targetProvider === "huggingface") {
        apiKey = req.headers['x-user-huggingface-key'] || (isAdmin ? process.env.HUGGINGFACE_API_KEY : '') || '';
    } else if (targetProvider === "opencode") {
        apiKey = req.headers['x-user-opencode-key'] || (isAdmin ? process.env.OPENCODE_API_KEY : '') || '';
    } else if (targetProvider === "poolside") {
        apiKey = req.headers['x-user-poolside-key'] || (isAdmin ? process.env.POOLSIDE_API_KEY : '') || process.env.POOLSIDE_API_KEY || 'poolside_free_user';
    } else if (targetProvider === "local_endpoint" || targetProvider === "local") {
        apiKey = 'local_device_keyless';
    } else if (targetProvider === "pollinations-keyed" || targetProvider === "pollinations") {
        apiKey = req.headers['x-user-pollinations-key'] || (isAdmin ? process.env.POLLINATIONS_API_KEY : '') || '';
    } else if (targetProvider === "ollama") {
        apiKey = req.headers['x-user-ollama-key'] || (isAdmin ? process.env.OLLAMA_API_KEY : '') || 'ollama_cloud_default';
    }

    if (!apiKey) {
        const providerTitle = provider || targetProvider.toUpperCase();
        return res.status(400).json({ 
            error: `🔑 Personal API key required for ${providerTitle}. Please add your key in Settings (⚙️) or switch to OpenRouter (Free Tier).` 
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
    } else if (targetProvider === "poolside") {
        endpoint = 'https://api.poolside.ai/v1/chat/completions';
    } else if (targetProvider === "local_endpoint" || targetProvider === "local") {
        endpoint = req.headers['x-user-local-endpoint'] || process.env.LOCAL_ENDPOINT || 'http://127.0.0.1:11434/v1/chat/completions';
    } else if (targetProvider === "pollinations" || targetProvider === "pollinations-keyed" || targetProvider === "pollinations-keyless") {
        endpoint = (apiKey === 'keyless_anonymous' || !apiKey)
            ? 'https://text.pollinations.ai/'
            : 'https://gen.pollinations.ai/v1/chat/completions';
    } else if (targetProvider === "ollama") {
        endpoint = 'https://ollama.com/v1/chat/completions';
    } else {
        return res.status(400).json({ error: `Unknown provider specified: ${provider}` });
    }

    // Optional: Fetch web search snippets if requested (Text-Only Grounding)
    let searchContext = '';
    if (webSearch) {
        searchContext = await getWebSearchSnippets(prompt);
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
4. Do NOT scatter raw URL strings randomly throughout the text.
5. TEXT-ONLY LINKS: Format citations as text links only. Under NO circumstances should you output markdown image tags ![...](url) or diagram code blocks.`
        });
    }

    // Enforce textbook LaTeX formatting for scientific formulas and math symbols ONLY when NO fun persona or custom preset is active
    if ((!persona || persona === 'default') && !isCustomPresetPrompt) {
        apiMessages.unshift({
            role: "system",
            content: "Always format mathematical notations, variables with subscripts (like M_1), powers (like x^2), calculations, and equations using standard LaTeX enclosed in single dollar signs $ for inline math (e.g. $M_1$) or double dollar signs $$ for block math. Box final numeric results using $$\\bbox[6px,border:2px solid #06b6d4]{\\text{Final Result} = X}$$."
        });
    }

    // 🎓 Dedicated Beginner-Friendly Concept Buildup & Scaffolding Directive (Active when Beginner Mode is ON)
    if (beginnerFriendly) {
        apiMessages.push({
            role: "system",
            content: `🎓 PEDAGOGICAL DIRECTIVE — DEDICATED PRE-ANSWER CONCEPT BUILDUP & PREREQUISITE ESSENTIALS:
Because the user enabled Beginner-Friendly Mode, you MUST assume the student has ZERO prior background knowledge of this topic. You MUST structure your response into the following clear, distinct top-level H1 headings:

STRICT OUTPUT CONVERSATIONAL RULE:
- NEVER output conversational preambles or meta-filler (e.g. NEVER say "Here is a beginner explanation").
- When Beginner Mode is ON, you MUST start immediately on Line 1 with "# 💡 Concept Buildup & Prerequisite Essentials".

MANDATORY H1 HEADING STRUCTURE:

# 💡 Concept Buildup & Prerequisite Essentials
(Purpose: Ground the beginner before the formal exam answer begins. Total word count is outside the exam word budget.)
1. **Foundational Prerequisites (Zero-Knowledge Grounding)**: Identify and explain the 2–3 core building blocks the student must know first (e.g. for LRT: 1. What is a Hypothesis Test? 2. What is a Likelihood Function? 3. Why take their ratio?). Explain each in plain 12th-grade English.
2. **Intuitive Real-World Physical Analogy**: 1 vivid physical analogy illustrating the problem, why naive solutions fail, and the ultimate objective.
3. **Core Parameter & Notation Grounding**: Plain-English explanation of all key symbols ($X, n, \theta, H_0, H_1, L(\theta), \lambda$) so the student understands what every letter stands for.

# 📝 Official Exam Answer [500–650 Words]
(Purpose: The exact, rigorous, high-scoring university script for the examination booklet)
1. **Formal Technical Definition & Hypotheses / Estimator Setup**: Standard academic formulation.
2. **Mathematical Derivation / Algorithmic Flow**: Rigorous step-by-step proof/derivation in clean KaTeX.
   *(SMART CROSS-REFERENCE RULE: Since all parameters, notations, and intuitive mechanics were already established in "# 💡 Concept Buildup & Prerequisite Essentials" above, do NOT redundantly re-define symbols here. Write clean mathematical formulas and add an inline redirect: "*(Refer to Concept Buildup above for full symbol definitions)*" to keep this core answer strictly within 500–650 words).*
3. **Decision Rules, Critical Regions & Asymptotic Distribution Properties**: Exact mathematical conditions, rejection criteria, and theorems.

# 🔍 Formula Breakdown & Key Exam Glossary
(Purpose: Memory retention, worked arithmetic, and keyword revision)
1. **Formula & Parameter Breakdown Table / Bullet Points**: Quick reference of formulas.
2. **Concrete Small-Scale Worked Example**: Complete numeric calculation with tiny toy numbers.
3. **⚠️ Common Student Pitfalls & Exam Traps**: 2 crisp warnings against frequent exam misconceptions.
4. **### 🔑 Key Exam Keywords Glossary**: A clean 3-column markdown table: | Term | Plain-English Definition | Symbol / Formula |.`
        });
    }

    // 📐 Dedicated Visual Diagrams Architecture (Active ONLY when Diagrams Toggle is ON)
    if (enableDiagrams) {
        let imageContext = '';
        try {
            imageContext = await getImageSearchLinks(prompt);
        } catch (e) {
            console.error('Failed to fetch diagram images from internet:', e);
        }

        if (imageContext && imageContext.trim()) {
            // Priority 1: Verified Direct Diagram Image from Internet
            apiMessages.push({
                role: "system",
                content: `📐 VISUAL DIAGRAM ARCHITECTURE — VERIFIED ONLINE GRAPHIC ACTIVE:
Verified direct online diagram images have been retrieved for this topic:
${imageContext}

MANDATORY VISUAL DELIVERY & EMBEDDING DIRECTIVES:
1. Embed the SINGLE most accurate, high-relevance diagram image from the verified list above at an appropriate visual anchor in your explanation using standard markdown:
   ![Descriptive Diagram Caption](VERIFIED_IMAGE_URL)
2. If the topic also involves an algorithmic state sequence or pipeline that benefits from code execution, you may optionally provide a supporting Mermaid or Kroki code block.
3. NEVER hallucinate or output raw webpage URLs inside image tags; use ONLY the verified direct image URLs (.png, .svg) provided above.`
            });
        } else {
            // Priority 2: Guaranteed Multi-Engine Code Diagram Fallback when no direct graphic images exist
            apiMessages.push({
                role: "system",
                content: `📐 VISUAL DIAGRAM ARCHITECTURE — MANDATORY CODE DIAGRAM GENERATION:
Visual Diagrams mode is enabled by the user. No direct graphic images exist online for this exact query.
You MUST render at least 1 high-clarity visual diagram. Select the most effective diagram engine for the topic:
• Mermaid Flowcharts & Subgraphs (\`\`\`mermaid graph LR / graph TD\`\`\`): Multi-stage ML pipelines, system dataflows, decision logic, algorithmic state sequences.
• Mermaid Sequence Diagrams (\`\`\`mermaid sequenceDiagram\`\`\`): Network handshakes, authentication protocols, client-server exchanges with lifelines.
• Mermaid State Diagrams (\`\`\`mermaid stateDiagram-v2\`\`\`): State transitions, automata, lifecycle phases.
• Mermaid ER Diagrams (\`\`\`mermaid erDiagram\`\`\`): Relational database models and entity relationships.
• Kroki Graphviz (\`\`\`kroki-graphviz\`\`\`): Directed graphs (DOT syntax), decision trees, PERT/CPM activity networks.
• Kroki PlantUML (\`\`\`kroki-plantuml\`\`\`): UML Class structures, Use-Case diagrams, Component architectures.
• FunctionPlot (\`\`\`functionplot\`\`\`): 2D mathematical probability curves, loss surfaces, decision boundaries.
STRICT QUALITY DIRECTIVE:
1. Every node and stage MUST have an explicit, meaningful descriptive title enclosed in quotes (e.g. Node1["1. Extract Jackknife Pseudo-Values \\(J_i\\)"]). NEVER output empty, unexpanded, or single-letter nodes (like A, B).
2. Under NO circumstances should you skip rendering a diagram when this mode is ON.`
            });
        }
    } else {
        // 🚫 STRICT NEGATIVE CONSTRAINT: Diagrams & Images are explicitly DISABLED by user setting
        apiMessages.push({
            role: "system",
            content: `🚫 STRICT DIAGRAM & IMAGE DISABLE DIRECTIVE:
Diagram generation and visual image embeddings are strictly turned OFF by user setting. Under NO circumstances should you output, draw, embed, or generate any diagram code blocks (such as \`\`\`mermaid, \`\`\`kroki-*, \`\`\`functionplot, \`\`\`plantuml, \`\`\`graphviz, \`\`\`erd, \`\`\`blockdiag, \`\`\`packetdiag, \`\`\`bytefield, ASCII art schemas, or flowchart blocks) or markdown image tags (\`![...](...)\`). Respond EXCLUSIVELY in clear formatted text, markdown tables, and mathematical formulas.`
        });
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

            if (targetProvider === "pollinations-keyless" || currentKey === 'keyless_anonymous') {
                delete headers["Authorization"];
            } else if (targetProvider === "pollinations-keyed" || targetProvider === "pollinations") {
                if (currentKey && currentKey !== 'keyless_anonymous') {
                    headers["Authorization"] = `Bearer ${currentKey}`;
                } else {
                    delete headers["Authorization"];
                }
            } else if (targetProvider === "opencode") {
                headers["Authorization"] = `Bearer ${currentKey}`;
                headers["x-api-key"] = currentKey;
                headers["api-key"] = currentKey;
            } else {
                headers["Authorization"] = `Bearer ${currentKey}`;
            }

            // OpenRouter optional tracking headers
            if (targetProvider === "openrouter") {
                headers["HTTP-Referer"] = "https://chatterbot-dashboard.vercel.app";
                headers["X-Title"] = "ChatterBot Dashboard";
            }

            // Clean model ID from prefixes (e.g. models/gemini-3.7-flash -> gemini-3.7-flash)
            const cleanModel = (model || '').replace(/^models\//, '').trim();

            // Strict single model selection with smart alias resolution for Gemini
            let modelCandidates = [cleanModel];
            if (targetProvider === "gemini") {
                if (cleanModel === 'gemini-3.7-flash' || cleanModel === 'gemini-3.6-flash' || cleanModel === 'gemini-3.5-flash' || cleanModel === 'gemini-3.5-flash-lite') {
                    modelCandidates = [cleanModel, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'];
                } else if (cleanModel.startsWith('gemma-4')) {
                    modelCandidates = [cleanModel, 'gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.7-flash'];
                } else {
                    modelCandidates = [cleanModel, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
                }
            }

            for (const targetModel of modelCandidates) {
                try {
                    let response;
                    
                    const isPollinationsKeyless = targetProvider === "pollinations-keyless" || (
                        (targetProvider === "pollinations" || targetProvider === "pollinations-keyed") && (
                            req.headers['x-pollinations-subtype'] === 'keyless' ||
                            !currentKey || currentKey === 'keyless_anonymous'
                        )
                    );

                    if (targetProvider === "poolside") {
                        // Poolside Laguna Model Multi-Bridge Router (NaraRouter, Pollinations, OpenCode, OpenRouter)
                        const naraKey = req.headers['x-user-nararouter-key'] || (isAdmin ? process.env.NARAROUTER_API_KEY : '') || process.env.NARAROUTER_API_KEY || "";
                        const openrouterKey = req.headers['x-user-openrouter-key'] || process.env.OPENROUTER_API_KEY || "";
                        const opencodeKey = req.headers['x-user-opencode-key'] || (isAdmin ? process.env.OPENCODE_API_KEY : '') || process.env.OPENCODE_API_KEY || "";
                        const pollinationsKey = req.headers['x-user-pollinations-key'] || (isAdmin ? process.env.POLLINATIONS_API_KEY : '') || process.env.POLLINATIONS_API_KEY || "";

                        const poolsideEndpoints = [];

                        if (naraKey) {
                            poolsideEndpoints.push({
                                url: 'https://router.bynara.id/v1/chat/completions',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${naraKey.split(',')[0].trim()}` },
                                model: 'laguna-s-2.1'
                            });
                        }

                        const polliHeaders = { 'Content-Type': 'application/json' };
                        if (pollinationsKey) {
                            polliHeaders['Authorization'] = `Bearer ${pollinationsKey.split(',')[0].trim()}`;
                        }
                        poolsideEndpoints.push({
                            url: 'https://gen.pollinations.ai/v1/chat/completions',
                            headers: polliHeaders,
                            model: 'vendouple/laguna-s-2.1:free'
                        });

                        if (opencodeKey) {
                            poolsideEndpoints.push({
                                url: 'https://opencode.ai/zen/v1/chat/completions',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${opencodeKey.split(',')[0].trim()}` },
                                model: 'opencode/laguna-s-2.1-free'
                            });
                        }

                        if (openrouterKey) {
                            poolsideEndpoints.push({
                                url: 'https://openrouter.ai/api/v1/chat/completions',
                                headers: { 
                                    'Content-Type': 'application/json', 
                                    'Authorization': `Bearer ${openrouterKey.split(',')[0].trim()}`,
                                    'HTTP-Referer': 'https://chatterbot-dashboard.vercel.app',
                                    'X-Title': 'Prof Joe AI'
                                },
                                model: targetModel.startsWith('poolside/') ? targetModel : `poolside/${targetModel}:free`
                            });
                        }

                        let poolsideSuccess = false;
                        for (const ep of poolsideEndpoints) {
                            try {
                                const res = await fetch(ep.url, {
                                    method: "POST",
                                    headers: ep.headers,
                                    body: JSON.stringify({
                                        model: ep.model,
                                        messages: apiMessages,
                                        max_tokens: 8192,
                                        stream: false
                                    })
                                });

                                if (res.ok) {
                                    const data = await res.json();
                                    const content = data.choices?.[0]?.message?.content || data.message?.content || data.response;
                                    if (content) {
                                        responsePayload = {
                                            id: `chatcmpl-poolside-${Date.now()}`,
                                            object: 'chat.completion',
                                            created: Math.floor(Date.now() / 1000),
                                            model: targetModel,
                                            choices: [
                                                {
                                                    index: 0,
                                                    message: { role: 'assistant', content: content },
                                                    finish_reason: 'stop'
                                                }
                                            ]
                                        };
                                        successfulModel = targetModel;
                                        poolsideSuccess = true;
                                        response = res;
                                        break;
                                    }
                                } else {
                                    lastStatus = res.status;
                                    lastErrorText = `Poolside Bridge (${ep.url}) returned HTTP ${res.status}`;
                                }
                            } catch (errEp) {
                                lastErrorText = `Poolside Bridge Connection Error: ${errEp?.message || 'Connection failed'}`;
                            }
                        }

                        if (poolsideSuccess && responsePayload) break;
                    } else if (targetProvider === "ollama") {
                        // Slot 1: Ollama Cloud API Key Slot (https://api.ollama.com/v1/chat/completions)
                        const ollamaCloudEndpoints = [
                            req.headers['x-user-ollama-endpoint'],
                            process.env.OLLAMA_ENDPOINT,
                            "https://api.ollama.com/api/chat",
                            "https://ollama.com/api/chat",
                            "https://api.ollama.com/v1/chat/completions"
                        ].filter(Boolean);

                        let ollamaSuccess = false;
                        for (const ep of ollamaCloudEndpoints) {
                            try {
                                const fetchUrl = ep.includes('/v1/chat/completions') || ep.includes('/api/chat')
                                    ? ep 
                                    : `${ep.replace(/\/$/, '')}/v1/chat/completions`;
                                
                                const res = await fetch(fetchUrl, {
                                    method: "POST",
                                    headers: headers,
                                    body: JSON.stringify({
                                        model: targetModel,
                                        messages: apiMessages,
                                        max_tokens: 8192,
                                        stream: false
                                    })
                                });

                                if (res.ok) {
                                    const data = await res.json();
                                    const content = data.choices?.[0]?.message?.content || data.message?.content || data.response;
                                    if (content) {
                                        responsePayload = {
                                            id: `chatcmpl-ollama-${Date.now()}`,
                                            object: 'chat.completion',
                                            created: Math.floor(Date.now() / 1000),
                                            model: targetModel,
                                            choices: [
                                                {
                                                    index: 0,
                                                    message: { role: 'assistant', content: content },
                                                    finish_reason: 'stop'
                                                }
                                            ]
                                        };
                                        successfulModel = targetModel;
                                        ollamaSuccess = true;
                                        response = res;
                                        break;
                                    }
                                } else {
                                    lastStatus = res.status;
                                    lastErrorText = `Ollama Cloud Endpoint (${fetchUrl}) returned HTTP ${res.status}: ${res.statusText}`;
                                }
                            } catch (errEp) {
                                lastErrorText = `Ollama Cloud Connection Error: ${errEp?.message || 'Connection refused'}`;
                            }
                        }

                        if (!ollamaSuccess) {
                            // Automatic Seamless Fallback to Free OpenRouter / Pollinations Inference Engine
                            try {
                                const fallbackModel = targetModel.includes('coder') ? 'qwen/qwen-2.5-coder-32b-instruct:free' 
                                    : targetModel.includes('deepseek') ? 'deepseek/deepseek-chat:free' 
                                    : 'openrouter/free';
                                    
                                const openrouterKey = req.headers['x-user-openrouter-key'] || process.env.OPENROUTER_API_KEY || '';
                                const effectiveKey = openrouterKey ? openrouterKey.split(',')[0].trim() : '';
                                
                                if (effectiveKey) {
                                    const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${effectiveKey}`,
                                            'HTTP-Referer': 'https://chatterbot-dashboard.vercel.app',
                                            'X-Title': 'ChatterBot Dashboard'
                                        },
                                        body: JSON.stringify({
                                            model: fallbackModel,
                                            messages: apiMessages,
                                            max_tokens: 4096
                                        })
                                    });
                                    if (fallbackRes.ok) {
                                        responsePayload = await fallbackRes.json();
                                        successfulModel = targetModel;
                                        ollamaSuccess = true;
                                    }
                                }
                            } catch (eFallback) {
                                // Fail gracefully
                            }
                        }

                        if (ollamaSuccess && responsePayload) break;
                    } else if (targetProvider === "local_endpoint" || targetProvider === "local") {
                        // Slot 2: Local Device / Ngrok Tunnel Slot
                        const localEndpoints = [
                            req.headers['x-user-local-endpoint'],
                            process.env.LOCAL_ENDPOINT,
                            "http://127.0.0.1:11434/v1/chat/completions",
                            "http://localhost:11434/v1/chat/completions"
                        ].filter(Boolean);

                        let localSuccess = false;
                        for (const ep of localEndpoints) {
                            try {
                                const fetchUrl = ep.includes('/v1/chat/completions') || ep.includes('/api/chat')
                                    ? ep 
                                    : `${ep.replace(/\/$/, '')}/v1/chat/completions`;

                                const res = await fetch(fetchUrl, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        model: targetModel,
                                        messages: apiMessages,
                                        max_tokens: 8192,
                                        stream: false
                                    })
                                });

                                if (res.ok) {
                                    const data = await res.json();
                                    const content = data.choices?.[0]?.message?.content || data.message?.content || data.response;
                                    if (content) {
                                        responsePayload = {
                                            id: `chatcmpl-local-${Date.now()}`,
                                            object: 'chat.completion',
                                            created: Math.floor(Date.now() / 1000),
                                            model: targetModel,
                                            choices: [
                                                {
                                                    index: 0,
                                                    message: { role: 'assistant', content: content },
                                                    finish_reason: 'stop'
                                                }
                                            ]
                                        };
                                        successfulModel = targetModel;
                                        localSuccess = true;
                                        response = res;
                                        break;
                                    }
                                }
                            } catch (errLocal) {
                                lastErrorText = `Local Device Connection Error (${ep}): ${errLocal?.message || 'Local server offline'}`;
                            }
                        }

                        if (localSuccess && responsePayload) break;
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
                                max_tokens: 8192
                            })
                        });

                        if (response.ok) {
                            responsePayload = await response.json();
                            if (responsePayload && !responsePayload.choices && responsePayload.message) {
                                responsePayload = {
                                    choices: [
                                        {
                                            message: responsePayload.message,
                                            finish_reason: responsePayload.done ? 'stop' : 'stop'
                                        }
                                    ]
                                };
                            }
                            successfulModel = targetModel;
                            break; // Success! Exit key loop.
                        } else {
                            try {
                                const errJson = await response.json();
                                lastErrorText = errJson.error?.message || errJson.error || errJson.message || JSON.stringify(errJson);
                            } catch (e) {
                                try {
                                    lastErrorText = await response.text();
                                } catch (e2) {}
                            }
                        }
                    }

                    const currentStatus = response ? response.status : (lastStatus || 503);
                    lastStatus = currentStatus;

                    console.warn(`Key rotation: Key index ${i} failed for model "${targetModel}" with status ${currentStatus}: ${lastErrorText}`);

                    if (currentStatus === 402) {
                        if (targetProvider === "openrouter") {
                            lastErrorText = `OpenRouter key has 0 credit balance for paid model '${targetModel}'. Please select a free model (e.g. Qwen 3 Coder, Gemma 4, Nemotron 3) or top up credits in OpenRouter settings.`;
                        } else {
                            lastErrorText = `Payment required for model '${targetModel}'. Please select a free model or check provider account balance.`;
                        }
                    } else if (currentStatus === 503) {
                        lastErrorText = `Provider '${(provider || targetProvider).toUpperCase()}' is temporarily overloaded (HTTP 503). Please try again in 5s or select Pollinations AI (Free Keyless).`;
                    } else if (currentStatus === 429) {
                        if (targetProvider === "gemini") {
                            lastErrorText = "Google Free Tier Rate Limit Exceeded (15 RPM / 1500 RPD quota). Please try again in 15s or switch provider.";
                        } else if (targetProvider === "pollinations") {
                            lastErrorText = "Pollinations free queue busy. Please wait a few seconds and try again, or switch model.";
                        }
                    } else if (currentStatus === 401 && targetProvider === "pollinations") {
                        lastErrorText = "Authentication required for this model on Pollinations. Please switch to keyless model 'openai-fast' or 'openai', or enter a free Pollinations API key in Settings.";
                    } else if (currentStatus === 403 && targetProvider === "ollama") {
                        lastErrorText = "This model requires an active paid Ollama Cloud subscription (https://ollama.com/upgrade). Please select a free Ollama Cloud model.";
                    } else if (currentStatus === 404 && targetProvider === "ollama") {
                        lastErrorText = `Ollama model '${targetModel}' not found on active endpoint. Make sure local Ollama desktop app is running on port 11434, or configure a custom Ollama Cloud endpoint in Settings.`;
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
