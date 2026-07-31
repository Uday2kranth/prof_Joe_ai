import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Zap, 
  Cpu, 
  Globe, 
  Brain, 
  BarChart2, 
  Database, 
  Microscope, 
  Code, 
  Terminal
} from 'lucide-react';

export interface CodeLabPreset {
  id: string;
  name: string;
  badge: string;
  icon: any;
  libraries: string[];
  description: string;
  systemInstruction: string;
}

export const ACADEMIC_PRESETS: CodeLabPreset[] = [
  {
    id: 'ml_science',
    name: 'Machine Learning & Data Science',
    badge: 'PYTORCH & SCIKIT',
    icon: Cpu,
    libraries: ['Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'Matplotlib'],
    description: 'Data preprocessing, paper dataset CSV conversion, ML model training, evaluation metrics, and train-test splits.',
    systemInstruction: 'You are an expert Senior Machine Learning & Data Science Tutor. Generate clean Python code using Pandas, NumPy, Scikit-Learn, and PyTorch. Always format tables cleanly and handle dataset CSV loading.'
  },
  {
    id: 'web_data_mining',
    name: 'Web & Data Mining',
    badge: 'SCRAPY & BEAUTIFULSOUP',
    icon: Globe,
    libraries: ['BeautifulSoup', 'Scrapy', 'Selenium', 'PageRank', 'TF-IDF', 'Requests'],
    description: 'Web scraping pipelines, HTML DOM parsing, crawler logic, TF-IDF text mining, PageRank, and network graphs.',
    systemInstruction: 'You are an expert Web & Data Mining Specialist. Generate robust web scraping and data mining code using BeautifulSoup, Scrapy, Selenium, and text processing libraries.'
  },
  {
    id: 'deep_learning',
    name: 'Deep Learning & Neural Nets',
    badge: 'TENSORFLOW & KERAS',
    icon: Brain,
    libraries: ['TensorFlow 2.x', 'Keras', 'PyTorch', 'CNNs', 'RNNs', 'CUDA'],
    description: 'Deep neural networks, computer vision CNNs, sequence LSTMs, Transformers, loss curves, and GPU training setup.',
    systemInstruction: 'You are an expert Deep Learning & Neural Network Architect. Generate high-performance TensorFlow, Keras, and PyTorch model architectures with custom layers and CUDA optimization.'
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis & Viz',
    badge: 'SEABORN & EDA',
    icon: BarChart2,
    libraries: ['Pandas', 'Seaborn', 'Matplotlib', 'SciPy', 'Plotly', 'EDA'],
    description: 'Exploratory Data Analysis (EDA), missing value imputation, correlation heatmaps, statistical distribution tests, and plots.',
    systemInstruction: 'You are a Senior Data Analyst. Generate elegant Exploratory Data Analysis (EDA) scripts using Seaborn, Matplotlib, and Pandas with clean visual plots.'
  },
  {
    id: 'data_engineering',
    name: 'Data Engineering & ETL',
    badge: 'PYSPARK & AIRFLOW',
    icon: Database,
    libraries: ['PySpark', 'Apache Spark', 'SQL ETL', 'Airflow', 'Parquet', 'Kafka'],
    description: 'Distributed data pipelines, PySpark dataframes, ETL workflows, star schema warehousing, and SQL queries.',
    systemInstruction: 'You are a Lead Data Engineer. Generate scalable PySpark, SQL, and ETL pipeline scripts optimized for large-scale data processing.'
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist & Modeling',
    badge: 'XGBOOST & METRICS',
    icon: Microscope,
    libraries: ['Scikit-Learn', 'XGBoost', 'LightGBM', 'Statsmodels', 'ROC-AUC'],
    description: 'Statistical modeling, hypothesis testing, hyperparameter tuning (GridSearch), feature engineering, and ROC-AUC curves.',
    systemInstruction: 'You are a Lead Data Scientist. Generate rigorous statistical modeling and machine learning pipelines with cross-validation and feature engineering.'
  },
  {
    id: 'web_dev',
    name: 'Full-Stack Web Development',
    badge: 'HTML / CSS / JS',
    icon: Code,
    libraries: ['HTML5', 'CSS3 Flexbox/Grid', 'ES6 JavaScript', 'DOM API', 'React'],
    description: 'Multi-file web app structures (index.html, styles.css, script.js), responsive layouts, and modern frontend logic.',
    systemInstruction: 'You are a Senior Full-Stack Web Developer. Always output clean, modular multi-file web components (index.html, styles.css, script.js) with clear code block file tags.'
  },
  {
    id: 'dsa_cpp',
    name: 'Data Structures & Algorithms',
    badge: 'C++ & JAVA OOP',
    icon: Terminal,
    libraries: ['C++20 STL', 'Java OOP', 'Pointers', 'Graph Algorithms', 'DP'],
    description: 'Competitive programming DSA, time/space complexity analysis (O(N log N)), dynamic programming, and OOP classes.',
    systemInstruction: 'You are a Competitive Programming & DSA Coach. Generate clean C++/Java code for data structures, algorithms, and pointer management with time complexity annotations.'
  },
  {
    id: 'rust_learner',
    name: 'Rust Learner & Pathfinder 🦀',
    badge: 'RUST & CARGO',
    icon: Terminal,
    libraries: ['Cargo', 'Ownership', 'Borrow Checker', 'Traits', 'Option/Result', 'Pattern Matching'],
    description: 'Step-by-step guidance for Rust beginners. Teaches memory ownership, borrowing rules, lifetimes, pattern matching, Option/Result, and Cargo project structures with beginner-friendly mental models.',
    systemInstruction: 'You are an expert Rust Mentor. Guide Rust beginners step-by-step. Focus on ownership, borrowing rules, lifetimes, Option/Result error handling, and Cargo project structure. Provide clean, well-commented Rust code files.'
  },
  {
    id: 'rust_architect',
    name: 'Rust Code Architect & Explainer 🦀',
    badge: 'SYSTEMS ARCHITECTURE',
    icon: Cpu,
    libraries: ['Tokio', 'Serde', 'Anyhow', 'Unsafe Rust', 'Concurrency', 'Rayon'],
    description: 'In-depth Rust code analysis, zero-cost abstractions, lifetime debugging, async tokio runtime, unsafe Rust safety checks, AND provides full production-ready runnable Rust files when requested.',
    systemInstruction: 'You are a Senior Rust Systems Architect. Explain complex Rust code, lifetimes, async tokio runtime, unsafe blocks, and performance profiling. Always output complete, production-grade runnable Rust source files.'
  },
  {
    id: 'shell_commands',
    name: 'OS & Shell Command Navigator 💻',
    badge: 'BASH & POWERSHELL',
    icon: Terminal,
    libraries: ['Bash', 'PowerShell 7', 'Zsh', 'Windows CMD', 'Linux CLI', 'macOS Terminal'],
    description: 'Teaches OS terminal & shell commands (Linux, Windows PowerShell, macOS Zsh). Focuses on practical, highly useful everyday & advanced commands, environment setup, and automation scripts.',
    systemInstruction: 'You are a Senior Systems Administrator and Shell Command Specialist. Focus primarily on Windows PowerShell and Linux Bash commands. OS Clarification Protocol: If a user prompt does not specify their OS or shell, ask the user for their OS (Windows, Linux, macOS) and version/shell environment before providing exact, version-accurate commands. Provide copy-pasteable script blocks (.ps1, .sh) with clear line-by-line explanations.'
  }
];

interface CodeLabPresetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId: string;
  onSelectPreset: (preset: CodeLabPreset | null) => void;
  onResetPresetChat?: (presetId: string) => void;
}

