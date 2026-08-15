const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/examPrepData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Tag existing subjects as sem-4
for (const key of ['crypto', 'datamining', 'sentiment', 'vision', 'webmining', 'scalable']) {
  if (data[key]) {
    data[key].semester = 'sem-4';
    data[key].type = 'theory';
  }
}

// Add stat_inference (Sem 1)
data.stat_inference = {
  semester: 'sem-1',
  type: 'theory',
  code: 'MDS-104-T',
  title: 'Paper IV: Statistical Inference (MDS-104-T)',
  syllabus: `### 📘 UNIT - I: Estimation Theory, Methods of Estimation & Resampling

* **Foundations of Estimation Theory:**
  Basic Concepts of Estimation, Criteria for a Good Estimator: Unbiasedness, Consistency, Efficiency, and Sufficiency. Examples, Applications, and Simple Problems.

* **Classical Bounds & Key Theorems:**
  Cramer-Rao Inequality, Rao-Blackwell Theorem, Fisher Information, Lehmann-Scheffe Theorem, Simple Problems on Uniformly Minimum Variance Unbiased Estimators (UMVUE).

* **Methods of Estimation:**
  Method of Moments (MoM), Method of Least Squares (OLS), Maximum Likelihood Estimation (MLE) – Properties, Derivatives, and Simple Problems.

* **Resampling & Non-Parametric Estimation:**
  Resampling Concepts, Jackknife and Bootstrap Methods, Estimation of Bias and Standard Deviation of Point Estimators using Jackknife & Bootstrap with Examples, U-Statistics, Symmetric Kernels and Examples.

* **Interval Estimation:**
  Confidence Intervals (CI), Confidence Level, CI Construction using Pivotal Quantities, Shortest Length Confidence Intervals, and Example Problems.


### 📘 UNIT - II: Testing of Hypotheses & Non-Parametric Tests

* **Parametric Testing of Hypotheses:**
  Statistical Hypotheses (Null vs. Alternative, Type I & Type II Errors, Power of Test), Neyman-Pearson Lemma, Most Powerful (MP) Tests, Uniformly Most Powerful (UMP) Tests, Likelihood Ratio Tests (LRT), Sequential Probability Ratio Tests (SPRT).

* **Non-Parametric & Distribution-Free Tests:**
  Concepts & Advantages of Non-Parametric Methods, One-Sample and Two-Sample Tests: Kolmogorov-Smirnov (K-S) Test, Kruskal-Wallis Test, Friedman Test, Kendall’s Tau (τ), Ansari-Bradley Test.


### 📘 UNIT - III: Density Estimation, Simulation & Bayesian Inference

* **Non-Parametric Density Estimation:**
  Rosenblatt’s Naïve Density Estimator – Formulation, Bias, and Variance Analysis. Kernel Density Estimators (KDE) – Mathematical Formulation, Consistency, and Mean Squared Error (MSE).

* **Stochastic Simulation & Random Variate Generation:**
  Introduction to Simulation, Generation of Random Variates for Uniform, Normal, Exponential, Cauchy, and Poisson Distributions, Estimating the Reliability and Randomness of Generated Sequences.

* **Bayesian Estimation & MCMC Algorithms:**
  Prior and Posterior Distributions, Conjugate Prior Families, Bayesian Estimation of Parameters, Markov Chain Monte Carlo (MCMC) Algorithms: Metropolis-Hastings Algorithm and Gibbs Sampler.


---

### 📚 Recommended Textbooks & Reference Books:
1. **V.K. Rohatgi**, *An Introduction to Probability Theory and Mathematical Statistics (John Wiley & Sons)*
2. **J.D. Gibbons**, *Non-Parametric Statistical Inference (McGraw-Hill / TMH)*
3. **E.L. Lehmann**, *Testing Statistical Hypotheses (John Wiley & Sons)*
4. **A.M. Goon, M.K. Gupta, B. Dasgupta**, *Outlines of Statistics, Vol. II (World Press)*
5. **C.R. Rao**, *Linear Statistical Inference and Its Applications (John Wiley & Sons)*`
};

