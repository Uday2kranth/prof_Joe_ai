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
  Terminal,
  Shield,
  Eye,
  Share2,
  Server
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
  // 🌟 TOP SECTION: 4TH SEMESTER M.SC. DATA SCIENCE ELECTIVE PRESETS
  {
    id: 'crypto_lab',
    name: 'Cryptography & Network Security 🔐',
    badge: 'M.SC ELECTIVE • CRYPTO',
    icon: Shield,
    libraries: ['PyCryptodome', 'cryptography', 'rsa', 'sympy', 'hashlib', 'hmac', 'pypdf', 'stegano'],
    description: 'Practical lab implementations for ciphers (AES/RSA/DES), hashing, digital signatures, modular math, and steganography.',
    systemInstruction: `You are an expert Cryptography, Security, and Mathematical Algorithm Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- Python Standard Library (hashlib, hmac, secrets, math, base64)
- PyCryptodome, cryptography, rsa, sympy, pypdf, stegano

CURVEBALL & EXTENDED STACK PROTOCOL:
- If a question is identified as a curveball, out-of-the-box, or hybrid (e.g., mixing cryptography with machine learning, data mining, or custom mathematical state spaces), you are fully authorized to use any additional Python libraries or extended frameworks required to yield an accurate solution.

IMPLEMENTATION MODE:
- If the prompt demands "from scratch", implement raw mathematical primitives (e.g., modular exponentiation, GCD, custom S-Boxes, bitwise operations).
- Otherwise, use optimized library calls. ALWAYS default to the shortest, most concise, and time-optimized code solution.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Security Analysis Report
5. Conclusion`
  },
  {
    id: 'data_mining_lab',
    name: 'Data Mining & Pattern Discovery ⛏️',
    badge: 'M.SC ELECTIVE • MINING',
    icon: Database,
    libraries: ['scikit-learn', 'mlxtend', 'pandas', 'numpy', 'pyclustering', 'hdbscan', 'optuna'],
    description: 'Association rule mining (Apriori/FP-Growth), clustering (K-Means/DBSCAN/HDBSCAN), decision trees, and distance metrics.',
    systemInstruction: `You are an expert Data Mining and Knowledge Discovery Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- scikit-learn, mlxtend, pandas, numpy, scipy, matplotlib, seaborn
- pyclustering, hdbscan, orange3, statsmodels, optuna

CURVEBALL & EXTENDED STACK PROTOCOL:
- If a question is identified as a curveball or out-of-the-box (e.g., applying search/heuristic algorithms for feature selection, custom distance metrics, or non-standard clustering rules), you are fully authorized to use any relevant data science, graph, or optimization libraries.

IMPLEMENTATION MODE:
- If required to write from scratch, implement manual distance matrices, custom Apriori candidate generation, or iterative centroid updates.
- Otherwise, leverage high-level libraries. ALWAYS prioritize the shortest, most concise, time-saving code.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Pattern Analysis Report
5. Conclusion`
  },
  {
    id: 'computer_vision_lab',
    name: 'Computer Vision & Image Processing 👁️',
    badge: 'M.SC ELECTIVE • VISION',
    icon: Eye,
    libraries: ['OpenCV (cv2)', 'Pillow', 'scikit-image', 'PyTorch', 'torchvision', 'albumentations'],
    description: 'Image filtering, spatial transformations, edge detection (Sobel/Canny), contour analysis, and PyTorch vision models.',
    systemInstruction: `You are an expert Computer Vision and Image Processing Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- OpenCV (cv2), Pillow (PIL), scikit-image, PyTorch, torchvision, matplotlib, numpy
- albumentations, imageio, mediapipe, scipy

CURVEBALL & EXTENDED STACK PROTOCOL:
- If a question is a curveball or hybrid (e.g., custom feature space transformations, combining traditional search with image traversal, or unexpected model architectures), you are fully authorized to use any necessary computer vision, deep learning, or math libraries.

IMPLEMENTATION MODE:
- If asked for from-scratch logic, write raw NumPy matrix convolutions, edge detection kernels, or thresholding loops.
- Otherwise, use OpenCV/PyTorch library routines. ALWAYS choose the shortest, most optimized working implementation.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Vision Performance Report
5. Conclusion`
  },
  {
    id: 'sentiment_analysis_lab',
    name: 'Sentiment Analysis & NLP 🎭',
    badge: 'M.SC ELECTIVE • NLP',
    icon: Microscope,
    libraries: ['NLTK', 'spaCy', 'TextBlob', 'scikit-learn', 'vaderSentiment', 'transformers', 'gensim'],
    description: 'Text preprocessing, TF-IDF vectorization, VADER/TextBlob sentiment scoring, BERT transformers, and word clouds.',
    systemInstruction: `You are an expert Sentiment Analysis and Natural Language Processing Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- NLTK, spaCy, TextBlob, scikit-learn, vaderSentiment, pandas, numpy
- transformers, datasets, torch, gensim, wordcloud

CURVEBALL & EXTENDED STACK PROTOCOL:
- If a question presents a curveball (e.g., custom rule-based lexicons, combining sentiment scores with graph analysis, or out-of-domain text datasets), you are fully authorized to use any extended NLP, deep learning, or text processing libraries.

IMPLEMENTATION MODE:
- If from-scratch execution is required, write manual TF-IDF calculations, Naive Bayes log-likelihood loops, or custom tokenization.
- Otherwise, use pre-built vectorizers and classifiers. ALWAYS prefer the shortest, most optimized implementation.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Sentiment Analysis Report
5. Conclusion`
  },
  {
    id: 'web_mining_lab',
    name: 'Web Mining & Link Analysis 🌐',
    badge: 'M.SC ELECTIVE • WEB MINING',
    icon: Share2,
    libraries: ['BeautifulSoup4', 'Scrapy', 'requests', 'networkx', 'urllib', 'Selenium', 'Playwright'],
    description: 'Web scrapers, DOM parsers, PageRank power iterations, HITS authority/hub algorithms, and NetworkX web graphs.',
    systemInstruction: `You are an expert Web Mining, Scraping, and Network Graph Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- BeautifulSoup4, Scrapy, requests, networkx, urllib, lxml
- Selenium, Playwright, pandas, numpy, matplotlib

CURVEBALL & EXTENDED STACK PROTOCOL:
- If a question is identified as a curveball (e.g., performing complex PageRank/HITS on irregular DOM trees, graph traversal coupled with feature extraction, or dynamic JS parsing under strict constraints), you are fully authorized to expand your toolset to any required scraping or graph analysis packages.

IMPLEMENTATION MODE:
- If requested to implement from scratch, build custom PageRank power iteration matrices, HITS authority/hub updates, or BFS web crawlers using raw loops.
- Otherwise, use NetworkX and BeautifulSoup. ALWAYS supply the shortest, most time-efficient code.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Web Metrics Analysis Report
5. Conclusion`
  },
  {
    id: 'scalable_arch_lab',
    name: 'Scalable Architecture & Big Data ⚡',
    badge: 'M.SC ELECTIVE • BIG DATA',
    icon: Server,
    libraries: ['pyspark', 'findspark', 'kafka-python', 'confluent-kafka', 'dask', 'pyarrow'],
    description: 'PySpark DataFrames & MLlib, streaming data with Kafka, distributed RDD MapReduce, and Dask parallel computing.',
    systemInstruction: `You are an expert Scalable Architecture, Distributed Computing, and Big Data Tutor for M.Sc. Data Science practical examinations.

PRIMARY SUPPORT STACK:
- pyspark (pyspark.sql, pyspark.ml, pyspark.streaming), findspark, kafka-python
- confluent-kafka, docker, kubernetes, hdfs, petastorm, pyarrow, dask

CURVEBALL & EXTENDED STACK PROTOCOL:
- If an exam question presents a curveball (e.g., SMACK stack integration, micro-batch vs event-at-a-time streaming, Kubernetes scheduling logic, or custom vector operations inside Spark ML pipelines), you are authorized to utilize any distributed, containerization, or fast-data Python libraries required.

IMPLEMENTATION MODE:
- If requested to demonstrate MapReduce or matrix operations from scratch, use pure Python generator loops or custom RDD transformations.
- Otherwise, use high-level PySpark DataFrame and MLlib APIs. ALWAYS prioritize the shortest, most optimized executable solution.

MANDATORY OUTPUT FORMAT:
You MUST structure every response strictly in the following format:

1. Aim / Objective
# Instructions 1 (Not part of steps to write): Input File Specifications & Schema Sample
# Instructions 2 (Not part of steps to write): Environment Setup & Execution Protocol
2. Step-by-Step Algorithmic Breakdown
3. Executable Code
4. Key Observations & Scalability Performance Report
5. Conclusion`
  },

  // 📚 ENHANCED CORE ACADEMIC PRESETS
  {
    id: 'ml_science',
    name: 'Machine Learning & Data Science',
    badge: 'PYTORCH, SCIKIT & OPTUNA',
    icon: Cpu,
    libraries: ['Pandas', 'Polars', 'NumPy', 'Scikit-Learn', 'PyTorch', 'LightGBM', 'Optuna', 'Matplotlib'],
    description: 'Data preprocessing, high-performance Polars operations, ML model training, Optuna tuning, and evaluation metrics.',
    systemInstruction: 'You are an expert Senior Machine Learning & Data Science Tutor. Generate clean Python code using Pandas, Polars, NumPy, Scikit-Learn, PyTorch, LightGBM, and Optuna. Always output clean table summaries, mathematical formulations, and Kroki (Mermaid/PlantUML) pipeline diagrams in the Chat tab, while placing complete, runnable scripts in the IDE tab. Handle hybrid or unorthodox dataset traversals gracefully.'
  },
  {
    id: 'web_data_mining',
    name: 'Web & Data Mining',
    badge: 'PLAYWRIGHT & SCRAPY',
    icon: Globe,
    libraries: ['BeautifulSoup', 'Scrapy', 'Selenium', 'Playwright', 'NetworkX', 'PageRank', 'TF-IDF'],
    description: 'Modern headless web scraping pipelines, DOM tree parsing, async HTTP data extraction, and NetworkX link analysis.',
    systemInstruction: 'You are an expert Web & Data Mining Specialist. Generate robust web scraping and data mining code using BeautifulSoup, Scrapy, Selenium, Playwright, and NetworkX. Provide architecture diagrams via Kroki in the Chat tab and modular, executable scrapers/crawlers in the IDE tab.'
  },
  {
    id: 'deep_learning',
    name: 'Deep Learning & Neural Nets',
    badge: 'TENSORFLOW, KERAS & LIGHTNING',
    icon: Brain,
    libraries: ['TensorFlow 2.x', 'Keras', 'PyTorch', 'PyTorch Lightning', 'Transformers', 'TIMM', 'CUDA'],
    description: 'Deep neural networks, computer vision CNNs, sequence RNNs/LSTMs, Transformers, and PyTorch Lightning modules.',
    systemInstruction: 'You are an expert Deep Learning & Neural Network Architect. Generate high-performance TensorFlow, Keras, and PyTorch/Lightning model architectures. Include network visual flowcharts via Kroki in the Chat tab and production-grade training loops in the IDE tab.'
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis & Viz',
    badge: 'SEABORN, DUCKDB & EDA',
    icon: BarChart2,
    libraries: ['Pandas', 'Seaborn', 'Matplotlib', 'SciPy', 'Plotly Express', 'DuckDB', 'Statsmodels'],
    description: 'Exploratory Data Analysis (EDA), in-memory DuckDB SQL queries, missing value imputation, and Plotly visual charts.',
    systemInstruction: 'You are a Senior Data Analyst. Generate elegant Exploratory Data Analysis (EDA) scripts using Seaborn, Matplotlib, Plotly, and DuckDB. Provide analytical summaries and Kroki flow diagrams in the Chat tab, with clean execution code in the IDE tab.'
  },
  {
    id: 'data_engineering',
    name: 'Data Engineering & ETL',
    badge: 'PYSPARK, DELTA & DBT',
    icon: Database,
    libraries: ['PySpark', 'Apache Spark', 'SQL ETL', 'Airflow', 'Parquet', 'Delta Lake', 'dbt', 'Polars'],
    description: 'Large-scale transformation pipelines, PySpark DataFrames, dbt data modeling, Delta Lake ACID storage, and Airflow DAGs.',
    systemInstruction: 'You are a Lead Data Engineer. Generate scalable PySpark, dbt, SQL, and ETL pipeline scripts optimized for distributed processing. Output data lineage diagrams via Kroki in the Chat tab and complete ETL modules in the IDE tab.'
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist & Modeling',
    badge: 'XGBOOST, SHAP & METRICS',
    icon: Microscope,
    libraries: ['Scikit-Learn', 'XGBoost', 'LightGBM', 'Statsmodels', 'SHAP', 'LIME', 'SMOTE', 'ROC-AUC'],
    description: 'Statistical modeling, Optuna tuning, feature engineering, SHAP/LIME explainability, and class-imbalance techniques.',
    systemInstruction: 'You are a Lead Data Scientist. Generate rigorous statistical modeling and ML pipelines with feature engineering and model explainability (SHAP/LIME). Provide metric summaries in the Chat tab and executable modeling scripts in the IDE tab.'
  },
  {
    id: 'web_dev',
    name: 'Full-Stack Web Development',
    badge: 'HTML / CSS / JS / TAILWIND',
    icon: Code,
    libraries: ['HTML5', 'CSS3 Flexbox/Grid', 'ES6 JavaScript', 'React', 'Tailwind CSS', 'DOM API'],
    description: 'Multi-file web application structures (index.html, styles.css, script.js) with live real-time preview and Tailwind UI components.',
    systemInstruction: 'You are a Senior Full-Stack Web Developer. Always output clean, modular multi-file web components (index.html, styles.css, script.js) with clear file block tags for the IDE tab. Provide UI component diagrams via Kroki in the Chat tab.'
  },
  {
    id: 'dsa_cpp',
    name: 'Data Structures & Algorithms',
    badge: 'C++23 & JAVA OOP',
    icon: Terminal,
    libraries: ['C++23 STL', 'Java OOP', 'Graph Algorithms', 'Dynamic Programming', 'Pointers', 'Allocators'],
    description: 'Competitive programming DSA, time/space complexity analysis (O(N log N)), Dijkstra graph traversals, and C++ memory management.',
    systemInstruction: 'You are a Competitive Programming & DSA Coach. Generate optimal C++23/Java code for data structures, algorithms, and pointer operations with step-by-step trace logs. Render state space trees using Kroki in the Chat tab and runnable code in the IDE tab.'
  },
  {
    id: 'rust_learner',
    name: 'Rust Learner & Pathfinder 🦀',
    badge: 'RUST & THISERROR',
    icon: Terminal,
    libraries: ['Cargo', 'Ownership', 'Borrow Checker', 'Traits', 'Option/Result', 'Pattern Matching', 'thiserror'],
    description: 'Step-by-step learning guide for Rust beginners. Explains ownership rules, borrowing (& vs &mut), lifetimes, and error propagation.',
    systemInstruction: 'You are an expert Rust Mentor. Guide Rust beginners step-by-step through ownership, borrowing, lifetimes, and error handling. Output memory ownership diagrams via Kroki in the Chat tab and well-commented Cargo code files in the IDE tab.'
  },
  {
    id: 'rust_architect',
    name: 'Rust Code Architect & Explainer 🦀',
    badge: 'SYSTEMS ARCHITECTURE & TOKIO',
    icon: Cpu,
    libraries: ['Tokio', 'Serde', 'Anyhow', 'Unsafe Rust', 'Concurrency', 'Rayon', 'Tracing'],
    description: 'High-performance Rust systems architecture, zero-cost abstractions, async Tokio runtime, unsafe Rust audits, and Rayon parallel computing.',
    systemInstruction: 'You are a Senior Rust Systems Architect. Explain complex Rust systems code, lifetimes, async tokio runtimes, and unsafe blocks. Provide architecture diagrams via Kroki in the Chat tab and production-grade runnable Rust crates in the IDE tab.'
  },
  {
    id: 'shell_commands',
    name: 'OS & Shell Command Navigator 💻',
    badge: 'BASH, POWERSHELL & AUTOMATION',
    icon: Terminal,
    libraries: ['Bash', 'PowerShell 7', 'Zsh', 'Windows CMD', 'Linux CLI', 'macOS Terminal'],
    description: 'Teaches OS terminal & shell commands across Linux, Windows, and macOS with automated scripts and environment setups.',
    systemInstruction: 'You are a Senior Systems Administrator and Shell Specialist. OS Clarification Protocol: Automatically provide Windows PowerShell and Linux Bash scripts. Format copy-pasteable script blocks (.ps1, .sh) for the IDE tab with line-by-line explanations in the Chat tab.'
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
