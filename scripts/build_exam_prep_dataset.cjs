const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Helper to convert structured syllabus units into glowing unit-box cards
function createSyllabusCard(unitTitle, moduleTag, topics, colorClass = 'unit-cyan', titleColor = '#38bdf8') {
  const topicsHtml = topics.map(t => {
    if (typeof t === 'string') {
      return `<p style="margin-bottom: 8px; line-height: 1.65; color: #cbd5e1; font-size: 0.9rem;">${t}</p>`;
    }
    return `
    <div style="margin-bottom: 12px; line-height: 1.65; color: #cbd5e1; font-size: 0.9rem;">
      <strong style="color: #f1f5f9; display: block; margin-bottom: 4px; font-size: 0.92rem;">• ${t.title}</strong>
      <span>${t.content}</span>
    </div>`;
  }).join('');

  return `
<div class="unit-box ${colorClass}">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: ${titleColor};">📘 ${unitTitle}</h4>
    <span class="unit-badge" style="background: rgba(255, 255, 255, 0.1); color: #f8fafc;">${moduleTag}</span>
  </div>
  <div class="unit-content">
    ${topicsHtml}
  </div>
</div>`;
}

function createBooksCard(books) {
  const booksHtml = books.map((b, i) => {
    const formattedBook = b
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #f1f5f9;">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em style="color: #94a3b8;">$1</em>');

    return `
    <div style="margin-bottom: 8px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
      <strong style="color: #fbbf24; margin-right: 6px;">${i + 1}.</strong> <span>${formattedBook}</span>
    </div>`;
  }).join('');

  return `
<div class="unit-box unit-amber">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #fbbf24;">📚 Recommended Textbooks &amp; Reference Books</h4>
    <span class="unit-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">REFERENCES</span>
  </div>
  <div class="unit-content">
    ${booksHtml}
  </div>
</div>`;
}

