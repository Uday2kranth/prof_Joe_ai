const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// SET A
data.stat_inference['set-a'] = `<div class="set-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
  <div>
    <h4 style="font-size: 1.2rem; color: #f43f5e; margin: 0;">🎯 PREDICTED MODEL PAPER – SET A (High-Probability Baseline Focus)</h4>
    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0 0;">
      <strong>Faculty of Science — Osmania University</strong> | M.Sc. (CBCS) I-Semester Examination | <strong>Code No:</strong> MDS-104-T
    </p>
  </div>
  <span class="badge" style="background-color: var(--accent-danger); margin: 0;">OU STYLE</span>
</div>

<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
  <strong>Subject:</strong> STATISTICAL INFERENCE (Paper - IV) | <strong>Time:</strong> 2 ½ Hrs | <strong>Max. Marks:</strong> 70
</p>

<div class="unit-box unit-cyan" style="margin-bottom: 16px;">
  <div class="unit-header-bar">
    <h5 style="color: #38bdf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">SHORT ANSWER</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 2 Marks.</em></p>
  <ol style="margin-left: 1.5rem; color: var(--text-primary); line-height: 1.7; font-size: 0.9rem;">
    <li>Define unbiasedness and consistency of an estimator with a simple mathematical example. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>State the mathematical expression for Fisher Information for a single parameter. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>Define Most Powerful (MP) test and Uniformly Most Powerful (UMP) test. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>State the null hypothesis and test statistic for the two-sample Kolmogorov-Smirnov test. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>Define Rosenblatt’s Naïve Density Estimator. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III]</span></li>
  </ol>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 style="color: #818cf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">ESSAY QUESTIONS</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 12px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</em></p>
  <div style="color: var(--text-primary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 1rem; line-height: 1.65;">
    <p>
      <strong>Question 6:</strong> (a) State and prove the Cramer-Rao Inequality. Explain the conditions under which the lower bound of variance is achieved. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) State and prove the Rao-Blackwell Theorem. Explain how it is used to improve an unbiased estimator using a sufficient statistic. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span>
    </p>
    <p>
      <strong>Question 7:</strong> (a) State and prove the Neyman-Pearson Lemma for testing a simple null hypothesis against a simple alternative hypothesis. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Explain the procedure and decision criteria for the Kruskal-Wallis test for k independent samples. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span>
    </p>
    <p>
      <strong>Question 8:</strong> (a) Derive the bias and variance of Rosenblatt’s Naïve Density Estimator. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Formulate and detail the step-by-step implementation of the Metropolis-Hastings algorithm for sampling from a target posterior distribution. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
    <p>
      <strong>Question 9:</strong> (a) Derive the Maximum Likelihood Estimator (MLE) and Method of Moments Estimator (MME) for the parameter θ of a Poisson distribution, and compare their properties. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Derive the Sequential Probability Ratio Test (SPRT) decision boundaries A and B in terms of Type I error (α) and Type II error (β). <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span>
    </p>
    <p>
      <strong>Question 10:</strong> (a) Describe the step-by-step algorithm to estimate the bias and standard deviation of a point estimator using the Jackknife resampling method. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Describe the procedure for obtaining the Bayesian point estimator of a parameter under a squared error loss function given a conjugate prior. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
  </div>
</div>`;

// SET B
data.stat_inference['set-b'] = `<div class="set-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
  <div>
    <h4 style="font-size: 1.2rem; color: #f43f5e; margin: 0;">🎯 PREDICTED MODEL PAPER – SET B (Alternative Combination Focus)</h4>
    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0 0;">
      <strong>Faculty of Science — Osmania University</strong> | M.Sc. (CBCS) I-Semester Examination | <strong>Code No:</strong> MDS-104-T
    </p>
  </div>
  <span class="badge" style="background-color: var(--accent-danger); margin: 0;">OU STYLE</span>
</div>

<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
  <strong>Subject:</strong> STATISTICAL INFERENCE (Paper - IV) | <strong>Time:</strong> 2 ½ Hrs | <strong>Max. Marks:</strong> 70
</p>

<div class="unit-box unit-cyan" style="margin-bottom: 16px;">
  <div class="unit-header-bar">
    <h5 style="color: #38bdf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">SHORT ANSWER</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 2 Marks.</em></p>
  <ol style="margin-left: 1.5rem; color: var(--text-primary); line-height: 1.7; font-size: 0.9rem;">
    <li>Define a pivotal quantity and explain its role in interval estimation. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>Define the U-statistic and state its core objective. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>State the stopping rule and decision criteria for the Sequential Probability Ratio Test (SPRT). <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>State the primary purpose and formula for Kendall’s Tau (τ) rank correlation coefficient. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>Distinguish between Priori and Posteriori distributions in Bayesian inference. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III]</span></li>
  </ol>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 style="color: #818cf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">ESSAY QUESTIONS</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 12px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</em></p>
  <div style="color: var(--text-primary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 1rem; line-height: 1.65;">
    <p>
      <strong>Question 6:</strong> (a) State and prove the Lehmann-Scheffé Theorem. Explain its application in obtaining a Uniformly Minimum Variance Unbiased Estimator (UMVUE). <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Describe the non-parametric Bootstrap algorithm for estimating the standard error and variance of a point estimator. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span>
    </p>
    <p>
      <strong>Question 7:</strong> (a) Explain the Likelihood Ratio Test (LRT) procedure and discuss its asymptotic distribution under standard regularity conditions. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Explain the test procedure, ranking mechanism, and calculation steps for the Friedman test in randomized block designs. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span>
    </p>
    <p>
      <strong>Question 8:</strong> (a) Prove the consistency of Kernel Density Estimators and derive the expression for their Mean Squared Error (MSE). <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Explain the Gibbs Sampler algorithm for multi-dimensional Bayesian parameter estimation and compare its transition mechanism with Metropolis-Hastings. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
    <p>
      <strong>Question 9:</strong> (a) Construct a Uniformly Most Powerful (UMP) test for testing H₀: θ = θ₀ against H₁: θ &gt; θ₀ for a single-parameter Exponential distribution. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Formulate the Box-Muller transformation algorithm to generate random variables from a Normal distribution N(0, 1), and explain methods to assess reliability. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
    <p>
      <strong>Question 10:</strong> (a) Explain the method of constructing the shortest length confidence interval for a parameter with a suitable example. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Explain the Ansari-Bradley test for comparing the scale parameters (dispersion) of two independent samples. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span>
    </p>
  </div>
</div>`;

