/**
 * Ingest Predicted Model Papers (Set A & Set B) for Optimization Techniques (MDS-203)
 * Writes into src/data/examPrepData.json under opt_tech["set-a"] and ["set-b"]
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'examPrepData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const tableStyle = "width: 100%; max-width: 550px; border-collapse: collapse; margin: 8px 0 12px 0; font-size: 0.84rem; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden;";
const thStyle = "border: 1px solid rgba(255, 255, 255, 0.15); padding: 5px 8px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; font-weight: 600; text-align: center;";
const tdStyle = "border: 1px solid rgba(255, 255, 255, 0.1); padding: 5px 8px; text-align: center; color: #cbd5e1;";
const tdLeftStyle = "border: 1px solid rgba(255, 255, 255, 0.1); padding: 5px 8px; text-align: left; color: #cbd5e1;";

// ──────────────────────────────────────────────
// SET A — MODEL QUESTION PAPER
// ──────────────────────────────────────────────
data.opt_tech['set-a'] = `
<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">🎯 PREDICTED MODEL PAPER – SET A (Core Baseline & High Probability)</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">OU STYLE</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
      <strong>Faculty of Science</strong> — Osmania University | M.Sc. (Data Science) II-Semester Examination |
      <strong>Code No:</strong> MDS-203-A |
      <strong>Subject:</strong> OPTIMIZATION TECHNIQUES (MDS-203) |
      <strong>Time:</strong> 2 ½ Hrs |
      <strong>Max. Marks:</strong> 70
    </p>

    <h5 style="color: #e2e8f0; margin: 1rem 0 0.5rem; font-size: 0.95rem; border-bottom: 1px solid rgba(56,189,248,0.2); padding-bottom: 0.25rem;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(56,189,248,0.12); color: #7dd3fc; margin-bottom: 0.5rem;">SHORT ANSWER</span>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Answer ALL Questions. Each question carries 2 Marks.</p>
    <ol style="margin-left: 1.5rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <li><strong>(Unit I)</strong> Define a convex set and state any two fundamental properties of convex sets. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li><strong>(Unit II)</strong> State the conditions under which a Transportation Problem is considered degenerate, and describe how degeneracy is resolved. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - II]</span></li>
      <li><strong>(Unit III)</strong> Define Total Float and Free Float in CPM network analysis, stating their mathematical formulas. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
      <li><strong>(Unit I/II/III)</strong> State the Complementary Slackness Theorem and explain its significance in linear programming duality. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I / Dual]</span></li>
      <li><strong>(Unit I/II/III)</strong> Write Kendall’s notation for queuing systems and define the traffic intensity (utilization factor) ρ. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III / Queue]</span></li>
    </ol>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 class="unit-title" style="color: #818cf8;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129,140,248,0.15); color: #a5b4fc;">ESSAY QUESTIONS</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</p>

    <!-- Q6 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 6:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit I: Application & Analysis]</span><br>
      (a) Solve the following Linear Programming Problem using the <strong>Two-Phase Simplex Method</strong>:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Minimize</strong> <em>Z = 2x₁ + 3x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>x₁ + x₂ ≥ 5</em><br>
        &nbsp;&nbsp;<em>x₁ + 2x₂ ≥ 6</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0</em>
      </div>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) State the <strong>Fundamental Theorem of Duality</strong>. For the following primal problem, construct its dual and solve the primal problem by finding the optimal solution to the dual:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Maximize</strong> <em>Z = 5x₁ + 12x₂ + 4x₃</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>x₁ + 2x₂ + x₃ ≤ 10</em><br>
        &nbsp;&nbsp;<em>2x₁ - x₂ + 3x₃ ≤ 8</em><br>
        &nbsp;&nbsp;<em>x₁, x₂, x₃ ≥ 0</em>
      </div>
    </div>

    <!-- Q7 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 7:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit II: Analysis & Evaluation]</span><br>
      (a) Find the Initial Basic Feasible Solution (IBFS) using <strong>Vogel’s Approximation Method (VAM)</strong> and obtain the optimal transportation schedule using the <strong>Modified Distribution (MODI / u-v) Method</strong> for the cost matrix below:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Origins \\ Destinations</th>
            <th style="${thStyle}">D1</th>
            <th style="${thStyle}">D2</th>
            <th style="${thStyle}">D3</th>
            <th style="${thStyle}">D4</th>
            <th style="${thStyle}">Supply</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">O1</td>
            <td style="${tdStyle}">19</td>
            <td style="${tdStyle}">30</td>
            <td style="${tdStyle}">50</td>
            <td style="${tdStyle}">10</td>
            <td style="${tdStyle}; font-weight: 600;">7</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">O2</td>
            <td style="${tdStyle}">70</td>
            <td style="${tdStyle}">30</td>
            <td style="${tdStyle}">40</td>
            <td style="${tdStyle}">60</td>
            <td style="${tdStyle}; font-weight: 600;">9</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">O3</td>
            <td style="${tdStyle}">40</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">70</td>
            <td style="${tdStyle}">20</td>
            <td style="${tdStyle}; font-weight: 600;">18</td>
          </tr>
          <tr style="background: rgba(56, 189, 248, 0.08);">
            <td style="${tdStyle}; font-weight: 600; color: #e2e8f0;">Demand</td>
            <td style="${tdStyle}; font-weight: 600;">5</td>
            <td style="${tdStyle}; font-weight: 600;">8</td>
            <td style="${tdStyle}; font-weight: 600;">7</td>
            <td style="${tdStyle}; font-weight: 600;">14</td>
            <td style="${tdStyle}; font-weight: 700; color: #38bdf8;">34</td>
          </tr>
        </tbody>
      </table>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) A company has 4 machines to be assigned to 4 jobs. The processing costs (in hundreds of rupees) are given below. Use the <strong>Hungarian Method</strong> to determine the optimal assignment that minimizes total cost:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Job \\ Machine</th>
            <th style="${thStyle}">M1</th>
            <th style="${thStyle}">M2</th>
            <th style="${thStyle}">M3</th>
            <th style="${thStyle}">M4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">J1</td>
            <td style="${tdStyle}">12</td>
            <td style="${tdStyle}">30</td>
            <td style="${tdStyle}">21</td>
            <td style="${tdStyle}">15</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">J2</td>
            <td style="${tdStyle}">18</td>
            <td style="${tdStyle}">33</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">31</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">J3</td>
            <td style="${tdStyle}">44</td>
            <td style="${tdStyle}">25</td>
            <td style="${tdStyle}">24</td>
            <td style="${tdStyle}">21</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">J4</td>
            <td style="${tdStyle}">23</td>
            <td style="${tdStyle}">30</td>
            <td style="${tdStyle}">28</td>
            <td style="${tdStyle}">14</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Q8 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 8:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit III: Application & Synthesis]</span><br>
      (a) Solve the following Pure Integer Linear Programming Problem using <strong>Gomory’s Cutting Plane Algorithm</strong>:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Maximize</strong> <em>Z = x₁ + x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>3x₁ + 2x₂ ≤ 5</em><br>
        &nbsp;&nbsp;<em>x₂ ≤ 2</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0 and are integers</em>
      </div>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) For the <strong>(M/M/1) : (∞ / FIFO)</strong> queuing model, derive the steady-state difference-differential equations and obtain explicit formulas for:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        (i) Expected number of customers in the system (<em>L</em>)<br>
        (ii) Expected number of customers in the queue (<em>L_q</em>)<br>
        (iii) Expected waiting time in the system (<em>W</em>)<br>
        (iv) Expected waiting time in the queue (<em>W_q</em>)
      </div>
    </div>

    <!-- Q9 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 9:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed / Comprehensive: Application & Analysis]</span><br>
      (a) Explain the step-by-step procedure of <strong>Charnes’ Big-M Method (Method of Penalties)</strong> and solve:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Maximize</strong> <em>Z = 3x₁ + 2x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>2x₁ + x₂ ≤ 2</em><br>
        &nbsp;&nbsp;<em>3x₁ + 4x₂ ≥ 12</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0</em>
      </div>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Solve the following <strong>Traveling Salesman Problem (TSP)</strong> to find the minimum distance tour starting and ending at city 1:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">From \\ To</th>
            <th style="${thStyle}">1</th>
            <th style="${thStyle}">2</th>
            <th style="${thStyle}">3</th>
            <th style="${thStyle}">4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">1</td>
            <td style="${tdStyle}">∞</td>
            <td style="${tdStyle}">10</td>
            <td style="${tdStyle}">15</td>
            <td style="${tdStyle}">20</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">2</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">∞</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">10</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">3</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">13</td>
            <td style="${tdStyle}">∞</td>
            <td style="${tdStyle}">12</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">4</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">∞</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Q10 -->
    <div style="margin-bottom: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 10:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed / Comprehensive: Synthesis & Evaluation]</span><br>
      (a) A project consists of the following activities with optimistic (<em>t_o</em>), most likely (<em>t_m</em>), and pessimistic (<em>t_p</em>) time estimates (in weeks):
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Activity</th>
            <th style="${thStyle}">Predecessor</th>
            <th style="${thStyle}">t_o</th>
            <th style="${thStyle}">t_m</th>
            <th style="${thStyle}">t_p</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">A</td>
            <td style="${tdStyle}">—</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">8</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">B</td>
            <td style="${tdStyle}">—</td>
            <td style="${tdStyle}">1</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">5</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">C</td>
            <td style="${tdStyle}">A</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">8</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">D</td>
            <td style="${tdStyle}">B</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">6</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">E</td>
            <td style="${tdStyle}">C, D</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">11</td>
          </tr>
        </tbody>
      </table>
      Construct the <strong>PERT network</strong>, find the critical path, determine the expected project completion time with its variance, and calculate the probability of completing the project within 20 weeks.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) There are 5 jobs, each of which must go through two machines M₁ and M₂ in the order M₁ → M₂. The processing times (in hours) are given below:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Job</th>
            <th style="${thStyle}">J1</th>
            <th style="${thStyle}">J2</th>
            <th style="${thStyle}">J3</th>
            <th style="${thStyle}">J4</th>
            <th style="${thStyle}">J5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">Machine M1</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">1</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">10</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">Machine M2</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">4</td>
          </tr>
        </tbody>
      </table>
      Determine the optimal sequence of jobs using <strong>Johnson’s Algorithm</strong>, and compute the total elapsed time and idle time for both machines.
    </div>
  </div>
</div>
`;

// ──────────────────────────────────────────────
// SET B — MODEL QUESTION PAPER
// ──────────────────────────────────────────────
data.opt_tech['set-b'] = `
<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">🎯 PREDICTED MODEL PAPER – SET B (Alternative Combinations & Deep-Cut Topics)</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">OU STYLE</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
      <strong>Faculty of Science</strong> — Osmania University | M.Sc. (Data Science) II-Semester Examination |
      <strong>Code No:</strong> MDS-203-B |
      <strong>Subject:</strong> OPTIMIZATION TECHNIQUES (MDS-203) |
      <strong>Time:</strong> 2 ½ Hrs |
      <strong>Max. Marks:</strong> 70
    </p>

    <h5 style="color: #e2e8f0; margin: 1rem 0 0.5rem; font-size: 0.95rem; border-bottom: 1px solid rgba(56,189,248,0.2); padding-bottom: 0.25rem;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(56,189,248,0.12); color: #7dd3fc; margin-bottom: 0.5rem;">SHORT ANSWER</span>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Answer ALL Questions. Each question carries 2 Marks.</p>
    <ol style="margin-left: 1.5rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <li><strong>(Unit I)</strong> Define Basic Feasible Solution (BFS) and Degenerate BFS in Linear Programming. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li><strong>(Unit II)</strong> Explain the difference between a standard Transportation Problem and an Assignment Problem. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - II]</span></li>
      <li><strong>(Unit III)</strong> Differentiate between Pure and Mixed Integer Linear Programming Problems with standard algebraic forms. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
      <li><strong>(Unit I/II/III)</strong> State the conditions under which the Dual Simplex Algorithm is directly applicable without artificial variables. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I / Dual Simplex]</span></li>
      <li><strong>(Unit I/II/III)</strong> Define transient state and steady state in queuing systems, and state Little’s Formulas. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III / Queue]</span></li>
    </ol>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 class="unit-title" style="color: #818cf8;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129,140,248,0.15); color: #a5b4fc;">ESSAY QUESTIONS</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</p>

    <!-- Q6 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 6:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit I: Application & Analysis]</span><br>
      (a) Solve the following Linear Programming Problem using the <strong>Dual Simplex Method</strong>:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Minimize</strong> <em>Z = 2x₁ + x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>3x₁ + x₂ ≥ 3</em><br>
        &nbsp;&nbsp;<em>4x₁ + 3x₂ ≥ 6</em><br>
        &nbsp;&nbsp;<em>x₁ + 2x₂ ≥ 3</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0</em>
      </div>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Explain the phenomenon of <strong>cycling and degeneracy</strong> in Simplex iterations. Describe <strong>Bland's minimum index rule</strong> and <strong>Charnes' perturbation method</strong> for breaking ties and avoiding cycling.
    </div>

    <!-- Q7 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 7:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit II: Analysis & Evaluation]</span><br>
      (a) Consider the following unbalanced transportation problem where supply exceeds demand. Balance the problem by introducing a dummy destination with zero transportation cost, find the initial basic feasible solution using <strong>Vogel’s Approximation Method (VAM)</strong>, and test for optimality using the <strong>MODI method</strong>:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Plant \\ Market</th>
            <th style="${thStyle}">W1</th>
            <th style="${thStyle}">W2</th>
            <th style="${thStyle}">W3</th>
            <th style="${thStyle}">Capacity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">P1</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}; font-weight: 600;">40</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">P2</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}; font-weight: 600;">60</td>
          </tr>
          <tr style="background: rgba(56, 189, 248, 0.08);">
            <td style="${tdStyle}; font-weight: 600; color: #e2e8f0;">Demand</td>
            <td style="${tdStyle}; font-weight: 600;">35</td>
            <td style="${tdStyle}; font-weight: 600;">25</td>
            <td style="${tdStyle}; font-weight: 600;">20</td>
            <td style="${tdStyle}; font-weight: 700; color: #38bdf8;">80 / 100</td>
          </tr>
        </tbody>
      </table>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) An unbalanced assignment problem involves 4 operators and 5 jobs. The execution times (in hours) are given below. Formulate the balanced problem with a dummy operator and determine the optimal assignment using the <strong>Hungarian Method</strong>:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Operator \\ Job</th>
            <th style="${thStyle}">1</th>
            <th style="${thStyle}">2</th>
            <th style="${thStyle}">3</th>
            <th style="${thStyle}">4</th>
            <th style="${thStyle}">5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">A</td>
            <td style="${tdStyle}">10</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">13</td>
            <td style="${tdStyle}">15</td>
            <td style="${tdStyle}">16</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">B</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">18</td>
            <td style="${tdStyle}">13</td>
            <td style="${tdStyle}">6</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">C</td>
            <td style="${tdStyle}">10</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">2</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">D</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">11</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">12</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Q8 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 8:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[From Unit III: Application & Synthesis]</span><br>
      (a) Explain the <strong>Branch and Bound Technique</strong> for solving Integer Linear Programming Problems. Solve the following problem using the Branch and Bound search tree:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Maximize</strong> <em>Z = 3x₁ + 4x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>2x₁ + x₂ ≤ 6</em><br>
        &nbsp;&nbsp;<em>2x₁ + 3x₂ ≤ 9</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0 and are integers</em>
      </div>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) For the finite capacity queuing model <strong>(M/M/1) : (N / FIFO)</strong>, derive the steady-state probability distribution <em>Pₙ</em> (for <em>n = 0, 1, ..., N</em>). Obtain explicit formulas for:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        (i) The effective arrival rate (<em>λ_eff</em>) and probability of customer loss (<em>P_N</em>)<br>
        (ii) Expected number of customers in the system (<em>L</em>)<br>
        (iii) Expected waiting time in the system (<em>W</em>) using Little's Law
      </div>
    </div>

    <!-- Q9 -->
    <div style="margin-bottom: 1.25rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 9:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed / Comprehensive: Application & Analysis]</span><br>
      (a) In an assignment problem, 4 workers are to be assigned to 4 jobs. However, Worker W₂ cannot be assigned to Job J₃, and Worker W₄ cannot be assigned to Job J₁. The cost matrix is given below. Solve this <strong>restricted assignment problem</strong> using the Hungarian Method:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Worker \\ Job</th>
            <th style="${thStyle}">J1</th>
            <th style="${thStyle}">J2</th>
            <th style="${thStyle}">J3</th>
            <th style="${thStyle}">J4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">W1</td>
            <td style="${tdStyle}">11</td>
            <td style="${tdStyle}">17</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">16</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">W2</td>
            <td style="${tdStyle}">9</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}; color: #f43f5e; font-weight: 600;">— (Prohibited)</td>
            <td style="${tdStyle}">12</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">W3</td>
            <td style="${tdStyle}">13</td>
            <td style="${tdStyle}">16</td>
            <td style="${tdStyle}">15</td>
            <td style="${tdStyle}">12</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">W4</td>
            <td style="${tdStyle}; color: #f43f5e; font-weight: 600;">— (Prohibited)</td>
            <td style="${tdStyle}">10</td>
            <td style="${tdStyle}">12</td>
            <td style="${tdStyle}">11</td>
          </tr>
        </tbody>
      </table>
      <span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Explain the <strong>Time-Cost Trade-Off (Network Crashing)</strong> procedure. A project network has the following activity details with normal and crash costs. Explain how to determine the optimal project duration and minimum total cost by systematic critical path crashing:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Activity</th>
            <th style="${thStyle}">Predecessor</th>
            <th style="${thStyle}">Normal Time (days)</th>
            <th style="${thStyle}">Crash Time (days)</th>
            <th style="${thStyle}">Normal Cost (Rs.)</th>
            <th style="${thStyle}">Crash Cost (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">1-2</td>
            <td style="${tdStyle}">—</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">700</td>
            <td style="${tdStyle}">1000</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">1-3</td>
            <td style="${tdStyle}">—</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">400</td>
            <td style="${tdStyle}">1000</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">2-4</td>
            <td style="${tdStyle}">1-2</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">600</td>
            <td style="${tdStyle}">900</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">3-4</td>
            <td style="${tdStyle}">1-3</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">500</td>
            <td style="${tdStyle}">800</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Q10 -->
    <div style="margin-bottom: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 10:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed / Comprehensive: Synthesis & Evaluation]</span><br>
      (a) State <strong>Johnson’s conditions</strong> for extending the 2-machine sequencing rule to 3 machines without passing. Solve the following sequencing problem for 5 jobs processed on machines M₁, M₂, and M₃ in the order M₁ → M₂ → M₃:
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Machine \\ Job</th>
            <th style="${thStyle}">1</th>
            <th style="${thStyle}">2</th>
            <th style="${thStyle}">3</th>
            <th style="${thStyle}">4</th>
            <th style="${thStyle}">5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">M1</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">9</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">M2</td>
            <td style="${tdStyle}">2</td>
            <td style="${tdStyle}">3</td>
            <td style="${tdStyle}">4</td>
            <td style="${tdStyle}">1</td>
            <td style="${tdStyle}">5</td>
          </tr>
          <tr>
            <td style="${tdStyle}; font-weight: 600; color: #38bdf8;">M3</td>
            <td style="${tdStyle}">5</td>
            <td style="${tdStyle}">7</td>
            <td style="${tdStyle}">6</td>
            <td style="${tdStyle}">8</td>
            <td style="${tdStyle}">7</td>
          </tr>
        </tbody>
      </table>
      Verify the conditions, determine the optimal job sequence, and compute the total elapsed time and idle time for each machine.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) State the general mathematical formulation of a Linear Programming Problem. Solve the following problem using the <strong>Standard Simplex Method</strong> and state whether the final solution is unique or has alternative optima:<br>
      <div style="padding-left: 1rem; margin: 4px 0; color: #cbd5e1;">
        <strong>Maximize</strong> <em>Z = 4x₁ + 10x₂</em><br>
        subject to:<br>
        &nbsp;&nbsp;<em>2x₁ + x₂ ≤ 50</em><br>
        &nbsp;&nbsp;<em>2x₁ + 5x₂ ≤ 100</em><br>
        &nbsp;&nbsp;<em>2x₁ + 3x₂ ≤ 90</em><br>
        &nbsp;&nbsp;<em>x₁, x₂ ≥ 0</em>
      </div>
    </div>
  </div>
</div>
`;

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Predicted Model Paper Sets (Set A & Set B) successfully added for Optimization Techniques (MDS-203)!');
