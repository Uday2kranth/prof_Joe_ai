/**
 * Update the exact official syllabus for MDS-108-P (Practical-IV): Statistical Inference Using Python
 * Matching the exact text from the official BOS approved syllabus PDF
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'examPrepData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

data.stat_inference_lab.syllabus = `
<div class="unit-box unit-cyan" style="margin-bottom: 1rem;">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">📋 SYLLABUS: M.SC. (DATA SCIENCE) I-YEAR, I-SEMESTER</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">MDS-108-P</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.92rem; color: #f1f5f9; font-weight: 600; margin-bottom: 0.5rem;">
      MDS-108-P: PAPER- VIII (PRACTICAL-IV): STATISTICAL INFERENCE USING PYTHON
    </p>
    <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.75rem;">
      Faculty of Science — Osmania University | List of Practicals using Python programming
    </p>
  </div>
</div>

<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">📊 1. Data Visualization</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">PRACTICAL 1</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Diagrammatical / Graphical representation of the data in the form of dataset with different measurement of scales:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        Pictorial representation, Bar (simple, multiple, component, percent) and Pie Charts, Histogram, Line plot, frequency curves & polygons, ogive curves, Scatter Plot, Gantt Chart, Heat Map, Box - Whisker Plot, Waterfall Chart, Area Chart, Density Plot, Bullet Graph, Choropleth Map, Tree map, Path diagram, Network Diagram, Correlation Matrices.
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #818cf8;">📈 2. Correlation and Regression Analysis</h4>
    <span class="unit-badge" style="background: rgba(129, 140, 248, 0.15); color: #818cf8;">PRACTICAL 2</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Correlation and Regression Analysis:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        Including simple (Pearson's and Spearman's), partial and multiple correlations, Simple, Multiple linear regression and logistic regression.
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-pink">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #f472b6;">🔬 3. Parametric Tests</h4>
    <span class="unit-badge" style="background: rgba(244, 114, 182, 0.15); color: #f472b6;">PRACTICAL 3</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Parametric tests across continuous and categorical data:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        ($z$-, $\\chi^2$, $t$-, $F$-tests, ANOVA).
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-emerald">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #34d399;">🧪 4. Non-Parametric Tests</h4>
    <span class="unit-badge" style="background: rgba(52, 211, 153, 0.15); color: #34d399;">PRACTICAL 4</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Distribution-Free & Non-Parametric Hypothesis Testing:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        (Sign test, Median, Wilcoxon sign rank, Mann-Whitney U, Run test, U-test, K-S test, Kruskal Wallis and Friedman test, Independence, goodness of fit, Kendal’s $\\tau$, Ansari broadly tests).
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">🔄 5. Resampling Methods: Jackknife & Bootstrap</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">PRACTICAL 5</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Generation of Jackknife and Bootstrap samples and estimation of parameters and computation of bias:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        Leave-one-out Jackknife subsamples, non-parametric Bootstrap resamples ($B$ iterations with replacement), empirical standard errors, bias estimation, and confidence intervals.
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #818cf8;">🎯 6. Confidence Interval Estimation</h4>
    <span class="unit-badge" style="background: rgba(129, 140, 248, 0.15); color: #818cf8;">PRACTICAL 6</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Confidence Interval estimation for parametric probability models:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        Confidence Interval estimation for <strong>Binomial</strong> ($p$), <strong>Poisson</strong> ($\\lambda$), <strong>Normal</strong> ($\\mu, \\sigma^2$), and <strong>Exponential</strong> ($\\theta$) parameters.
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-pink">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #f472b6;">🎲 7. Simulation & Random Variate Generation</h4>
    <span class="unit-badge" style="background: rgba(244, 114, 182, 0.15); color: #f472b6;">PRACTICAL 7</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Simulation: Generation of random numbers from various probability distributions:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        (Uniform, Binomial, Poisson, Normal, Exponential, Gamma, Cauchy, Lognormal, and Weibull Distributions).
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-emerald">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #34d399;">🔮 8. Bayesian Estimation</h4>
    <span class="unit-badge" style="background: rgba(52, 211, 153, 0.15); color: #34d399;">PRACTICAL 8</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.7; color: #cbd5e1; font-size: 0.92rem;">
      <strong>Bayesian estimation of parameters:</strong>
      <div style="margin-top: 6px; color: #94a3b8; font-size: 0.9rem;">
        (using Metropolis Hasting and Gibbs Sampler).
      </div>
    </div>
  </div>
</div>

<div class="unit-box unit-amber">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #fbbf24;">🏛️ Official Board of Studies (BOS) Approval</h4>
    <span class="unit-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;">OU BOS 2024</span>
  </div>
  <div class="unit-content">
    <div style="line-height: 1.6; color: #cbd5e1; font-size: 0.88rem;">
      <strong style="color: #fbbf24;">Approved in the BOS meeting held on 17.05.2024 by BOS in Statistics, Osmania University, Hyd-7.</strong>
      <div style="color: #94a3b8; margin-top: 4px; font-size: 0.82rem;">Page 12 of 21 — Official Curriculum Specification</div>
    </div>
  </div>
</div>
`;

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ MDS-108-P Practical Syllabus successfully updated with exact PDF content and LaTeX math formulas!');
