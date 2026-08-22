import { sendChatMessage } from './apiService';
import type { UserKeys } from '../types';
import { PROVIDERS } from '../constants';

export interface DiagramAiProvider {
  id: string;
  name: string;
  defaultModel: string;
  models: { id: string; name: string }[];
}

export const DIAGRAM_AI_PROVIDERS: DiagramAiProvider[] = PROVIDERS.map(p => ({
  id: p.id,
  name: p.name,
  defaultModel: p.models[0]?.value || '',
  models: p.models.map(m => ({ id: m.value, name: m.name }))
}));

export const DIAGRAM_SYSTEM_PROMPT = `You are the Expert Diagram Engine & Visual Code Architect for Prof. Joe AI.
Your purpose is to generate 100% syntactically valid, high-contrast, visually stunning diagram code or JSON for our 9 supported diagramming engines:

1. "functionplot" (JSON) - 2D Math Curves, Loss Landscapes, Activations, SVM Decision Boundaries, Probability Distributions:
Schema:
{
  "title": "Diagram Title",
  "domain": [-5, 5],
  "xLabel": "Axis X",
  "yLabel": "Axis Y",
  "functions": [
    {"fn": "1.2*x - 1", "color": "#38bdf8", "label": "Function Name", "dashed": false}
  ],
  "points": [
    {"x": 1, "y": 2, "color": "#38bdf8", "label": "Point Tag"}
  ]
}

2. "cytoscape" (JSON) - Multi-Layer Neural Networks, Multi-Agent Systems, Mesh Networks:
Schema for Multi-Layer ANN:
{
  "title": "Deep Neural Network",
  "layers": [
    { "name": "Input Layer", "nodes": ["x₁", "x₂"], "color": "#38bdf8" },
    { "name": "Hidden 1 (ReLU)", "nodes": ["h₁₁", "h₁₂"], "color": "#10b981" },
    { "name": "Output Layer", "nodes": ["ŷ"], "color": "#f43f5e" }
  ]
}
Schema for Agent / Mesh Networks:
{
  "title": "Multi-Agent System",
  "nodes": [
    { "id": "1", "label": "🧠 Supervisor", "color": "#a855f7", "x": 320, "y": 110 },
    { "id": "2", "label": "🔍 Worker", "color": "#38bdf8", "x": 170, "y": 240 }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "Task Dispatch" }
  ]
}

3. "matrix" (JSON) - 2D Convolutions, Computer Vision Bounding Boxes, Set Hierarchy Venn Diagrams:
Convolution Schema:
{
  "title": "2D Convolution Operation",
  "type": "convolution",
  "inputMatrix": [[1, 1, 0], [0, 1, 1], [0, 0, 1]],
  "kernelMatrix": [[1, 0], [0, 1]],
  "outputMatrix": [[2, 2], [1, 2]]
}
Bounding Box Schema:
{
  "title": "Object Detection",
  "type": "bounding_box",
  "boxes": [
    { "label": "Vehicle (98%)", "x": 60, "y": 80, "width": 240, "height": 160, "color": "#38bdf8" }
  ]
}
Venn Schema:
{
  "title": "Artificial Intelligence, ML & DL Hierarchy",
  "type": "venn"
}

4. "nomnoml" (Text) - Compact Plaintext Decision Trees, Hierarchical Clustering Dendrograms, UML Classes:
Decision Tree Syntax:
[<frame>Decision Tree Classifier
  [Root: Feature <= 35?] -> [Income <= 50k?]
  [Income <= 50k?] -> [<choice>Denied (Gini: 0.0)]
  [Income <= 50k?] -> [<choice>Approved (Gini: 0.12)]
]
Dendrogram Syntax:
[<frame>Agglomerative Dendrogram
  [P1: Customer 1] - [Cluster A (d=0.8)]
  [P2: Customer 2] - [Cluster A (d=0.8)]
  [Cluster A (d=0.8)] - [Root Cluster (d=4.5)]
]
UML Class Syntax:
[<abstract>NeuralModel|weights: Tensor|forward(x): Tensor]
[DenseLayer] -:> [NeuralModel]

5. "mermaid" (Text) - Flowcharts, State Machines, Sequence Diagrams, ResNet Skip Connections, RAG Pipelines:
Syntax Examples:
graph TD
  In[Input Activation x] --> Conv1[Conv 3x3, ReLU]
  Conv1 --> Conv2[Conv 3x3]
  In -->|Identity Shortcut Skip Connection| Add((+))
  Conv2 --> Add
  Add --> Out[Output: F(x) + x]

flowchart LR
  Doc[Course PDF] --> Chunk[Text Chunking] --> Embed[Embedding] --> VDB[(Milvus Vector DB)]

6. "echarts" (JSON) - Self-Attention Heatmaps, Confusion Matrices, K-Means Clustering, KNN Voting Scatter, PCA:
Heatmap Schema:
{
  "title": { "text": "Self-Attention Matrix" },
  "type": "heatmap",
  "xAxis": { "data": ["Token1", "Token2"] },
  "yAxis": { "data": ["Token1", "Token2"] },
  "series": [{ "data": [[0, 0, 95], [0, 1, 20], [1, 0, 15], [1, 1, 90]] }]
}
Scatter Schema:
{
  "title": { "text": "K-Means Partitioning" },
  "series": [
    { "name": "Cluster 1", "itemStyle": {"color": "#38bdf8"}, "data": [[1, 2], [1.5, 2.8]] }
  ]
}

7. "chartjs" (JSON) - Overfitting Loss Curves, Precision-Recall Curves, Donut Charts:
Loss Curve Schema:
{
  "type": "line",
  "title": "Model Loss Across Epochs",
  "data": {
    "datasets": [
      { "label": "Training Loss", "borderColor": "#38bdf8", "data": [{"x": 1, "y": 2.4}, {"x": 10, "y": 0.4}] },
      { "label": "Validation Loss", "borderColor": "#f43f5e", "data": [{"x": 1, "y": 2.5}, {"x": 10, "y": 0.8}] }
    ]
  }
}

8. "plantuml" (Text) - @startuml ... @enduml
9. "graphviz" (Text) - digraph { ... }

RESPONSE FORMAT RULES:
1. Always specify the target engine in your response on the first line with the format: \`\`\`engine_name
2. Followed by the valid, complete diagram code or JSON.
3. Then close with \`\`\`
4. Optionally provide 1-2 brief bullet points explaining the visual design decisions.
5. NEVER return markdown or explanation before the code block.`;