// Add stat_inference_lab (Sem 1)
data.stat_inference_lab = {
  semester: 'sem-1',
  type: 'practical',
  code: 'MDS-108-P',
  title: 'Paper VIII (Practical-IV): Statistical Inference Using Python (MDS-108-P)',
  syllabus: `### 🐍 LAB SYLLABUS: Statistical Inference Using Python (MDS-108-P)

#### 📋 List of Practicals & Experimental Programs:

1. **Data Visualization:**
   Diagrammatical / Graphical representation of data in the form of datasets with different scales of measurement (Pictorial representation, Bar charts: simple, multiple, component, percentage; Pie Charts, Histogram, Line plot, Frequency curves & polygons, Ogive curves, Scatter Plot, Gantt Chart, Heat Map, Box-Whisker Plot, Waterfall Chart, Area Chart, Density Plot, Bullet Graph, Choropleth Map, Tree Map, Path Diagram, Network Diagram, Correlation Matrices).

2. **Correlation and Regression Analysis:**
   Correlation Analysis including simple (Pearson's and Spearman's rank correlation), partial and multiple correlation. Simple Linear Regression, Multiple Linear Regression, and Logistic Regression.

3. **Parametric Hypothesis Tests:**
   Implementation and evaluation of z-tests, χ²-tests, Student's t-tests, F-tests, and Analysis of Variance (ANOVA - One-Way and Two-Way).

4. **Non-Parametric Tests:**
   Sign Test, Median Test, Wilcoxon Signed-Rank Test, Mann-Whitney U Test, Run Test, U-Test, Kolmogorov-Smirnov (K-S) Test, Kruskal-Wallis Test, Friedman Test, Test for Independence, Goodness-of-Fit Test, Kendall’s Tau (τ), and Ansari-Bradley Test.

5. **Resampling Techniques (Jackknife & Bootstrap):**
   Generation of Jackknife and Bootstrap samples, estimation of population parameters, and computation of bias and standard errors.

6. **Confidence Interval (CI) Estimation:**
   Confidence Interval estimation for Binomial, Poisson, Normal, and Exponential distribution parameters.

7. **Stochastic Simulation & Random Variate Generation:**
   Generation of pseudo-random numbers and variates from various probability distributions: Uniform, Binomial, Poisson, Normal, Exponential, Gamma, Cauchy, Lognormal, and Weibull Distributions.

8. **Bayesian Parameter Estimation:**
   Bayesian estimation of parameters using Markov Chain Monte Carlo (MCMC) algorithms: Metropolis-Hastings Algorithm and Gibbs Sampler.`
};

// Add opt_tech (Sem 2)
data.opt_tech = {
  semester: 'sem-2',
  type: 'theory',
  code: 'MDS-203',
  title: 'Paper III: Optimization Techniques (MDS-203)',
  syllabus: `### 📘 UNIT - I: Linear Programming, Simplex Methods & Duality Theory

* **Foundations of Optimization & Convex Analysis:**
  Meaning and Scope of Optimization Techniques, Convex Sets and their Mathematical Properties, Extreme Points, Convex Polyhedra.

* **Linear Programming Problem (LPP) Formulation & Geometry:**
  General Linear Programming Problem (LPP), Mathematical Formulation of Real-World Problems, Graphical Method, Fundamental Theorem of LPP and Related Theorems.

* **Simplex Methods & Degeneracy:**
  Standard Simplex Algorithm, Charnes' Big-M Method, Two-Phase Simplex Method, Concept of Degeneracy and Cycling, Techniques for Resolving Degeneracy.

* **Duality Theory & Dual Simplex:**
  Concept of Duality in LPP, Formulation of Dual Problems, Primal-Dual Relationships, Fundamental Theorem of Duality, Complementary Slackness Theorem, Dual Simplex Algorithm.


### 📘 UNIT - II: Transportation, Assignment & Sequencing Problems

* **Transportation Problem (TPP):**
  Concept and Mathematical Model of TPP, TPP as a Special Case of LPP, Methods for Initial Basic Feasible Solution (IBFS): North-West Corner Rule (NWCR), Matrix Minimum (Least Cost) Method, Vogel’s Approximation Method (VAM). Optimal Solution via Modified Distribution (MODI / u-v) Method for Balanced and Unbalanced Transportation Problems.

* **Assignment Problem (AP) & TSP:**
  Mathematical Formulation of Assignment Problem, AP as a Special Case of Transportation and Linear Programming, Hungarian Method for Optimal Assignment, Handling Unbalanced Assignment and Restricted Assignments, Traveling Salesman Problem (TSP) and Branching / Tour Optimization.

* **Sequencing Problems:**
  Basic Assumptions of Sequencing, Optimal Processing Sequence of n Jobs on 2 Machines (Johnson’s Algorithm), Optimal Processing Sequence of n Jobs on 3 Machines without Passing.


### 📘 UNIT - III: Integer Programming, Network Analysis & Queuing Theory

* **Integer Programming Problem (IPP):**
  Mathematical Formulation of Pure and Mixed IPP, Gomory’s Fractional Cutting Plane Algorithm for Pure and Mixed IPP, Branch and Bound Technique.

* **Network Analysis (PERT & CPM):**
  Network Definitions and Constraints, Network Diagram Construction, Critical Path Method (CPM), Project Evaluation and Review Technique (PERT), Slack and Float Calculations, Network Flow Problems, Time-Cost Trade-Off Analysis (Project Crashing).

* **Queuing Theory (Waiting Line Models):**
  Introduction and Real-World Scope, Essential Components of Queuing Systems, Operating Characteristics (Transient and Steady States), Little’s Law and General Relationships, Inter-Arrival and Service Time Distributions (Poisson Arrival, Exponential Service / Pure Death Process), Classification and Analytical Solution of Queuing Models: M/M/1 : ∞/FIFO and M/M/1 : N/FIFO.


---

### 📚 Recommended Textbooks & Reference Books:
1. **Kanti Swarup, P.K. Gupta, Man Mohan**, *Operations Research (Sultan Chand & Sons)*
2. **Hamdy A. Taha**, *Operations Research: An Introduction (Macmillan / Pearson)*
3. **S.D. Sharma**, *Operations Research: Theory, Methods and Applications (Kedar Nath Ram Nath)*
4. **F.S. Hillier, G.J. Lieberman**, *Introduction to Operations Research (Holden-Day / McGraw-Hill)*`
};

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated examPrepData.json!');
