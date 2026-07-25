import React, { useState } from 'react';
import { Search, Sparkles, Send, Code, BookOpen, Layers, Terminal } from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  category: 'exam' | 'code' | 'diagram' | 'general';
  icon: any;
  description: string;
  promptText: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'crypto_12mark',
    title: 'Cryptography 12-Mark Evaluator',
    category: 'exam',
    icon: BookOpen,
    description: 'Generates a 12-mark Osmania University Cryptography answer with formal mathematical proofs, diagrams, and glossary table.',
    promptText: 'Explain the internal architecture and 16-round Feistel structure of the Data Encryption Standard (DES). Critically evaluate key vulnerabilities that led to Triple DES.'
  },
  {
    id: 'sentiment_12mark',
    title: 'Sentiment Analysis 12-Mark Evaluator',
    category: 'exam',
    icon: BookOpen,
    description: 'Evaluates document-level vs sentence-level sentiment classification pipelines with feature selection (n-grams, POS tags).',
    promptText: 'Explain Supervised Document-Level Sentiment Classification. Detail feature selection techniques (n-grams, POS tags) and machine learning classifiers.'
  },
  {
    id: 'code_explainer',
    title: 'Code Explainer & Line-by-Line Refactor',
    category: 'code',
    icon: Code,
    description: 'Explains complex algorithms line-by-line, highlighting time/space complexity O(N) and optimal patterns.',
    promptText: 'Explain the following algorithm step-by-step with time and space complexity analysis:\n\n```javascript\nfunction example() {}\n```'
  },
  {
    id: 'kroki_diagram_gen',
    title: 'Multi-Engine Kroki Diagram Generator',
    category: 'diagram',
    icon: Layers,
    description: 'Generates visual schemas using Mermaid, PlantUML Mindmaps, Graphviz directed graphs, or ERD database schemas.',
    promptText: 'Create a clear visual Kroki diagram (using Mermaid or Graphviz) illustrating a Microservices E-Commerce Architecture with API Gateway, Auth Service, and Database.'
  },
  {
    id: 'kmeans_derivation',
    title: 'k-Means Clustering & Centroid Update Rule',
    category: 'exam',
    icon: Terminal,
    description: 'Derives within-cluster sum of squares (WCSS) minimization equations using KaTeX LaTeX notation and a workflow diagram.',
    promptText: 'Explain k-Means clustering, including centroid update rules and convergence conditions with LaTeX formulas and a Mermaid flowchart.'
  }
];

interface PromptLibraryViewProps {
  onUsePrompt: (promptText: string) => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ onUsePrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'exam' | 'code' | 'diagram'>('all');

  const filteredPrompts = PROMPT_TEMPLATES.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="prompt-library-container">
      <div className="library-header">
        <div className="library-title-area">
          <Sparkles className="text-cyan-400" size={24} />
          <div>
            <h2>Prompt Library & Template Hub</h2>
            <p className="subtitle">Pre-configured academic evaluators, code explainers & diagram generators</p>
          </div>
        </div>

        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search prompts by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="category-filter-tabs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          All Prompts ({PROMPT_TEMPLATES.length})
        </button>
        <button
          onClick={() => setSelectedCategory('exam')}
          className={`filter-btn ${selectedCategory === 'exam' ? 'active' : ''}`}
        >
          🎓 Exam Evaluators
        </button>
        <button
          onClick={() => setSelectedCategory('code')}
          className={`filter-btn ${selectedCategory === 'code' ? 'active' : ''}`}
        >
          💻 Code Explainers
        </button>
        <button
          onClick={() => setSelectedCategory('diagram')}
          className={`filter-btn ${selectedCategory === 'diagram' ? 'active' : ''}`}
        >
          🎨 Diagram Generators
        </button>
      </div>

      <div className="prompts-grid">
        {filteredPrompts.map((item) => {
          const IconComp = item.icon;
          return (
            <div key={item.id} className="prompt-card card-box">
              <div className="prompt-card-header">
                <div className="prompt-icon-box">
                  <IconComp size={18} className="text-cyan-400" />
                </div>
                <h3>{item.title}</h3>
              </div>

              <p className="prompt-desc">{item.description}</p>

              <div className="prompt-code-preview">
                <code>{item.promptText}</code>
              </div>

              <div className="prompt-card-footer">
                <button
                  onClick={() => onUsePrompt(item.promptText)}
                  className="btn btn-primary"
                >
                  <Send size={14} />
                  <span>Use Prompt in Chat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