// SET C
data.stat_inference['set-c'] = `<div class="set-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
  <div>
    <h4 style="font-size: 1.2rem; color: #f43f5e; margin: 0;">🎯 PREDICTED MODEL PAPER – SET C (Wildcard / In-Depth Focus)</h4>
    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0 0 0;">
      <strong>Faculty of Science — Osmania University</strong> | M.Sc. (CBCS) I-Semester Examination | <strong>Code No:</strong> MDS-104-T
    </p>
  </div>
  <span class="badge" style="background-color: var(--accent-danger); margin: 0;">OU STYLE</span>
</div>

<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
  <strong>Subject:</strong> STATISTICAL INFERENCE (Paper - IV) | <strong>Time:</strong> 2 ½ Hrs | <strong>Max. Marks:</strong> 70
</p>

<div class="unit-box unit-cyan" style="margin-bottom: 16px;">
  <div class="unit-header-bar">
    <h5 style="color: #38bdf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">SHORT ANSWER</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 2 Marks.</em></p>
  <ol style="margin-left: 1.5rem; color: var(--text-primary); line-height: 1.7; font-size: 0.9rem;">
    <li>State the structural difference between Jackknife and Bootstrap resampling methods. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>Define sufficiency and state the Factorization Theorem criterion for a sufficient statistic. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I]</span></li>
    <li>Define Type I error, Type II error, and the Power of a statistical test. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>State the main purpose and test conditions of the Ansari-Bradley test. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II]</span></li>
    <li>Define a conjugate prior distribution and give one example of a conjugate prior pair. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III]</span></li>
  </ol>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 style="color: #818cf8; margin: 0; font-size: 0.98rem; font-weight: 700;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129, 140, 248, 0.2); color: #818cf8;">ESSAY QUESTIONS</span>
  </div>
  <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 12px;"><em>NOTE: Attempt / Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</em></p>
  <div style="color: var(--text-primary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 1rem; line-height: 1.65;">
    <p>
      <strong>Question 6:</strong> (a) Derive the Maximum Likelihood Estimators (MLE) for the parameters μ and σ² in a Normal distribution N(μ, σ²), and examine their properties of unbiasedness and consistency. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) State the properties of the Method of Least Squares and derive the normal equations for fitting a linear regression model. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span>
    </p>
    <p>
      <strong>Question 7:</strong> (a) Explain the two-sample Kolmogorov-Smirnov test procedure, test statistic formulation, and decision rule for testing whether two continuous populations have the same distribution. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Demonstrate the construction of a Most Powerful (MP) test using the Neyman-Pearson Lemma for testing simple hypotheses concerning the parameter of a Normal distribution with known variance. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span>
    </p>
    <p>
      <strong>Question 8:</strong> (a) Explain the inverse transform method and formulate the algorithms for generating random variates from an Exponential distribution and a Poisson distribution. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Derive the Bayes estimator of the parameter θ for a Binomial likelihood with a Beta prior distribution under a squared error loss function. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
    <p>
      <strong>Question 9:</strong> (a) State and prove the Rao-Blackwell Theorem, and demonstrate with an example how it leads to a Uniformly Minimum Variance Unbiased Estimator (UMVUE). <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - I: Application &amp; Analysis]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Explain the construction, acceptance probability, and transition mechanism of the Metropolis-Hastings MCMC algorithm. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
    <p>
      <strong>Question 10:</strong> (a) Outline the test procedure for the Kruskal-Wallis one-way ANOVA by ranks and explain how ties are handled in the rank assignments. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - II: Analysis &amp; Evaluation]</span><br>
      <strong style="color: var(--accent-danger); display: block; margin: 6px 0;">(OR)</strong>
      (b) Describe how the Mean Squared Error (MSE) of Kernel Density Estimators is decomposed into integrated bias and integrated variance, and explain the bandwidth selection tradeoff. <span style="color: var(--text-muted); font-size: 0.82rem;">[Unit - III: Application &amp; Synthesis]</span>
    </p>
  </div>
</div>`;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Predicted Model Paper Sets (Set A, Set B, Set C) successfully added for Statistical Inference!');