export function CodeLabPresetDrawer({
  isOpen,
  onClose,
  activePresetId,
  onSelectPreset,
  onResetPresetChat
}: CodeLabPresetDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="preset-drawer-overlay" onClick={onClose}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="preset-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Academic Code Lab Presets</span>
                  <span className="extractor-studio-tag">BENTO DRAWER</span>
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Select a specialized developer mode for your lab assignment</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bento Card Grid */}
            <div className="preset-bento-grid">
              {ACADEMIC_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isActive = activePresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className={`preset-bento-card ${isActive ? 'active-preset' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: isActive ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                            {preset.name}
                          </h3>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
                            {preset.badge}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                      {preset.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {preset.libraries.map((lib) => (
                        <span key={lib} className="extractor-format-chip">
                          {lib}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {isActive ? (
                        <>
                          {onResetPresetChat && (
                            <button
                              type="button"
                              onClick={() => onResetPresetChat(preset.id)}
                              className="extractor-btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                              title="Clear chat and start fresh for this preset"
                            >
                              <span>🔄 Reset Chat</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectPreset(null)}
                            className="extractor-btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#f43f5e' }}
                          >
                            <X size={13} />
                            <span>Disable</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPreset(preset);
                            onClose();
                          }}
                          className="extractor-btn-primary"
                          style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                        >
                          <Zap size={13} />
                          <span>Activate Preset</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