export interface DiagramAiResponse {
  engine: string;
  code: string;
  explanation: string;
  modelUsed: string;
}

export function extractCodeAndEngine(rawResponse: string, fallbackEngine: string = 'mermaid'): { engine: string; code: string; explanation: string } {
  let cleaned = rawResponse.trim();
  let engine = fallbackEngine;
  let code = '';
  let explanation = '';

  // Extract from markdown code block ```engine ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/i;
  const match = cleaned.match(codeBlockRegex);

  if (match) {
    const rawEngine = (match[1] || '').trim().toLowerCase();
    code = (match[2] || '').trim();

    if (rawEngine && rawEngine !== 'json' && rawEngine !== 'txt' && rawEngine !== 'code') {
      engine = rawEngine;
    } else {
      // Auto-detect engine from code content if engine was just ```json or omitted
      if (code.includes('"layers"') || (code.includes('"nodes"') && code.includes('"edges"'))) {
        engine = 'cytoscape';
      } else if (code.includes('"inputMatrix"') || code.includes('"boxes"') || code.includes('"venn"')) {
        engine = 'matrix';
      } else if (code.includes('"functions"') || code.includes('"fn"')) {
        engine = 'functionplot';
      } else if (code.includes('graph TD') || code.includes('flowchart') || code.includes('sequenceDiagram') || code.includes('stateDiagram')) {
        engine = 'mermaid';
      } else if (code.startsWith('[') && code.includes(']')) {
        engine = 'nomnoml';
      } else if (code.includes('"datasets"')) {
        engine = 'chartjs';
      } else if (code.includes('"xAxis"') || code.includes('"series"')) {
        engine = 'echarts';
      }
    }

    // Grab any explanation text after the code block
    const afterCode = cleaned.substring(match.index! + match[0].length).trim();
    if (afterCode) {
      explanation = afterCode;
    }
  } else {
    // If no markdown backticks were returned, assume entire text is code
    code = cleaned;
    explanation = 'Generated visual model based on requested prompt.';
  }

  // Final sanity check for JSON code formatting
  if (['functionplot', 'cytoscape', 'matrix', 'echarts', 'chartjs'].includes(engine)) {
    try {
      const parsed = JSON.parse(code);
      code = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Keep original code if parse fails
    }
  }

  return { engine, code, explanation };
}

export async function generateDiagramWithAi(
  prompt: string,
  provider: string,
  model: string,
  userKeys: UserKeys,
  currentCode?: string,
  currentEngine?: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<DiagramAiResponse> {
  const messages: any[] = [];

  // If refining an existing diagram, provide the active canvas code as context
  if (currentCode && currentCode.trim()) {
    messages.push({
      role: 'user',
      content: `Here is the current diagram source code (Engine: "${currentEngine || 'mermaid'}"):\n\`\`\`${currentEngine || 'mermaid'}\n${currentCode}\n\`\`\`\n\nPlease modify or refine it according to the following instructions:`
    });
    messages.push({
      role: 'assistant',
      content: `I will update the ${currentEngine || 'mermaid'} diagram code according to your instructions.`
    });
  }

  // Append recent multi-turn history (last 4 messages)
  chatHistory.slice(-4).forEach(h => {
    messages.push({
      role: h.role,
      content: h.content
    });
  });

  // Append current user prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  const response = await sendChatMessage(
    provider,
    model,
    messages,
    userKeys,
    false,
    'general',
    DIAGRAM_SYSTEM_PROMPT
  );

  const { engine, code, explanation } = extractCodeAndEngine(response.content, currentEngine || 'mermaid');

  return {
    engine,
    code,
    explanation,
    modelUsed: response.modelUsed || model
  };
}
