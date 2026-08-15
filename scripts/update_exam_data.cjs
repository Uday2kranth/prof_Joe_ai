const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. STATISTICAL INFERENCE (MDS-104-T) - TRIPLE QUESTION BANK SUPPORT
data.stat_inference['standard-tab-title'] = '🎯 Comprehensive Question Bank';
data.stat_inference['streamlined-tab-title'] = '🔥 Streamlined High-Yield (Core Focus)';
data.stat_inference['gagan-tab-title'] = '⭐ Star-Ranked Priority Hit List';

// 1A. Standard Comprehensive Question Bank
data.stat_inference['question-bank'] = `<h3 style="color: var(--text-main); margin-bottom: 1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">SECTION I: COMPREHENSIVE IMPORTANT QUESTIONS LIST (UNIT-WISE)</h3>

<div class="unit-box">
    <div class="unit-title" style="color: #38bdf8;">UNIT-I: Estimation Theory, Methods of Estimation &amp; Resampling</div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>State the criteria for a good point estimator and define unbiasedness with an example.</li>
        <li>Define Fisher Information and write its mathematical expression for a single parameter.</li>
        <li>Define the U-statistic and state its core objective in estimation.</li>
        <li>Explain the main difference between the Jackknife and Bootstrap resampling methods.</li>
        <li>Define confidence interval and explain the concept of a pivot (pivotal quantity).</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking (Application &amp; Analysis – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
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

<div class="unit-box">
    <div class="unit-title" style="color: #38bdf8;">UNIT-II: Testing of Hypotheses &amp; Non-Parametric Tests</div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>Define Most Powerful (MP) test and Uniformly Most Powerful (UMP) test.</li>
        <li>State the fundamental concept and stopping rule of the Sequential Probability Ratio Test (SPRT).</li>
        <li>State the test statistic and null hypothesis for the two-sample Kolmogorov-Smirnov test.</li>
        <li>Describe the main objective of Kendall’s Tau (τ) rank correlation coefficient.</li>
        <li>Explain the basic purpose and conditions for using the Kruskal-Wallis test.</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking (Analysis &amp; Evaluation – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
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

<div class="unit-box">
    <div class="unit-title" style="color: #38bdf8;">UNIT-III: Non-Parametric Density Estimation, Simulation &amp; Bayesian Methods</div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (Short Answer – 2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>Define Rosenblatt’s Naïve Density Estimator.</li>
        <li>What is a conjugate prior family? Give an example of a conjugate prior pair.</li>
        <li>Define Priori and Posteriori distributions in Bayesian inference.</li>
        <li>State the main purpose of the MCMC (Markov Chain Monte Carlo) framework.</li>
        <li>Explain the inverse transform method for generating random numbers from a continuous uniform distribution.</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking (Application &amp; Synthesis – 12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
        <li><strong>Rosenblatt Estimator Properties:</strong> Derive the mathematical expression for the bias and variance of Rosenblatt’s Naïve Density Estimator.</li>
        <li><strong>KDE Consistency &amp; MSE:</strong> Prove the consistency of Kernel Density Estimators and derive the Mean Squared Error (MSE) expression.</li>
        <li><strong>Random Variate Generation:</strong> Explain algorithms for generating random variates from Exponential and Poisson distributions.</li>
        <li><strong>Box-Muller Transformation:</strong> Formulate an algorithm to generate random variables from a Normal distribution using the Box-Muller transformation, and explain how to assess the reliability of generated random numbers.</li>
        <li><strong>Bayesian Parameter Estimation:</strong> Describe the procedure for obtaining the Bayesian point estimator of a parameter under a squared error loss function given a conjugate prior.</li>
        <li><strong>Metropolis-Hastings Algorithm:</strong> Formulate and detail the step-by-step implementation of the Metropolis-Hastings algorithm for sampling from a target posterior distribution.</li>
        <li><strong>Gibbs Sampler:</strong> Explain the Gibbs Sampler algorithm for multi-dimensional Bayesian parameter estimation and compare it with the Metropolis-Hastings algorithm.</li>
    </ol>
</div>`;

