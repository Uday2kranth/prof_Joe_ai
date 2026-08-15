const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Helper to wrap syllabus markdown units into HTML unit-box cards
function formatSyllabusToUnitBoxes(subjectKey, subjectObj) {
  const rawSyllabus = subjectObj.syllabus;
  if (!rawSyllabus) return;

  // Split by unit markdown headers (### 📘 UNIT or ### UNIT or ### 📚)
  const sections = rawSyllabus.split(/(?=###\s+(?:📘\s+)?UNIT|###\s+📚)/i);
  
  if (sections.length <= 1) return; // if not matching unit format, skip

  let formattedHtml = '';
  
  const colors = ['unit-cyan', 'unit-indigo', 'unit-pink', 'unit-emerald'];
  const badges = ['MODULE 1', 'MODULE 2', 'MODULE 3', 'MODULE 4'];

  sections.forEach((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    if (trimmed.includes('Recommended Textbooks') || trimmed.includes('Reference Books') || trimmed.includes('📚')) {
      // Books section
      const lines = trimmed.split('\n');
      const headerLine = lines[0].replace(/^###\s*/, '').replace(/📘|📚/g, '').trim();
      const bodyLines = lines.slice(1).join('\n').trim();

      formattedHtml += `
<div class="unit-box unit-amber">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #fbbf24;">📚 ${headerLine}</h4>
    <span class="unit-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">REFERENCES</span>
  </div>
  <div class="unit-content" style="color: var(--text-primary); line-height: 1.7; font-size: 0.9rem;">
    ${bodyLines.split('\n').map(l => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()) ? `<div style="margin-bottom: 6px;">${l.replace(/^[-*]\s*/, '• ')}</div>` : `<p style="margin-bottom: 8px;">${l}</p>`).join('')}
  </div>
</div>`;
    } else {
      // Unit section
      const lines = trimmed.split('\n');
      const headerLine = lines[0].replace(/^###\s*/, '').replace(/📘/g, '').trim();
      const bodyLines = lines.slice(1).join('\n').trim();

      const colorClass = colors[idx % colors.length];
      const badgeText = badges[idx % badges.length];

      // Parse unit topics and subheadings
      const formattedBody = bodyLines.split('\n\n').map(block => {
        let bl = block.trim();
        if (!bl) return '';
        // Clean leading bullet asterisks or dashes
        bl = bl.replace(/^[-*]\s*/gm, '').trim();
        if (bl === '---') return '';
        if (bl.startsWith('**') && bl.endsWith('**')) {
          return `<div style="color: #f8fafc; font-weight: 700; margin-top: 12px; margin-bottom: 6px; font-size: 0.94rem;">${bl.replace(/\*\*/g, '')}</div>`;
        }
        if (bl.includes('**')) {
          // Has bold subtitle followed by text
          return `<div style="margin-bottom: 12px; line-height: 1.65; color: #cbd5e1; font-size: 0.9rem;">${bl.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #f1f5f9; display: block; margin-bottom: 4px; font-size: 0.92rem;">• $1</strong>')}</div>`;
        }
        return `<p style="margin-bottom: 10px; line-height: 1.65; color: #cbd5e1; font-size: 0.9rem;">${bl}</p>`;
      }).filter(Boolean).join('');

      formattedHtml += `
<div class="unit-box ${colorClass}">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: ${colorClass === 'unit-cyan' ? '#38bdf8' : colorClass === 'unit-indigo' ? '#818cf8' : colorClass === 'unit-pink' ? '#f472b6' : '#34d399'};">📘 ${headerLine}</h4>
    <span class="unit-badge" style="background: rgba(255, 255, 255, 0.1); color: #f8fafc;">${badgeText}</span>
  </div>
  <div class="unit-content">
    ${formattedBody}
  </div>
</div>`;
    }
  });

  subjectObj.syllabus = formattedHtml;
}

// 1. STATISTICAL INFERENCE (MDS-104-T)
data.stat_inference['question-bank'] = `<h3 style="color: var(--text-main); margin-bottom: 1.25rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">SECTION I: COMPREHENSIVE IMPORTANT QUESTIONS LIST (UNIT-WISE)</h3>

<div class="unit-box unit-cyan">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #38bdf8;">UNIT-I: Estimation Theory, Methods of Estimation &amp; Resampling</h4>
        <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">CORE ESTIMATION</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>State the criteria for a good point estimator and define unbiasedness with an example.</li>
        <li>Define Fisher Information and write its mathematical expression for a single parameter.</li>
        <li>Define the U-statistic and state its core objective in estimation.</li>
        <li>Explain the main difference between the Jackknife and Bootstrap resampling methods.</li>
        <li>Define confidence interval and explain the concept of a pivot (pivotal quantity).</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Higher-Order Thinking (Application &amp; Analysis – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Cramer-Rao Inequality:</strong> State and prove the Cramer-Rao Inequality. Explain the conditions under which the lower bound of variance is achieved.</li>
        <li><strong>Rao-Blackwell Theorem:</strong> State and prove the Rao-Blackwell Theorem. Explain how it is used to improve an unbiased estimator using a sufficient statistic.</li>
        <li><strong>Lehmann-Scheffé Theorem:</strong> State and prove the Lehmann-Scheffé Theorem. Explain its application in constructing a Uniformly Minimum Variance Unbiased Estimator (UMVUE).</li>
        <li><strong>Poisson Estimation (MLE &amp; MoM):</strong> Derive the Maximum Likelihood Estimator (MLE) and Method of Moments Estimator (MME) for the parameter θ of a Poisson distribution, and analyze their properties.</li>
        <li><strong>Normal Parameters Estimation:</strong> Derive the Maximum Likelihood Estimators for the parameters μ and σ² of a Normal distribution N(μ, σ²).</li>
        <li><strong>Jackknife Algorithm:</strong> Describe the algorithm to estimate the bias and standard deviation of a point estimator using the Jackknife method.</li>
        <li><strong>Bootstrap Resampling:</strong> Explain the non-parametric Bootstrap algorithm for estimating the variance of a point estimator.</li>
        <li><strong>Shortest Length CI:</strong> Explain the method of constructing the shortest length confidence interval for a parameter with a suitable example.</li>
    </ol>
</div>

<div class="unit-box unit-indigo">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #818cf8;">UNIT-II: Testing of Hypotheses &amp; Non-Parametric Tests</h4>
        <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">HYPOTHESIS TESTING</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>Define Most Powerful (MP) test and Uniformly Most Powerful (UMP) test.</li>
        <li>State the fundamental concept and stopping rule of the Sequential Probability Ratio Test (SPRT).</li>
        <li>State the test statistic and null hypothesis for the two-sample Kolmogorov-Smirnov test.</li>
        <li>Describe the main objective of Kendall’s Tau (τ) rank correlation coefficient.</li>
        <li>Explain the basic purpose and conditions for using the Kruskal-Wallis test.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Higher-Order Thinking (Analysis &amp; Evaluation – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Neyman-Pearson Lemma:</strong> State and prove the Neyman-Pearson Lemma for testing a simple null hypothesis against a simple alternative hypothesis.</li>
        <li><strong>UMP Test Construction:</strong> Demonstrate how to construct a Uniformly Most Powerful (UMP) test for testing H₀: θ = θ₀ against H₁: θ &gt; θ₀ in a single-parameter Exponential family distribution.</li>
        <li><strong>Likelihood Ratio Test (LRT):</strong> Explain the Likelihood Ratio Test (LRT) procedure and discuss its asymptotic properties and test statistic distribution.</li>
        <li><strong>SPRT Decision Boundaries:</strong> Derive the Sequential Probability Ratio Test (SPRT) boundaries A and B for testing simple hypotheses, and evaluate their relation to Type I and Type II errors (α and β).</li>
        <li><strong>Kolmogorov-Smirnov (K-S) Test:</strong> Explain the procedure, test statistic, and decision criteria for the two-sample Kolmogorov-Smirnov test.</li>
        <li><strong>Kruskal-Wallis Test:</strong> Outline the test procedure for the Kruskal-Wallis test for k independent samples and evaluate its performance against standard ANOVA.</li>
        <li><strong>Friedman Test:</strong> Explain the test procedure and calculation steps for the Friedman test for randomized complete block designs.</li>
        <li><strong>Ansari-Bradley Test:</strong> Explain the Ansari-Bradley test for comparing the scale parameters (dispersion) of two independent distributions.</li>
    </ol>
</div>

<div class="unit-box unit-pink">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #f472b6;">UNIT-III: Non-Parametric Density Estimation, Simulation &amp; Bayesian Methods</h4>
        <span class="unit-badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6;">BAYES &amp; MCMC</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>Define Rosenblatt’s Naïve Density Estimator.</li>
        <li>What is a conjugate prior family? Give an example of a conjugate prior pair.</li>
        <li>Define Priori and Posteriori distributions in Bayesian inference.</li>
        <li>State the main purpose of the MCMC (Markov Chain Monte Carlo) framework.</li>
        <li>Explain the inverse transform method for generating random numbers from a continuous uniform distribution.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Higher-Order Thinking (Application &amp; Synthesis – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Rosenblatt Estimator Properties:</strong> Derive the mathematical expression for the bias and variance of Rosenblatt’s Naïve Density Estimator.</li>
        <li><strong>KDE Consistency &amp; MSE:</strong> Prove the consistency of Kernel Density Estimators and derive the Mean Squared Error (MSE) expression.</li>
        <li><strong>Random Variate Generation:</strong> Explain algorithms for generating random variates from Exponential and Poisson distributions.</li>
        <li><strong>Box-Muller Transformation:</strong> Formulate an algorithm to generate random variables from a Normal distribution using the Box-Muller transformation, and explain how to assess the reliability of generated random numbers.</li>
        <li><strong>Bayesian Parameter Estimation:</strong> Describe the procedure for obtaining the Bayesian point estimator of a parameter under a squared error loss function given a conjugate prior.</li>
        <li><strong>Metropolis-Hastings Algorithm:</strong> Formulate and detail the step-by-step implementation of the Metropolis-Hastings algorithm for sampling from a target posterior distribution.</li>
        <li><strong>Gibbs Sampler:</strong> Explain the Gibbs Sampler algorithm for multi-dimensional Bayesian parameter estimation and compare it with the Metropolis-Hastings algorithm.</li>
    </ol>
</div>`;

// 2. OPTIMIZATION TECHNIQUES (MDS-203)
data.opt_tech['question-bank'] = `<h3 style="color: var(--text-main); margin-bottom: 1.25rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">SECTION 1: UNIT-WISE HIGH-YIELD IMPORTANT QUESTIONS</h3>

<div class="unit-box unit-cyan">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #38bdf8;">UNIT-I: Linear Programming, Duality &amp; Simplex Methods</h4>
        <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">SIMPLEX &amp; DUALITY</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Questions – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>Define a convex set and state any two fundamental mathematical properties of convex sets.</li>
        <li>State the Fundamental Theorem of Linear Programming.</li>
        <li>Explain the concept of degeneracy in Linear Programming Problems (LPP) and identify when it occurs.</li>
        <li>State the Complementary Slackness Theorem and explain its significance in duality.</li>
        <li>State the Fundamental Theorem of Duality and explain the primal-dual relationship.</li>
        <li>Write the standard form of an LPP and define slack, surplus, and artificial variables.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Application &amp; Analysis (Essay Questions – 12 Marks)</strong>
    <ol start="7" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Graphical Method:</strong> Formulate a general Linear Programming Problem and explain how to solve it using the Graphical Method with clear identification of the feasible region, extreme points, and optimal solution.</li>
        <li><strong>Simplex Algorithm:</strong> Describe the step-by-step computational algorithm of the Simplex Method for solving a standard maximization LPP.</li>
        <li><strong>Charnes' Big-M Method:</strong> Solve a mixed-constraint LPP using Charnes' Big-M Method (Method of Penalties), explaining the role and mathematical meaning of penalty M.</li>
        <li><strong>Two-Phase Simplex:</strong> Detail the Two-Phase Simplex Method and solve a minimization LPP showing Phase-I and Phase-II calculations.</li>
        <li><strong>Degeneracy &amp; Anti-Cycling:</strong> Explain degeneracy and cycling in Simplex iterations. Describe Charnes' perturbation method and Bland's anti-cycling rule.</li>
        <li><strong>Duality Theory &amp; Weak Duality:</strong> State and prove the Weak Duality Theorem, and explain the systematic rules for constructing the Dual from a Primal problem.</li>
        <li><strong>Dual Simplex Algorithm:</strong> Describe the Dual Simplex Algorithm and solve a given LPP using the dual simplex procedure without artificial variables.</li>
    </ol>
</div>

<div class="unit-box unit-indigo">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #818cf8;">UNIT-II: Transportation, Assignment &amp; Sequencing</h4>
        <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">TPP, AP &amp; JOBS</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Questions – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>Why is the Transportation Problem (TPP) considered a special case of a Linear Programming Problem?</li>
        <li>Define degeneracy in a Transportation Problem and describe the procedure to resolve it.</li>
        <li>Differentiate between balanced and unbalanced Assignment Problems.</li>
        <li>Define the Traveling Salesman Problem (TSP) and state how it differs from a standard Assignment Problem.</li>
        <li>State the conditions under which Johnson’s algorithm is applicable for sequencing n jobs on three machines.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Analysis &amp; Evaluation (Essay Questions – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Vogel’s Approximation Method (VAM):</strong> Explain Vogel’s Approximation Method (VAM) step-by-step and determine the Initial Basic Feasible Solution (IBFS) for a Transportation Problem.</li>
        <li><strong>MODI (u-v) Method:</strong> Describe the Modified Distribution (MODI / u-v) Method and test the optimality of a given transportation schedule.</li>
        <li><strong>Unbalanced &amp; Degenerate TPP:</strong> Explain the procedure for solving an Unbalanced Transportation Problem and resolving degenerate allocations.</li>
        <li><strong>Hungarian Method:</strong> Formulate the Assignment Problem mathematically and explain the Hungarian Method algorithm for optimal assignment.</li>
        <li><strong>Unbalanced &amp; Restricted AP:</strong> Describe how to handle unbalanced assignment problems and prohibited/restricted assignments using the Hungarian Method.</li>
        <li><strong>Traveling Salesman Problem:</strong> Formulate the Traveling Salesman Problem (TSP) as an integer/assignment problem and solve an instance using the branch/assignment reduction method.</li>
        <li><strong>Sequencing 2 Machines:</strong> Explain Johnson’s Algorithm for sequencing n jobs on two machines and calculate total elapsed time and machine idle times.</li>
        <li><strong>Sequencing 3 Machines:</strong> Explain Johnson’s extended rule for sequencing n jobs on three machines without passing, and determine the optimal job schedule.</li>
    </ol>
</div>

<div class="unit-box unit-pink">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #f472b6;">UNIT-III: Integer Programming, Networks &amp; Queuing Theory</h4>
        <span class="unit-badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6;">NETWORKS &amp; QUEUES</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (Short Questions – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li>Distinguish between Pure Integer Programming and Mixed Integer Programming Problems.</li>
        <li>What is Gomory’s fractional cut constraint and why is it added to the simplex table?</li>
        <li>Define Total Float, Free Float, and Independent Float in CPM network analysis.</li>
        <li>Define the three time estimates (to, tm, tp) in PERT and write the formula for expected time and variance.</li>
        <li>Explain Kendall’s notation for queuing systems and define traffic intensity (utilization factor).</li>
        <li>State Little’s Law and write the fundamental relations between queuing characteristics (L, Lq, W, Wq).</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Application &amp; Synthesis (Essay Questions – 12 Marks)</strong>
    <ol start="7" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Gomory's Cutting Plane:</strong> Explain Gomory’s Cutting Plane Algorithm for solving Pure Integer Linear Programming Problems (ILPP) with an illustrative numerical problem.</li>
        <li><strong>Branch and Bound:</strong> Describe the Branch and Bound Technique for solving Integer Programming Problems using a systematic search tree.</li>
        <li><strong>Critical Path Method (CPM):</strong> Construct a project network diagram, determine the Critical Path, and compute Early/Late start and finish times using CPM.</li>
        <li><strong>PERT Analysis:</strong> Explain the PERT technique: calculate expected project duration, standard deviation, and project completion probability under a deadline.</li>
        <li><strong>Project Crashing (Time-Cost Trade-Off):</strong> Explain Time-Cost Trade-Off (Network Crashing) methodology to determine the minimum cost project schedule.</li>
        <li><strong>Queuing System Components:</strong> Describe the essential components and operating characteristics of Queuing Systems in transient and steady states.</li>
        <li><strong>(M/M/1):(∞/FIFO) Model:</strong> Derive the steady-state equations, expected queue length (Lq), and expected waiting time (Wq) for the (M/M/1):(∞/FIFO) model.</li>
        <li><strong>(M/M/1):(N/FIFO) Model:</strong> Analyze the (M/M/1):(N/FIFO) finite capacity queuing model and derive steady-state probabilities and system loss probability.</li>
    </ol>
</div>`;

// 3. COMPUTER NETWORKS (MDS-302)
data.computer_networks['question-bank'] = `<h3 style="color: var(--text-main); margin-bottom: 1.25rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">SECTION 1: HIGH-YIELD IMPORTANT QUESTION BANK (UNIT-WISE)</h3>

<div class="unit-box unit-cyan">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #38bdf8;">UNIT-I: Fundamentals, Physical Layer &amp; Data Link Layer</h4>
        <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">DLL &amp; PHYSICAL</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (2 Marks Each)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q1.1:</strong> Define Computer Networks and state the need for Network Standardization.</li>
        <li><strong>Q1.2:</strong> List the layers of the OSI reference model along with their primary responsibilities.</li>
        <li><strong>Q1.3:</strong> Differentiate between Guided and Wireless transmission media with examples.</li>
        <li><strong>Q1.4:</strong> Define Multiplexing and state the difference between FDM and TDM.</li>
        <li><strong>Q1.5:</strong> Explain the concept of Circuit Switching versus Packet Switching.</li>
        <li><strong>Q1.6:</strong> What is Framing in the Data Link Layer? List common framing methods.</li>
        <li><strong>Q1.7:</strong> Differentiate between Error Detection and Error Correction.</li>
        <li><strong>Q1.8:</strong> What is the significance of the Hamming Distance in error-correcting codes?</li>
        <li><strong>Q1.9:</strong> Define the concept of a Sliding Window Protocol.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Application &amp; Analysis (12 Marks Essay Questions)</strong>
    <ol start="10" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q1.10 (OSI Layers):</strong> Analyze the seven layers of the OSI Reference Model in detail, explaining the function, addressing schemes, and data unit (PDU) of each layer.</li>
        <li><strong>Q1.11 (OSI vs TCP/IP):</strong> Compare and contrast the OSI Reference Model and the TCP/IP Reference Model, highlighting structural differences, layer mappings, and architectural philosophies.</li>
        <li><strong>Q1.12 (Guided Media):</strong> Classify and analyze Guided Transmission Media (Twisted Pair, Coaxial Cable, Fiber Optics) based on bandwidth, attenuation, noise immunity, and deployment scenarios.</li>
        <li><strong>Q1.13 (Switching Techniques):</strong> Analyze Switching Techniques: Compare Circuit Switching, Message Switching, and Packet Switching (distinguishing between Virtual Circuit and Datagram approaches) with respect to latency and overhead.</li>
        <li><strong>Q1.14 (DLL Design Issues):</strong> Explain Data Link Layer Design Issues with a detailed analysis of Framing mechanisms, Error Control, and Flow Control techniques.</li>
        <li><strong>Q1.15 (CRC Error Detection):</strong> Analyze the Cyclic Redundancy Check (CRC) error detection mechanism and compute the transmitted frame for a given data bitstream and generator polynomial.</li>
        <li><strong>Q1.16 (Sliding Window Protocols):</strong> Formulate and analyze the working mechanism of Sliding Window Protocols: Compare Stop-and-Wait ARQ, Go-Back-N ARQ, and Selective Repeat ARQ under noisy channel conditions.</li>
    </ol>
</div>

<div class="unit-box unit-indigo">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #818cf8;">UNIT-II: Multiple Access Sublayer, Network Layer &amp; Internetworking</h4>
        <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">ROUTING &amp; IP</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (2 Marks Each)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q2.1:</strong> Differentiate between Pure ALOHA and Slotted ALOHA with respect to maximum theoretical throughput.</li>
        <li><strong>Q2.2:</strong> Explain the 1-persistent CSMA strategy and how it handles channel contention.</li>
        <li><strong>Q2.3:</strong> List the key operational differences between a Hub, a Switch, and a Router.</li>
        <li><strong>Q2.4:</strong> State the primary function of the IEEE 802.11 MAC sublayer and DCF/PCF modes.</li>
        <li><strong>Q2.5:</strong> What is the Count-to-Infinity problem in Distance Vector Routing?</li>
        <li><strong>Q2.6:</strong> Differentiate between Open-Loop and Closed-Loop Congestion Control mechanisms.</li>
        <li><strong>Q2.7:</strong> Why is IP packet fragmentation necessary at the Network Layer, and what fields control it?</li>
        <li><strong>Q2.8:</strong> Explain the primary differences between IPv4 and IPv6 header address space.</li>
        <li><strong>Q2.9:</strong> What is the purpose of CIDR (Classless Inter-Domain Routing) and prefix notation?</li>
        <li><strong>Q2.10:</strong> State the roles and working principles of ARP, RARP, and DHCP in IP networks.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Analysis &amp; Evaluation (12 Marks Essay Questions)</strong>
    <ol start="11" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q2.11 (CSMA/CD &amp; CSMA/CA):</strong> Evaluate Carrier Sense Multiple Access (CSMA) protocols: Analyze CSMA/CD and CSMA/CA mechanisms along with their collision detection criteria and backoff algorithms.</li>
        <li><strong>Q2.12 (Connecting Devices):</strong> Analyze and compare network interconnecting devices across protocol layers: Repeaters, Hubs, Bridges, Layer-2/Layer-3 Switches, Routers, and Gateways.</li>
        <li><strong>Q2.13 (Dijkstra Shortest Path):</strong> Formulate and analyze Shortest Path Routing using Dijkstra's Algorithm on a given subnet topology to trace the least-cost sink tree.</li>
        <li><strong>Q2.14 (DVR vs LSR):</strong> Compare and evaluate Distance Vector Routing versus Link State Routing with respect to convergence speed, routing overhead, scalability, and loop formation.</li>
        <li><strong>Q2.15 (Congestion Control):</strong> Analyze Congestion Control Algorithms at the Network Layer: Evaluate the Leaky Bucket and Token Bucket traffic shaping algorithms under bursty traffic.</li>
        <li><strong>Q2.16 (IPv4 vs IPv6 Architecture):</strong> Evaluate IPv4 versus IPv6 architectures: Analyze header formats, header compression, security enhancements, and transition mechanisms (Tunneling, Dual-Stack).</li>
        <li><strong>Q2.17 (Internet Control Protocols):</strong> Analyze Internet Control Protocols: Detail the operation, message exchange sequences, and packet structures of ICMP, ARP, RARP, and DHCP.</li>
    </ol>
</div>

<div class="unit-box unit-pink">
    <div class="unit-header-bar">
        <h4 class="unit-title" style="color: #f472b6;">UNIT-III: Transport Layer &amp; Application Layer</h4>
        <span class="unit-badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6;">TCP &amp; APPS</span>
    </div>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part A: Fundamental Concepts (2 Marks Each)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q3.1:</strong> What are the primary services provided by the Transport Layer to upper application layers?</li>
        <li><strong>Q3.2:</strong> Differentiate between Connection-Oriented and Connectionless transport services.</li>
        <li><strong>Q3.3:</strong> What is Remote Procedure Call (RPC) and how does it relate to UDP transport?</li>
        <li><strong>Q3.4:</strong> List the key header fields in a standard User Datagram Protocol (UDP) segment.</li>
        <li><strong>Q3.5:</strong> State the role of SYN, ACK, and FIN control flags in TCP segment transmission.</li>
        <li><strong>Q3.6:</strong> Explain the purpose of TCP Retransmission Timeout (RTO) and Timer Management (Jacobson's Algorithm).</li>
        <li><strong>Q3.7:</strong> What is the function of the Domain Name System (DNS) and name resolution?</li>
        <li><strong>Q3.8:</strong> State the difference between persistent and non-persistent HTTP connections.</li>
        <li><strong>Q3.9:</strong> Differentiate between the FTP control connection and FTP data connection.</li>
        <li><strong>Q3.10:</strong> Explain the security advantages of SSH over unencrypted TELNET sessions.</li>
    </ol>
    <strong style="color: #f1f5f9; display: block; margin-bottom: 0.6rem; font-size: 0.92rem;">Part B: Application &amp; Synthesis (12 Marks Essay Questions)</strong>
    <ol start="11" style="margin-left: 1.5rem; color: #cbd5e1; line-height: 1.7; font-size: 0.9rem;">
        <li><strong>Q3.11 (TCP Segment Header):</strong> Synthesize the TCP Segment Header format: Analyze each field, flag, sequence numbering, acknowledgment mechanism, and flow control window field.</li>
        <li><strong>Q3.12 (TCP Connection Management):</strong> Model and synthesize TCP Connection Management: Provide a detailed step-by-step state transition analysis of the Three-Way Handshake for connection establishment and graceful release.</li>
        <li><strong>Q3.13 (TCP Congestion Control):</strong> Analyze TCP Congestion Control: Synthesize the operational mechanisms of Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.</li>
        <li><strong>Q3.14 (UDP vs TCP Comparison):</strong> Compare and analyze UDP and TCP protocols with respect to reliability, protocol overhead, connection overhead, flow control, and suitability for Real-Time Streaming (RTP).</li>
        <li><strong>Q3.15 (DNS Architecture):</strong> Analyze the architecture, namespace hierarchy, and query resolution mechanism (Iterative vs. Recursive) of the Domain Name System (DNS).</li>
        <li><strong>Q3.16 (HTTP/HTTPS &amp; FTP):</strong> Synthesize Application Layer Protocols: Compare HTTP/HTTPS and FTP with respect to connection establishment, session states, and command/data separation.</li>
        <li><strong>Q3.17 (E-Mail Architecture):</strong> Analyze Electronic Mail Architecture: Detail the functions of User Agents, Message Transfer Agents, and the protocols SMTP, POP3, and IMAP.</li>
    </ol>
</div>`;

// 4. NOW FORMAT SYLLABUS FOR ALL SUBJECTS TO UNIT BOXES
Object.keys(data).forEach(key => {
  formatSyllabusToUnitBoxes(key, data[key]);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully upgraded ALL Question Banks and Syllabi to highlighted unit card boxes!');