// 1. STATISTICAL INFERENCE (MDS-104-T)
data.stat_inference.syllabus = [
  createSyllabusCard(
    'UNIT - I: Estimation Theory, Methods of Estimation & Resampling',
    'MODULE 1',
    [
      { title: 'Estimation Theory', content: 'Basic concepts to estimation; Criteria for good estimator: Unbiasedness, consistency, efficiency, sufficiency, Cramer-Rao inequality, Rao-Blackwell theorem, Fisher Information, Lehmann-Scheffé theorem, Simple Problems on UMVUE.' },
      { title: 'Methods of Estimation', content: 'Method of Moments (MoM), Least Squares, and Maximum Likelihood (MLE), Properties and Simple problems.' },
      { title: 'Resampling Methods', content: 'Jackknife, Bootstrap, Estimation of bias and standard deviation of point estimation by Jackknife & Bootstrap methods with examples, U-statistic, Kernel and examples.' },
      { title: 'Interval Estimation', content: 'Confidence level, Confidence Intervals using pivots, and shortest length confidence interval.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Testing of Hypotheses & Non-Parametric Tests',
    'MODULE 2',
    [
      { title: 'Testing of Hypotheses', content: 'Concepts of testing, Statistical Hypothesis, Simple & Composite hypotheses, Null & Alternative hypotheses, Type-I & Type-II errors, Critical region, Level of significance, Power of test, Most Powerful (MP) test, Uniformly Most Powerful (UMP) test, Neyman-Pearson Lemma, Likelihood Ratio Test (LRT).' },
      { title: 'Sequential Analysis', content: 'Sequential Probability Ratio Test (SPRT) with examples.' },
      { title: 'Non-Parametric Tests', content: 'Kolmogorov-Smirnov (K-S) test for one & two samples, Kendall’s Tau test, Kruskal-Wallis test, Friedman test, Ansari-Bradley test.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Non-Parametric Density Estimation, Simulation & Bayesian Inference',
    'MODULE 3',
    [
      { title: 'Non-Parametric Density Estimation', content: 'Rosenblatt’s Naïve Estimator, Kernel Density Estimator (KDE) and its properties, Consistency and Mean Squared Error (MSE).' },
      { title: 'Simulation Techniques', content: 'Random number generation, Inverse transform method, Generating random variables from Exponential, Poisson, and Normal distributions using Box-Muller Transformation.' },
      { title: 'Bayesian Inference', content: 'Prior and Posterior distributions, Conjugate priors, Loss and Risk functions, Bayes estimators under squared error loss, MCMC (Markov Chain Monte Carlo) methods: Metropolis-Hastings Algorithm and Gibbs Sampler.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**V.K. Rohatgi and A.K. Md. E. Saleh**, *An Introduction to Probability and Statistics (3rd Edition), John Wiley & Sons.*',
    '**G. Casella and R.L. Berger**, *Statistical Inference (2nd Edition), Duxbury Press.*',
    '**E.J. Dudewicz and S.N. Mishra**, *Modern Mathematical Statistics, John Wiley & Sons.*',
    '**J.D. Gibbons and S. Chakraborti**, *Nonparametric Statistical Inference (5th Edition), CRC Press.*',
    '**B.W. Silverman**, *Density Estimation for Statistics and Data Analysis, Chapman & Hall.*',
    '**C.P. Robert and G. Casella**, *Monte Carlo Statistical Methods (2nd Edition), Springer.*'
  ])
].join('\n');

// 2. OPTIMIZATION TECHNIQUES (MDS-203)
data.opt_tech.syllabus = [
  createSyllabusCard(
    'UNIT - I: Linear Programming, Duality & Simplex Methods',
    'MODULE 1',
    [
      { title: 'Linear Programming Foundations', content: 'Convex sets, Mathematical formulation of LPP, Graphical solution method, Extreme points, Feasible solutions, Fundamental Theorem of Linear Programming.' },
      { title: 'Simplex Algorithms', content: 'Standard form of LPP, Slack and Surplus variables, Simplex algorithm, Charnes’ Big-M method (Method of Penalties), Two-Phase Simplex method, Degeneracy and cycling in LPP.' },
      { title: 'Duality Theory', content: 'Formulation of Dual problem, Primal-Dual relationships, Fundamental Duality Theorem, Weak Duality Theorem, Complementary Slackness theorem, Dual Simplex algorithm.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Transportation, Assignment & Sequencing Problems',
    'MODULE 2',
    [
      { title: 'Transportation Problem (TPP)', content: 'Mathematical formulation, Balanced & Unbalanced problems, Initial Basic Feasible Solution (IBFS) via North-West Corner, Least Cost, and Vogel’s Approximation Method (VAM), Optimality test using MODI (u-v) method, Degeneracy resolution.' },
      { title: 'Assignment Problem (AP)', content: 'Mathematical model, Hungarian Assignment method, Unbalanced assignment, Prohibited assignments, Traveling Salesman Problem (TSP).' },
      { title: 'Job Sequencing', content: 'Processing n jobs through 2 machines, Processing n jobs through 3 machines using Johnson’s algorithm, Processing 2 jobs through m machines.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Integer Programming, Network Analysis & Queuing Theory',
    'MODULE 3',
    [
      { title: 'Integer Linear Programming (ILPP)', content: 'Gomory’s Cutting Plane method for Pure and Mixed ILPP, Branch and Bound technique.' },
      { title: 'Network Analysis (CPM & PERT)', content: 'Project network representation, Critical Path Method (CPM), Early and Late event times, Floats (Total, Free, Independent), Project Evaluation and Review Technique (PERT), Probability of project completion, Time-Cost Trade-Off (Crashing).' },
      { title: 'Queuing Theory', content: 'Queuing system characteristics, Kendall’s notation, Birth-Death processes, Steady-state solutions of (M/M/1):(∞/FIFO) and (M/M/1):(N/FIFO) queuing models, Little’s formula.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Kanti Swarup, P.K. Gupta, and Man Mohan**, *Operations Research, Sultan Chand & Sons.*',
    '**Hamdy A. Taha**, *Operations Research: An Introduction (10th Edition), Pearson.*',
    '**F.S. Hillier and G.J. Lieberman**, *Introduction to Operations Research, McGraw Hill.*',
    '**S.D. Sharma**, *Operations Research: Theory, Methods and Applications, Kedar Nath Ram Nath.*'
  ])
].join('\n');

// 3. COMPUTER NETWORKS (MDS-302)
data.computer_networks.syllabus = [
  createSyllabusCard(
    'UNIT - I: Network Models, Physical Layer & Data Link Layer',
    'MODULE 1',
    [
      { title: 'Network Fundamentals', content: 'Network hardware, Network software, Reference models: OSI and TCP/IP reference models, Network standardization.' },
      { title: 'Physical Layer', content: 'Guided transmission media (Twisted Pair, Coaxial Cable, Fiber Optics), Wireless transmission, Multiplexing (FDM, TDM, WDM), Switching (Circuit, Message, Packet Switching).' },
      { title: 'Data Link Layer (DLL)', content: 'DLL design issues, Framing, Error detection and correction (Hamming Code, CRC), Elementary data link protocols, Sliding Window protocols (Stop-and-Wait, Go-Back-N, Selective Repeat).' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Medium Access, Network Layer & Internetworking',
    'MODULE 2',
    [
      { title: 'Medium Access Control (MAC)', content: 'Channel allocation, Multiple access protocols: ALOHA, CSMA, CSMA/CD, CSMA/CA, Collision-free protocols, IEEE 802.11 Wireless LAN, Connecting devices: Hubs, Switches, Bridges, Routers, Gateways.' },
      { title: 'Network Layer Design', content: 'Routing algorithms: Shortest path routing (Dijkstra), Distance Vector routing, Link State routing, Hierarchical routing, Congestion control algorithms: Leaky Bucket, Token Bucket.' },
      { title: 'Internetworking & IP Protocol', content: 'IPv4 addressing, Subnetting, CIDR, NAT, IPv6 architecture, Internet control protocols: ARP, RARP, ICMP, DHCP.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Transport Layer & Application Layer Protocols',
    'MODULE 3',
    [
      { title: 'Transport Layer', content: 'Transport service, Elements of transport protocols: Addressing, Connection establishment & release, Flow control & buffering, Multiplexing, Crash recovery.' },
      { title: 'Internet Transport Protocols', content: 'UDP format and RPC, TCP connection management, TCP segment header, TCP transmission policy, TCP timer management, TCP congestion control.' },
      { title: 'Application Layer', content: 'Domain Name System (DNS), Electronic Mail (SMTP, POP3, IMAP, MIME), World Wide Web (HTTP, HTTPS), File Transfer Protocol (FTP), SSH.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Andrew S. Tanenbaum and David J. Wetherall**, *Computer Networks (5th Edition), Pearson.*',
    '**Behrouz A. Forouzan**, *Data Communications and Networking (5th Edition), McGraw Hill.*',
    '**James F. Kurose and Keith W. Ross**, *Computer Networking: A Top-Down Approach (7th Edition), Pearson.*',
    '**William Stallings**, *Data and Computer Communications (10th Edition), Pearson.*'
  ])
].join('\n');

// 4. SOFTWARE ENGINEERING (MDS-204-T)
data.software_eng.syllabus = [
  createSyllabusCard(
    'UNIT - I: Software Process, Agility & Agile Development',
    'MODULE 1',
    [
      { title: 'Software Engineering Disciplines', content: 'The Nature of Software, Defining the Discipline, Software Process, Software Engineering Practice.' },
      { title: 'The Software Process', content: 'Generic Process Model, Framework Activities, Process Assessment & Improvement, Prescriptive Models, Specialized Models, Unified Process, Personal & Team Process Models.' },
      { title: 'Agility & Agile Process', content: 'Defining Agility, Agile Process, Extreme Programming (XP), Psychology of SE, Software Team Structures, Cloud-based SE, Global Teams.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Requirements Engineering, Analysis & Design Modeling',
    'MODULE 2',
    [
      { title: 'Requirements Engineering', content: 'Groundwork, Eliciting Requirements, Developing Use Cases, Building Analysis Models, UML Models supplementing Use Cases, Identifying Analysis Classes, Specifying Attributes & Operations.' },
      { title: 'Design Concepts', content: 'Design Process, Design Concepts: Abstraction, Architecture, Patterns, Modularity, Information Hiding, Functional Independence, Refactoring.' },
      { title: 'Architectural & Component Design', content: 'Software Architecture, Architectural Styles, Architectural Design, Component-Level Design, Designing Class-Based Components.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Quality Management, Software Testing & Maintenance',
    'MODULE 3',
    [
      { title: 'Quality Management', content: 'Quality Concepts, Software Quality Assurance (SQA), Formal Technical Reviews (FTR), Software Reliability, SQA Plan.' },
      { title: 'Software Testing Strategies', content: 'Strategic Approach, Unit Testing, Integration Testing, Validation Testing, System Testing, Art of Debugging.' },
      { title: 'Testing Techniques & Maintenance', content: 'Black-Box Testing (Equivalence Partitioning, Boundary Value Analysis), White-Box Testing (Basis Path Testing, Control Structure Testing), Software Maintenance and Reengineering.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Roger S. Pressman and Bruce R. Maxim**, *Software Engineering: A Practitioner’s Approach (8th Edition), McGraw Hill.*',
    '**Ian Sommerville**, *Software Engineering (10th Edition), Pearson.*',
    '**Pankaj Jalote**, *An Integrated Approach to Software Engineering (3rd Edition), Narosa Publishing.*'
  ])
].join('\n');

// 5. STATISTICAL INFERENCE LAB (MDS-108-P)
data.stat_inference_lab.syllabus = [
  createSyllabusCard(
    'Practical Lab Curriculum: Statistical Inference using R / Python',
    'LAB CURRICULUM',
    [
      { title: 'Point & Interval Estimation', content: 'Computation of Maximum Likelihood Estimators (MLE) and Method of Moments Estimators (MoM) for Poisson, Normal, and Exponential distributions. Construction of Confidence Intervals.' },
      { title: 'Resampling Methods', content: 'Implementation of Jackknife and Bootstrap algorithms for estimating bias, standard error, and confidence intervals.' },
      { title: 'Hypothesis Testing & Non-Parametric Tests', content: 'Implementation of Most Powerful tests, Likelihood Ratio Tests (LRT), Kolmogorov-Smirnov one/two sample tests, Kendall’s Tau, Kruskal-Wallis test, Friedman test, and Ansari-Bradley test.' },
      { title: 'Simulation & Bayesian Methods', content: 'Random variate generation using Inverse Transform and Box-Muller methods. Implementation of Metropolis-Hastings MCMC algorithm and Gibbs Sampler.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createBooksCard([
    '**V.K. Rohatgi**, *An Introduction to Probability and Statistics.*',
    '**Christian P. Robert and George Casella**, *Introducing Monte Carlo Methods with R, Springer.*'
  ])
].join('\n');

// 6. CRYPTOGRAPHY (MDS-401)
data.crypto.syllabus = [
  createSyllabusCard(
    'UNIT - I: Overview of Network Security & Block Ciphers',
    'MODULE 1',
    [
      { title: 'Overview of Network Security', content: 'OSI Security Architecture, Security Attacks, Security Services, Security Mechanisms, A Model for Network Security.' },
      { title: 'Classical Encryption Techniques', content: 'Symmetric Cipher Model, Substitution Techniques (Caesar, Playfair, Hill), Transposition Techniques, Rotor Machines, Steganography.' },
      { title: 'Block Ciphers & DES', content: 'Structure and Data Encryption Standard (DES), Strength of DES, Double and Triple DES, Block Cipher Modes: ECB, CBC, CFB, OFB, CTR.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: AES, Stream Ciphers & Public-Key Cryptography',
    'MODULE 2',
    [
      { title: 'Advanced Encryption Standard (AES)', content: 'Origins, Structure, Round Functions (SubBytes, ShiftRows, MixColumns, AddRoundKey), AES Key Expansion.' },
      { title: 'Stream Ciphers & PRNG', content: 'Principles, Block Cipher based PRNG, RC4 Stream Cipher architecture.' },
      { title: 'Public-Key Cryptography', content: 'Principles of Asymmetric Cryptosystems, RSA Algorithm, Diffie-Hellman Key Exchange, Key Management and Distribution, X.509 Certificates.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Hash Functions, Digital Signatures & System Security',
    'MODULE 3',
    [
      { title: 'Cryptographic Hash Functions & MAC', content: 'Applications, SHA and MD5 Algorithms, HMAC, CMAC, Digital Signatures (NIST DSA).' },
      { title: 'Transport & Network Security', content: 'SSL/TLS, HTTPS, SSH, E-Mail Security (PGP, S/MIME), IP Security (IPsec: AH, ESP, IKE).' },
      { title: 'System Security & Firewalls', content: 'Intruders, Intrusion Detection Systems (IDS), Password Management, Virus and Countermeasures, Firewall Design Principles and Types.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**William Stallings**, *Cryptography and Network Security – Principles and Practice (6th Edition).*',
    '**Douglas R. Stinson**, *Cryptography Theory and Practice.*',
    '**Joseph Migga Kizza**, *A Guide to Computer Network Security.*'
  ])
].join('\n');

// 7. DATA MINING (MDS-402)
data.datamining.syllabus = [
  createSyllabusCard(
    'UNIT - I: Data Mining Foundations & Data Understanding',
    'MODULE 1',
    [
      { title: 'Introduction to Data Mining', content: 'What is Data Mining, Motivating challenges, Major types of data mined, Data Mining functionalities and process.' },
      { title: 'Data Understanding & Similarity', content: 'Data Objects and Attribute Types (Nominal, Binary, Ordinal, Numeric), Basic statistical descriptions (Five-Number Summary), Data Visualization techniques, Measuring Data Similarity and Dissimilarity.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Frequent Pattern Mining & Classification',
    'MODULE 2',
    [
      { title: 'Frequent Pattern Mining', content: 'Basic concepts, Apriori Algorithm, Generating Association Rules from Frequent Itemsets, Improving Apriori efficiency, FP-Growth (FP-Tree) algorithm, Pattern Evaluation measures.' },
      { title: 'Classification', content: 'Decision Tree Induction (Attribute selection measures: Information Gain, Gain Ratio, Gini Index), Bayes Classification Methods (Naïve Bayes), Support Vector Machines (SVM), Classification by Backpropagation.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Cluster Analysis & Emerging Trends',
    'MODULE 3',
    [
      { title: 'Cluster Analysis', content: 'Overview, Partitioning Methods (K-Means, K-Medoids), Hierarchical Methods (AGNES, DIANA, BIRCH), Density-Based Methods (DBSCAN, OPTICS), Grid-Based Methods (STING, CLIQUE), Evaluation of Clustering.' },
      { title: 'Trends in Data Mining', content: 'Mining Complex Data Types, Mining Spatial, Multimedia, Text and Web Data, Data Mining applications and Social impacts.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Jiawei Han, Micheline Kamber, and Jian Pei**, *Data Mining: Concepts and Techniques (3rd Edition), Morgan Kaufmann.*',
    '**Pang-Ning Tan, Michael Steinbach, and Vipin Kumar**, *Introduction to Data Mining, Pearson.*'
  ])
].join('\n');

// 8. SENTIMENT ANALYSIS (MDS-403 A)
data.sentiment.syllabus = [
  createSyllabusCard(
    'UNIT - I: Basics, Applications & Document-Level Classification',
    'MODULE 1',
    [
      { title: 'Introduction & Foundations', content: 'Applications, Research Scope, Sentiment Analysis as Mini NLP. The Problem of Sentiment Analysis: Definition & Opinion Summary - Affect, Emotion, and Mood. Different Types of Opinions, Author vs. Reader Standpoint.' },
      { title: 'Document-Level Sentiment Classification', content: 'Supervised and Unsupervised Sentiment Classification, Sentiment Rating Prediction, Cross-Domain and Cross-Language Sentiment Classification, Emotion Classification of Documents.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Subjectivity, Sentence-Level Analysis & Lexicons',
    'MODULE 2',
    [
      { title: 'Subjectivity & Sentence Classification', content: 'Sentence Subjectivity, Sentiment Classification, Handling Conditional & Sarcastic Sentences, Cross-Language Classification, Discourse-Based Sentiment, Emotion Classification of Sentences.' },
      { title: 'Sentiment Lexicon Generation', content: 'Dictionary-Based Approach, Corpus-Based Approach, Desirable vs. Undesirable Facts.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Comparative Opinions, Summarization & Opinion Quality',
    'MODULE 3',
    [
      { title: 'Analysis of Comparative Opinions', content: 'Problem Definition, Identifying Comparative Sentences, Preferred Entity Set, Types of Comparison, Entity & Aspect Extraction.' },
      { title: 'Opinion Summarization & Search', content: 'Aspect-Based Summarization, Contrastive View, Traditional Summarization, Summarization of Comparative Opinions, Opinion Search & Retrieval Techniques.' },
      { title: 'Mining Intentions & Fake Opinions', content: 'Intention Mining Problem, Intention Classification, Fake/Deceptive Opinion Detection (Spam Types, Supervised Detection, Behavioral Analysis, Group Spam), Review Quality Estimation.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Bing Liu**, *Sentiment Analysis: Mining Opinions, Sentiments, and Emotions (Cambridge University Press, 2015).*'
  ])
].join('\n');

// 9. COMPUTER VISION (MDS-403 B)
data.vision.syllabus = [
  createSyllabusCard(
    'UNIT - I: Image Formation, Filtering & Feature Detection',
    'MODULE 1',
    [
      { title: 'Image Formation & Geometry', content: 'Geometric camera models, Pinhole camera, Camera calibration, Radiometry, Color physics, Human color perception.' },
      { title: 'Linear Filtering & Edge Detection', content: 'Convolution, Smoothing (Gaussian filtering), Edge detection: Sobel, Prewitt, Canny Edge Detector, Scale-space representations.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Image Segmentation, Texture & Feature Matching',
    'MODULE 2',
    [
      { title: 'Segmentation by Clustering', content: 'Active contours (Snakes), Level Set methods, Normalized Cuts, Mean Shift segmentation.' },
      { title: 'Texture & Feature Matching', content: 'Texture representation using filters, Local invariant features: Harris corner detector, SIFT (Scale-Invariant Feature Transform), SURF, RANSAC for model fitting.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Motion Analysis, 3D Vision & Recognition',
    'MODULE 3',
    [
      { title: 'Motion Estimation & Tracking', content: 'Optical flow (Lucas-Kanade, Horn-Schunck), Kalman Filter tracking, Particle filtering.' },
      { title: '3D Vision & Object Recognition', content: 'Epipolar geometry, Stereo reconstruction, Structure from Motion (SfM), Object recognition with Eigenfaces (PCA), Fisherfaces (LDA), and Deep Convolutional Neural Networks.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**David A. Forsyth and Jean Ponce**, *Computer Vision: A Modern Approach (2nd Edition), Pearson.*',
    '**Richard Szeliski**, *Computer Vision: Algorithms and Applications, Springer.*'
  ])
].join('\n');

// 10. WEB MINING (MDS-404 B)
data.webmining.syllabus = [
  createSyllabusCard(
    'UNIT - I: Web Data Mining & Sequential Pattern Mining',
    'MODULE 1',
    [
      { title: 'Web Mining Foundations', content: 'Web Data Mining vs. Traditional Data Mining, Association Rule Mining with Multiple Minimum Supports (MMS), Mining Class Association Rules (CARs).' },
      { title: 'Sequential Pattern Mining', content: 'GSP (Generalized Sequential Pattern) algorithm, PrefixSpan (Prefix-projected Sequential Pattern Mining), Mining Rules from Sequential Patterns.' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Supervised & Unsupervised Learning for Web Mining',
    'MODULE 2',
    [
      { title: 'Supervised Learning', content: 'Decision Tree classification for web pages, Naïve Bayes Text Classification, Support Vector Machines (SVM), Classification based on Associations (CBA), Rule Induction.' },
      { title: 'Unsupervised Learning', content: 'K-Means clustering, Hierarchical clustering (Single, Complete, Average Link), Text and Web Usage clustering.' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Information Retrieval, Link Analysis & Web Crawling',
    'MODULE 3',
    [
      { title: 'Information Retrieval (IR)', content: 'Boolean Model, Vector Space Model (TF-IDF), Latent Semantic Indexing (LSI), Evaluation measures (Precision, Recall, F-measure), Text Preprocessing (Stemming, Inverted Index).' },
      { title: 'Link Analysis & Web Crawling', content: 'PageRank Algorithm, HITS Algorithm (Hubs and Authorities), Community Discovery, Web Crawling architectures, BFS, Focused and Topical Crawlers, Web Spamming.' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Bing Liu**, *Web Data Mining: Exploring Hyperlinks, Contents, and Usage Data (2nd Edition), Springer.*',
    '**Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schütze**, *Introduction to Information Retrieval, Cambridge University Press.*'
  ])
].join('\n');

// 11. SCALABLE ARCHITECTURE (MDS-404 C)
data.scalable.syllabus = [
  createSyllabusCard(
    'UNIT - I: Scalability Foundations & Microservices Architecture',
    'MODULE 1',
    [
      { title: 'Scalability Principles', content: 'Vertical vs. Horizontal scaling, The AKF Scale Cube (X, Y, Z axis scaling), Stateless vs. Stateful services, CAP Theorem and PACELC Theorem.' },
      { title: 'Microservices Design', content: 'Decomposing monoliths, Service discovery, API Gateways, Inter-service communication (REST, gRPC, Event-Driven Messaging with Kafka/RabbitMQ).' }
    ],
    'unit-cyan',
    '#38bdf8'
  ),
  createSyllabusCard(
    'UNIT - II: Distributed Data Management & Caching',
    'MODULE 2',
    [
      { title: 'Distributed Storage & Partitioning', content: 'Database Sharding, Consistent Hashing, Replication strategies (Master-Slave, Multi-Master, Leaderless / Dynamo-style).' },
      { title: 'Caching Architectures', content: 'Caching patterns (Cache-Aside, Write-Through, Write-Behind), Distributed Caching (Redis, Memcached), Content Delivery Networks (CDN).' }
    ],
    'unit-indigo',
    '#818cf8'
  ),
  createSyllabusCard(
    'UNIT - III: Reliability, Concurrency & Stream Processing',
    'MODULE 3',
    [
      { title: 'High Availability & Fault Tolerance', content: 'Circuit Breaker pattern, Rate Limiting, Bulkhead pattern, Chaos Engineering, Distributed tracing (OpenTelemetry, Jaeger).' },
      { title: 'Distributed Stream Processing', content: 'Batch vs. Stream processing, Event Sourcing, CQRS, Real-time data pipelines (Apache Kafka, Apache Flink, Apache Spark Streaming).' }
    ],
    'unit-pink',
    '#f472b6'
  ),
  createBooksCard([
    '**Martin Kleppmann**, *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems, O’Reilly.*',
    '**Sam Newman**, *Building Microservices: Designing Fine-Grained Systems (2nd Edition), O’Reilly.*',
    '**Mark Richards and Neal Ford**, *Fundamentals of Software Architecture, O’Reilly.*'
  ])
].join('\n');

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Complete Exam Prep Dataset successfully rebuilt with highlighted glowing unit-box cards!');