// 1B. Streamlined High-Yield Questions (Core Focus)
data.stat_inference['streamlined-question-bank'] = `<h3 style="color: var(--text-main); margin-bottom: 1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">SECTION II: STREAMLINED HIGH-YIELD QUESTIONS (CORE FOCUS)</h3>

<div class="unit-box" style="border-left: 4px solid #ec4899; background: rgba(236, 72, 153, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #f472b6; font-size: 1.05rem; font-weight: 700;">UNIT - I: Estimation Theory, Methods &amp; Resampling (Core Focus)</div>
        <span class="badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">CORE FOCUS</span>
    </div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>Define unbiasedness and consistency of an estimator with a simple example.</li>
        <li>State the mathematical expression for Fisher Information.</li>
        <li>Define the U-statistic.</li>
        <li>State the main structural difference between Jackknife and Bootstrap resampling.</li>
        <li>Define a pivotal quantity used in confidence interval estimation.</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking Skills (12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
        <li><strong>Cramer-Rao Bound:</strong> State and prove the Cramer-Rao Inequality.</li>
        <li><strong>Rao-Blackwell:</strong> State and prove the Rao-Blackwell Theorem.</li>
        <li><strong>Lehmann-Scheffé:</strong> State and prove the Lehmann-Scheffé Theorem.</li>
        <li><strong>Poisson Estimators:</strong> Derive the Maximum Likelihood Estimator (MLE) and Method of Moments Estimator (MME) for parameter θ of a Poisson distribution.</li>
        <li><strong>Jackknife Bias &amp; Variance:</strong> Describe the step-by-step algorithm to estimate bias and standard deviation using the Jackknife method.</li>
        <li><strong>Bootstrap Variance:</strong> Describe the non-parametric Bootstrap algorithm for estimating the variance of a point estimator.</li>
    </ol>
</div>

<div class="unit-box" style="border-left: 4px solid #ec4899; background: rgba(236, 72, 153, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #f472b6; font-size: 1.05rem; font-weight: 700;">UNIT - II: Testing of Hypotheses &amp; Non-Parametric Tests (Core Focus)</div>
        <span class="badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">CORE FOCUS</span>
    </div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>Define Most Powerful (MP) test and Uniformly Most Powerful (UMP) test.</li>
        <li>State the stopping rule for the Sequential Probability Ratio Test (SPRT).</li>
        <li>State the null hypothesis and test statistic for the two-sample Kolmogorov-Smirnov test.</li>
        <li>State the primary purpose of Kendall’s Tau (τ) test.</li>
        <li>Define the test scenario where the Kruskal-Wallis test is applied.</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking Skills (12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
        <li><strong>Neyman-Pearson Lemma:</strong> State and prove the Neyman-Pearson Lemma.</li>
        <li><strong>Exponential UMP Test:</strong> Demonstrate how to construct a Uniformly Most Powerful (UMP) test for a single-parameter Exponential distribution.</li>
        <li><strong>Likelihood Ratio Test:</strong> Explain the Likelihood Ratio Test (LRT) procedure and its asymptotic distribution.</li>
        <li><strong>SPRT Decision Boundaries:</strong> Derive the Sequential Probability Ratio Test (SPRT) decision boundaries A and B in terms of Type I (α) and Type II (β) errors.</li>
        <li><strong>Kruskal-Wallis Procedure:</strong> Explain the procedure and decision criteria for the Kruskal-Wallis test for k independent samples.</li>
        <li><strong>Friedman Test:</strong> Explain the procedure and calculation steps for the Friedman test.</li>
    </ol>
</div>

<div class="unit-box" style="border-left: 4px solid #ec4899; background: rgba(236, 72, 153, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #f472b6; font-size: 1.05rem; font-weight: 700;">UNIT - III: Non-Parametric Density Estimation, Simulation &amp; Bayesian Methods (Core Focus)</div>
        <span class="badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">CORE FOCUS</span>
    </div>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part A: Fundamental Concepts (2 Marks)</strong>
    <ol style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6;">
        <li>Define Rosenblatt’s Naïve Density Estimator.</li>
        <li>Define a conjugate prior distribution with an example.</li>
        <li>Distinguish between Priori and Posteriori distributions.</li>
        <li>State the main goal of Markov Chain Monte Carlo (MCMC) sampling.</li>
        <li>Explain the inverse transform sampling method for a continuous uniform distribution.</li>
    </ol>
    <strong style="color: #cbd5e1; display: block; margin-bottom: 0.5rem;">Part B: Higher-Order Thinking Skills (12 Marks)</strong>
    <ol start="6" style="margin-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
        <li><strong>Rosenblatt Density:</strong> Derive the bias and variance of Rosenblatt’s Naïve Density Estimator.</li>
        <li><strong>KDE Consistency:</strong> Prove the consistency of Kernel Density Estimators and derive the Mean Squared Error (MSE).</li>
        <li><strong>Box-Muller Normal:</strong> Formulate the algorithm to generate random variables from a Normal distribution using the Box-Muller transformation.</li>
        <li><strong>Bayesian Conjugate:</strong> Describe the procedure for obtaining a Bayesian point estimator under a squared error loss function using a conjugate prior.</li>
        <li><strong>Metropolis-Hastings:</strong> Explain the step-by-step execution of the Metropolis-Hastings algorithm.</li>
        <li><strong>Gibbs Sampler:</strong> Explain the Gibbs Sampler algorithm for multi-dimensional Bayesian parameter estimation.</li>
    </ol>
</div>`;

// 1C. Star-Ranked Crunch Predictions (1-2 Hours Revision)
data.stat_inference['gagan-important-topics'] = `<h3 style="color: var(--text-main); margin-bottom: 0.75rem; border-bottom: 2px solid var(--border); padding-bottom: 0.25rem;">⭐ LAST-MINUTE CRUNCH LIST (1–2 HOURS REVISION — STAR-RANKED PREDICTIONS)</h3>
<p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">
    <strong>Priority Ranking Legend:</strong> &nbsp;
    <span style="color: #fbbf24; font-weight: 700;">⭐⭐⭐⭐⭐ (5 Stars): Mandatory Core Derivations</span> &nbsp;|&nbsp; 
    <span style="color: #38bdf8; font-weight: 700;">⭐⭐⭐⭐ (4 Stars): Very Important / High Probability</span> &nbsp;|&nbsp; 
    <span style="color: #a78bfa; font-weight: 700;">⭐⭐⭐ (3 Stars): Highly Possible / Top Alternative</span>
</p>

<div class="unit-box" style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #fbbf24; font-size: 1.05rem; font-weight: 700;">UNIT – I: Estimation Theory &amp; Methods</div>
        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">ESTIMATION</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Cramer-Rao Inequality</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                State and prove the Cramer-Rao Inequality. Explain the conditions under which the lower bound is attained. (5 Stars — Mandatory Core Derivation)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Rao-Blackwell Theorem</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                State and prove the Rao-Blackwell Theorem, and explain its role in finding a UMVUE. (5 Stars — Core Theorem)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Poisson MLE &amp; Method of Moments (MME)</strong>
                <span style="color: #38bdf8; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Derive the Maximum Likelihood Estimator (MLE) and Method of Moments Estimator (MME) for a Poisson distribution parameter θ. (4 Stars — High-Probability Calculation)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(167, 139, 250, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Bootstrap &amp; Jackknife Resampling Algorithms</strong>
                <span style="color: #a78bfa; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Explain the non-parametric Bootstrap and Jackknife algorithms for estimating bias and variance. (3 Stars — High-Probability Resampling Theory)
            </p>
        </div>
    </div>
</div>

<div class="unit-box" style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #fbbf24; font-size: 1.05rem; font-weight: 700;">UNIT – II: Testing of Hypotheses &amp; Non-Parametric Tests</div>
        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">HYPOTHESIS TESTING</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Neyman-Pearson Lemma</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                State and prove the Neyman-Pearson Lemma for testing simple null vs. simple alternative hypotheses. (5 Stars — Mandatory Foundational Lemma)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Sequential Probability Ratio Test (SPRT) Boundaries</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Explain the Sequential Probability Ratio Test (SPRT) stopping rule and derive decision boundaries A and B in terms of α and β. (5 Stars — Top Hypothesis Testing Question)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Kruskal-Wallis Test (k Independent Samples)</strong>
                <span style="color: #38bdf8; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Explain the procedure, test statistic, and decision criteria for the Kruskal-Wallis test (k independent samples). (4 Stars — Primary Non-Parametric Test)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(167, 139, 250, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Likelihood Ratio Test (LRT)</strong>
                <span style="color: #a78bfa; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Describe the Likelihood Ratio Test (LRT) method and state its asymptotic distribution. (3 Stars — Standard Parametric Test)
            </p>
        </div>
    </div>
</div>

<div class="unit-box" style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.03); margin-bottom: 1.25rem; padding: 16px; border-radius: 10px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <div class="unit-title" style="color: #fbbf24; font-size: 1.05rem; font-weight: 700;">UNIT – III: Non-Parametric Density, Simulation &amp; Bayes</div>
        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">BAYES &amp; MCMC</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Rosenblatt’s Naïve Density Estimator</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Derive the bias and variance of Rosenblatt’s Naïve Density Estimator. (5 Stars — Primary Density Estimation Question)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Metropolis-Hastings MCMC Algorithm</strong>
                <span style="color: #fbbf24; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Detail the step-by-step implementation and transition mechanism of the Metropolis-Hastings MCMC algorithm. (5 Stars — Essential MCMC Method)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Gibbs Sampler Algorithm</strong>
                <span style="color: #38bdf8; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Explain the Gibbs Sampler algorithm for Bayesian parameter estimation and compare it with Metropolis-Hastings. (4 Stars — Key Alternative MCMC Method)
            </p>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(167, 139, 250, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <strong style="color: #f8fafc; font-size: 0.95rem;">Box-Muller Normal Transformation</strong>
                <span style="color: #a78bfa; font-size: 0.9rem; flex-shrink: 0;">⭐⭐⭐</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px; line-height: 1.5; margin-bottom: 0;">
                Formulate the Box-Muller transformation algorithm to generate random variables from a Normal distribution N(0, 1). (3 Stars — Top Simulation Question)
            </p>
        </div>
    </div>
</div>`;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully configured 3 question banks for Statistical Inference!');
