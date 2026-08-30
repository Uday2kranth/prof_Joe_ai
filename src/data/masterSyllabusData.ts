export type EducationLevelType = 'all' | 'foundations' | 'undergraduate' | 'postgraduate' | 'doctoral';
export type SubjectStreamType = 'all' | 'math_stats' | 'ai_ml' | 'cs_algo';

export interface GranularUnitItem {
  unitCode: string;
  title: string;
  educationLevel: 'foundations' | 'undergraduate' | 'postgraduate' | 'doctoral';
  levelBadge: string;
  overview: string;
  detailedTopics: string[];
  coreCompetencies: string[];
  recommendedTextbooks: string[];
  interactiveLab?: {
    workspace: 'test_diagrams' | 'deep_learning_studio' | 'dsa_lab' | 'cubes' | 'diagrams';
    label: string;
    description: string;
  };
}

export interface CurriculumTrack {
  trackId: string;
  trackNumber: number;
  trackTitle: string;
  streamId: 'math_stats' | 'ai_ml' | 'cs_algo';
  educationLevel: 'foundations' | 'undergraduate' | 'postgraduate' | 'doctoral';
  levelBadge: string;
  summary: string;
  units: GranularUnitItem[];
}

export interface EducationLevelDefinition {
  id: EducationLevelType;
  name: string;
  badge: string;
  codeRange: string;
  targetAudience: string;
  icon: string;
  description: string;
}

export const EDUCATION_LEVELS: EducationLevelDefinition[] = [
  {
    id: 'all',
    name: 'All Education Levels',
    badge: 'Complete Scope',
    codeRange: 'Level 0 – 600+',
    targetAudience: 'All Learners (Foundations to Frontier Research)',
    icon: '🌐',
    description: 'Comprehensive curriculum from fundamental axioms to modern research frontiers.'
  },
  {
    id: 'foundations',
    name: 'Foundations & High School Bridge',
    badge: 'Level 0 – 100',
    codeRange: 'Level 0 – 100 (Bridge / 1st Year)',
    targetAudience: 'Bridge / 1st Year Undergraduates & Self-Learners',
    icon: '🏫',
    description: 'Intuitive algebra, single-variable calculus, basic discrete logic, and initial programming data types.'
  },
  {
    id: 'undergraduate',
    name: 'Undergraduate University Core',
    badge: 'Level 200 – 300',
    codeRange: 'Level 200 – 300 (B.Tech / B.Sc / B.E.)',
    targetAudience: 'B.Tech / B.E. / B.Sc Students (Osmania, JNTU, IIT/NIT)',
    icon: '🎓',
    description: 'Rigorous multivariable calculus, linear algebra, classical ML algorithms, standard DSA, and probability inference.'
  },
  {
    id: 'postgraduate',
    name: 'Postgraduate & Master\'s Rigor',
    badge: 'Level 400 – 500',
    codeRange: 'Level 400 – 500 (M.Tech / M.Sc / MCA)',
    targetAudience: 'M.Tech AI/CS, M.Sc Data Science, MCA & GATE/NET Scholars',
    icon: '🏛️',
    description: 'Measure theory, SVD spectral analysis, convex Lagrangian optimization, Deep Learning backprop flow, and Transformer architectures.'
  },
  {
    id: 'doctoral',
    name: 'Doctoral & Frontier Research',
    badge: 'Level 600+',
    codeRange: 'Level 600+ (Ph.D. / Research Labs)',
    targetAudience: 'Ph.D. Researchers, R&D Scientists, AI Research Fellows',
    icon: '🔬',
    description: 'Non-convex loss landscapes, SDE dynamics, multi-agent consensus protocols, mechanistic interpretability, and complexity reductions.'
  }
];

export interface SubjectStreamDefinition {
  id: 'math_stats' | 'ai_ml' | 'cs_algo';
  name: string;
  shortName: string;
  icon: string;
  color: string;
  summary: string;
  curriculumBenchmark: string;
  totalTracks: number;
}

export const SUBJECT_STREAMS: SubjectStreamDefinition[] = [
  {
    id: 'math_stats',
    name: 'Pure & Applied Mathematics and Statistical Sciences',
    shortName: 'Mathematics & Statistics',
    icon: '📐',
    color: '#38bdf8',
    summary: 'Axiomatic algebra, advanced matrix analysis, multivariable calculus, Runge-Kutta ODE dynamics, Fourier analysis, Gaussian inference, and convex optimization.',
    curriculumBenchmark: 'ISI Kolkata/Hyderabad, CMI, IIT Bombay, University of Hyderabad (UoH)',
    totalTracks: 8
  },
  {
    id: 'ai_ml',
    name: 'Artificial Intelligence, Machine Learning & Deep Architectures',
    shortName: 'AI & Machine Learning',
    icon: '🤖',
    color: '#c084fc',
    summary: 'Classical symbolic AI, Mercer kernel SVC/SVR lifts, deep neural networks, CNN computer vision, Transformers, VAEs, Diffusion flow matching, and Agentic MCP systems.',
    curriculumBenchmark: 'IIIT Hyderabad (Kohli Center), Stanford CS229/CS231n, MIT 6.036',
    totalTracks: 7
  },
  {
    id: 'cs_algo',
    name: 'Data Structures, Algorithms & Computational Complexity',
    shortName: 'DSA & Algorithms',
    icon: '💻',
    color: '#34d399',
    summary: 'Linear & tree structures, self-balancing AVL rotations, graph BFS/DFS traversals, Dijkstra shortest paths, Dynamic Programming grids, and P vs NP complexity.',
    curriculumBenchmark: 'CLRS Standard, IISc Bangalore, IIT Hyderabad, ACM-ICPC Standards',
    totalTracks: 6
  }
];

export const MASTER_CURRICULUM_TRACKS: CurriculumTrack[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 1. MATHEMATICS & STATISTICS (8 TRACKS)
  // ═════════════════════════════════════════════════════════════════════════
  {
    trackId: 'math-track-1',
    trackNumber: 1,
    trackTitle: 'Track 1: Pre-Calculus, Elementary Functions & Methods of Proof',
    streamId: 'math_stats',
    educationLevel: 'foundations',
    levelBadge: 'Level 0 – 100: Foundations',
    summary: 'Number systems, functions & mappings, polynomials, trigonometric/exponential functions, analytic geometry, and formal mathematical proof techniques.',
    units: [
      {
        unitCode: 'MATH-1.1',
        title: 'Elementary Algebra, Functions & Polynomials',
        educationLevel: 'foundations',
        levelBadge: 'Level 0 – 100: Foundations',
        overview: 'Axiomatic number systems (ℝ, ℂ), injective/surjective mappings, synthetic division, Vieta\'s formulas, and asymptotic behavior of power/logarithmic functions.',
        detailedTopics: [
          'Number Systems: Natural numbers, integers, rationals, irrationals, real numbers ℝ, complex field ℂ',
          'Functions & Mappings: Injective, surjective, bijective mappings; domain, codomain, range; composition, inverse functions',
          'Polynomials & Roots: Fundamental Theorem of Algebra, synthetic division, Vieta\'s formulas, Descartes Rule of Signs',
          'Exponential, Logarithmic & Power Functions: Logarithmic identities, continuous compounding e^x, asymptotic growth orders'
        ],
        coreCompetencies: ['Algebraic manipulation', 'Function invertibility proofs', 'Polynomial root characterization'],
        recommendedTextbooks: ['Hall & Knight (Higher Algebra)', 'Stewart (Precalculus: Mathematics for Calculus)']
      },
      {
        unitCode: 'MATH-1.2',
        title: 'Trigonometry, Analytic Geometry & Methods of Proof',
        educationLevel: 'foundations',
        levelBadge: 'Level 0 – 100: Foundations',
        overview: 'Unit circle definitions, 2D/3D conic sections, polar coordinates, direct proofs, proof by contrapositive, contradiction, and strong mathematical induction.',
        detailedTopics: [
          'Trigonometric Identities: Unit circle definition, compound/double-angle formulas, inverse trigonometric functions',
          'Coordinate Geometry: Cartesian, polar, cylindrical, spherical; lines, planes, conic sections (parabolas, ellipses, hyperbolas)',
          'Proof Methods: Direct proof, proof by contrapositive, proof by contradiction (infinitude of primes, √2 irrationality)',
          'Mathematical Induction: Weak induction, strong induction, well-ordering principle, structural induction'
        ],
        coreCompetencies: ['Inductive proof construction', 'Analytic curve parameterization', 'Logical negation techniques'],
        recommendedTextbooks: ['Velleman (How to Prove It: A Structured Approach)', 'Loney (Coordinate Geometry)']
      }
    ]
  },
  {
    trackId: 'math-track-2',
    trackNumber: 2,
    trackTitle: 'Track 2: Linear Algebra, Vector Spaces & Matrix Analysis',
    streamId: 'math_stats',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'Vector spaces over fields, bases and dimension, linear transformations, Rank-Nullity Theorem, inner product spaces, Gram-Schmidt, and matrix factorizations.',
    units: [
      {
        unitCode: 'MATH-2.1',
        title: 'Vector Spaces, Linear Systems & Rank-Nullity Theorem',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Axioms of vector spaces, Steinitz exchange lemma, Hamel bases, matrix representations of linear operators, and the Rank-Nullity Theorem in ℝⁿ.',
        detailedTopics: [
          'Vector Spaces over Fields: Subspaces, direct sums, linear combinations, span, linear independence',
          'Bases & Dimension: Steinitz exchange lemma, basis construction, infinite-dimensional vector spaces',
          'Linear Transformations: Kernel (null space), range (image), matrix representations, change of basis matrices',
          'Linear Systems: Gaussian elimination, row echelon forms, Gauss-Jordan reduction, homogeneous vs non-homogeneous systems',
          'Rank-Nullity Theorem: Full mathematical proof, geometric rank interpretations, isomorphism theorems'
        ],
        coreCompetencies: ['Basis transformation matrices', 'Kernel and image subspace computation', 'Rank-nullity dimension accounting'],
        recommendedTextbooks: ['Gilbert Strang (Linear Algebra and Its Applications)', 'Hoffman & Kunze (Linear Algebra)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open 2D/3D Linear Matrix Transformation Lab',
          description: 'Explore 2x2 coordinate basis transformations, shearings, and determinant area scalings.'
        }
      },
      {
        unitCode: 'MATH-2.2',
        title: 'Inner Product Spaces, Orthogonality & QR Factorization',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Real and complex inner products, Cauchy-Schwarz inequality, orthogonal projections, Gram-Schmidt orthogonalization, Householder transformations, and QR decomposition.',
        detailedTopics: [
          'Inner Products & Norms: Real/complex inner products, Cauchy-Schwarz inequality, Minkowski inequality, induced norms',
          'Orthogonality: Orthogonal complements, orthogonal projections, Gram-Schmidt orthogonalization process',
          'Unitary & Orthogonal Operators: Isometries, orthogonal matrices, unitary matrices, Householder reflectors, Givens rotations',
          'QR Factorization: Gram-Schmidt QR, Householder QR, applications to least-squares overdetermined systems'
        ],
        coreCompetencies: ['Orthogonal projection derivations', 'QR factorization algorithms', 'Cauchy-Schwarz inequality applications'],
        recommendedTextbooks: ['Horn & Johnson (Matrix Analysis)', 'Golub & Van Loan (Matrix Computations)']
      }
    ]
  },
  {
    trackId: 'math-track-3',
    trackNumber: 3,
    trackTitle: 'Track 3: Real Analysis, Multivariable Calculus & Measure Theory',
    streamId: 'math_stats',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Topology of metric spaces, Fréchet derivatives, Clairaut\'s theorem, multivariate Taylor expansions, Lebesgue measure, and Dominated Convergence Theorem.',
    units: [
      {
        unitCode: 'MATH-3.1',
        title: 'Multivariable Differential Calculus & Taylor Approximations',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Differentiation in ℝⁿ, total derivatives, Fréchet and Gâteaux derivatives, Clairaut\'s theorem on mixed partials, Hessian matrices, and multivariate Taylor approximations.',
        detailedTopics: [
          'Partial Derivatives: Directional derivatives, gradient vector ∇f, tangent hyperplanes',
          'Higher-Order Differentials: Hessian matrix, Clairaut\'s theorem on equality of mixed partials',
          'Multivariate Taylor Series: Quadratic approximations, critical point classification via Hessian eigenvalues',
          'Inverse & Implicit Function Theorems: Rigorous proofs, rank theorem, smooth manifolds in ℝⁿ, Lagrange multipliers'
        ],
        coreCompetencies: ['Multivariate Hessian analysis', 'Lagrangian constraint derivations', 'Fréchet gradient evaluations'],
        recommendedTextbooks: ['Spivak (Calculus on Manifolds)', 'Apostol (Mathematical Analysis)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open Tangents, Secants & Riemann Sums Lab',
          description: 'Explore dynamic secant-to-tangent convergence and real-time Riemann summation partitions.'
        }
      },
      {
        unitCode: 'MATH-3.2',
        title: 'Measure Theory, Lebesgue Integration & L^p Spaces',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'σ-algebras, Borel sets, Carathéodory extension theorem, Lebesgue integral, Monotone/Dominated Convergence Theorems, and L^p Banach spaces.',
        detailedTopics: [
          'Measurable Spaces: σ-algebras, Borel sets, Dynkin\'s π-λ theorem, construction of Lebesgue measure on ℝⁿ',
          'Lebesgue Integral: Measurable simple functions, Fatou\'s Lemma, Monotone Convergence Theorem, Dominated Convergence Theorem',
          'Product Measures: Fubini-Tonelli theorems, Cavalieri\'s principle, iterated integrals',
          'Radon-Nikodym Theorem: Absolute continuity of measures, singular measures, Lebesgue decomposition',
          'Functional Analysis Foundations: L^p spaces, Hölder and Minkowski inequalities, Hilbert space Riesz representation theorem'
        ],
        coreCompetencies: ['Lebesgue dominated convergence proofs', 'Measure-theoretic integration', 'L^p space dualities'],
        recommendedTextbooks: ['Rudin (Real and Complex Analysis)', 'Royden & Fitzpatrick (Real Analysis, 4th Ed)']
      }
    ]
  },
  {
    trackId: 'math-track-4',
    trackNumber: 4,
    trackTitle: 'Track 4: Spectral Theory, SVD Geometry & Advanced Matrix Decompositions',
    streamId: 'math_stats',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Spectral Theorem for symmetric operators, Jordan canonical forms, Singular Value Decomposition (thin vs full), Moore-Penrose pseudoinverse, and Eckart-Young-Mirsky approximation.',
    units: [
      {
        unitCode: 'MATH-4.1',
        title: 'Eigenvalues, Diagonalization & Jordan Canonical Forms',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Characteristic polynomial, minimal polynomial, algebraic vs geometric multiplicity, Spectral Theorem for Hermitian matrices, and Jordan block decompositions.',
        detailedTopics: [
          'Eigenvalue Analysis: Characteristic and minimal polynomials, eigenspaces, generalized eigenspaces',
          'Diagonalization: Spectral Theorem for symmetric, Hermitian, and normal operators',
          'Jordan Canonical Form: Nilpotent operators, Jordan blocks, rational canonical form',
          'Matrix Factorizations: LU (with partial pivoting), Cholesky decomposition LDLᵀ, Schur decomposition'
        ],
        coreCompetencies: ['Hermitian diagonalization', 'Jordan normal form decomposition', 'Cholesky matrix factorization'],
        recommendedTextbooks: ['Golub & Van Loan (Matrix Computations)', 'Axler (Linear Algebra Done Right)']
      },
      {
        unitCode: 'MATH-4.2',
        title: 'Singular Value Decomposition (SVD) & Low-Rank Approximation',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Singular values and singular vectors, full vs thin SVD, Moore-Penrose pseudoinverse, Eckart-Young-Mirsky theorem under Frobenius/spectral norms, and matrix calculus.',
        detailedTopics: [
          'SVD Geometry: Right/left singular vectors, singular value matrix Σ, geometric ellipsoid deformation',
          'Eckart-Young-Mirsky Theorem: Optimal rank-k approximation under Frobenius and spectral norms, energy preservation',
          'Moore-Penrose Pseudoinverse: A⁺ = V Σ⁺ Uᵀ, minimum-norm least squares solution',
          'Matrix Calculus: Gradients of quadratic forms, Jacobians, Hessians, Kronecker and Khatri-Rao products',
          'Matrix Norms & Conditioning: Spectral norm, Frobenius norm, Nuclear norm, condition numbers and Weyl perturbation bounds'
        ],
        coreCompetencies: ['SVD spectral projections', 'Low-rank data compression', 'Matrix differential calculus'],
        recommendedTextbooks: ['Golub & Van Loan (Matrix Computations)', 'Horn & Johnson (Matrix Analysis)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open 3D Hyperplane & SVD Studio',
          description: 'Rotate and project 3D coordinate clouds onto principal spectral axes with live singular value decomposition.'
        }
      }
    ]
  },
  {
    trackId: 'math-track-5',
    trackNumber: 5,
    trackTitle: 'Track 5: Differential Equations, Vector Fields & Dynamical Systems',
    streamId: 'math_stats',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'First/second order ODEs, systems of linear differential equations, phase portraits, fixed-point stability analysis, and Runge-Kutta numerical integrators.',
    units: [
      {
        unitCode: 'MATH-5.1',
        title: 'Ordinary Differential Equations & Existence-Uniqueness Theory',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Separable, exact, linear ODEs, integrating factors, Wronskian determinant, Picard-Lindelöf existence-uniqueness theorem, and Grönwall\'s inequality.',
        detailedTopics: [
          'First-Order ODEs: Separable, exact, integrating factors, autonomous systems and phase lines',
          'Higher-Order Linear ODEs: Homogeneous vs non-homogeneous, variation of parameters, Wronskian determinant',
          'Existence & Uniqueness: Picard-Lindelöf theorem, Picard iteration, Grönwall\'s inequality, maximal existence interval',
          'Linear Systems of ODEs: Fundamental matrix solutions, matrix exponential e^{At}, Jordan normal forms in ODEs'
        ],
        coreCompetencies: ['Picard iteration construction', 'Fundamental matrix ODE solutions', 'Integrating factor derivations'],
        recommendedTextbooks: ['Boyce & DiPrima (Elementary Differential Equations)', 'Coddington & Levinson (Theory of ODEs)']
      },
      {
        unitCode: 'MATH-5.2',
        title: 'Phase Plane Dynamics, Fixed-Point Stability & RK4 Integrators',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Planar linear systems, 2D Jacobian trace-determinant stability (Saddle, Node, Center, Spiral), Lyapunov functions, and Classical 4th-order Runge-Kutta (RK4).',
        detailedTopics: [
          'Fixed-Point Classification: Jacobian matrix J, characteristic equation, trace-determinant plane',
          'Nonlinear Dynamics & Chaos: Lyapunov stability, Poincaré-Bendixson theorem, Lorenz strange attractors',
          'Numerical Integrators: Euler method, Midpoint method, Classical 4th-order Runge-Kutta (RK4)',
          'Stability & Error Analysis: Local truncation error O(h⁵), global convergence O(h⁴), stiff ODE solvers and A-stability'
        ],
        coreCompetencies: ['Jacobian fixed-point stability analysis', 'RK4 step integration algorithms', 'Phase portrait trajectory sketching'],
        recommendedTextbooks: ['Strogatz (Nonlinear Dynamics and Chaos)', 'Hairer, Norsett, Wanner (Solving Ordinary Differential Equations I)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open Vector Fields & RK4 Dynamics Studio',
          description: 'Orbit and simulate trajectory particle flows across nonlinear dynamical systems.'
        }
      }
    ]
  },
  {
    trackId: 'math-track-6',
    trackNumber: 6,
    trackTitle: 'Track 6: Optimization Theory, Convex Duality & KKT Stationarity',
    streamId: 'math_stats',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Unconstrained descent methods, convex sets and epigraphs, Lagrangian duality, Slater\'s condition for strong duality, KKT optimality, and proximal algorithms.',
    units: [
      {
        unitCode: 'MATH-6.1',
        title: 'Unconstrained Optimization, Line Search & Quasi-Newton (BFGS)',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'First/second-order optimality conditions, steepest descent, Armijo-Goldstein and Wolfe step conditions, Newton-Raphson, and BFGS/L-BFGS quasi-Newton updates.',
        detailedTopics: [
          'Optimality Conditions: First-order stationary points, second-order necessary/sufficient positive definite Hessians',
          'Line Search Methods: Steepest descent, Armijo backtracking, Wolfe conditions, convergence rate analysis',
          'Newton & Quasi-Newton: Newton-Raphson method, BFGS rank-2 updates, Limited-memory BFGS (L-BFGS)',
          'Conjugate Gradient Methods: Linear conjugate gradients, non-linear CG (Fletcher-Reeves, Polak-Ribière)'
        ],
        coreCompetencies: ['Wolfe condition line search tuning', 'BFGS Hessian approximation derivations', 'Convergence rate classifications'],
        recommendedTextbooks: ['Nocedal & Wright (Numerical Optimization)', 'Bertsekas (Nonlinear Programming)']
      },
      {
        unitCode: 'MATH-6.2',
        title: 'Convex Optimization, Lagrangian Duality & KKT Conditions',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Convex sets/functions, epigraphs, Jensen\'s inequality, primal-dual Lagrangian formulations, Slater\'s condition, and Karush-Kuhn-Tucker (KKT) necessary and sufficient conditions.',
        detailedTopics: [
          'Convex Sets & Functions: First/second-order convexity characterizations, sub-level sets, Jensen\'s inequality',
          'Standard Convex Formulations: Linear Programming (LP), Quadratic Programming (QP), Second-Order Cone Programming (SOCP), Semidefinite Programming (SDP)',
          'Lagrangian Duality: Primal problem, Lagrange dual function g(λ, ν), weak duality, strong duality, Slater\'s constraint qualification',
          'KKT Conditions: Primal feasibility, dual feasibility, complementary slackness λᵢfᵢ(x) = 0, stationarity gradient condition',
          'Proximal & Non-Smooth Methods: Subgradient calculus, Moreau envelopes, Proximal Gradient (ISTA/FISTA), ADMM splitting'
        ],
        coreCompetencies: ['KKT stationarity derivations', 'Dual problem formulation', 'Slater\'s condition verification'],
        recommendedTextbooks: ['Stephen Boyd & Lieven Vandenberghe (Convex Optimization)', 'Rockafellar (Convex Analysis)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open Marching Iso-Contours & Loss Landscape Studio',
          description: 'Interact with sub-pixel marching zero-crossing contour lines and gradient descent paths over convex surfaces.'
        }
      }
    ]
  },
  {
    trackId: 'math-track-7',
    trackNumber: 7,
    trackTitle: 'Track 7: Probability Theory, Statistical Inference & Gaussian Distributions',
    streamId: 'math_stats',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Probability spaces, discrete/continuous distributions, joint covariance ellipsoids, Central Limit Theorem, Maximum Likelihood Estimation, and Fisher Information.',
    units: [
      {
        unitCode: 'MATH-7.1',
        title: 'Random Variables, Joint Distributions & Covariance Ellipsoids',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Probability axioms, univariate/joint distributions, moments, characteristic functions, Bivariate Gaussian joint density with correlation ρ, and covariance ellipsoids.',
        detailedTopics: [
          'Probability Spaces: Kolmogorov axioms, independence, Law of Total Probability, Bayes\' theorem',
          'Univariate Distributions: Binomial, Poisson, Gaussian Normal, Exponential, Gamma, Beta, Student\'s t, Fisher\'s F',
          'Joint & Conditional Distributions: Joint PDF/CDF, conditional expectation, Law of Total Expectation, Covariance matrix Σ',
          'Bivariate Gaussian Geometry: Covariance matrix eigenvalues, principal axis tilt angle, covariance confidence ellipses'
        ],
        coreCompetencies: ['Bivariate normal density derivations', 'Covariance principal axis projections', 'Conditional expectation computation'],
        recommendedTextbooks: ['Casella & Berger (Statistical Inference)', 'Ross (A First Course in Probability)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open Gaussian & Student-t Distribution Studio',
          description: 'Explore 2D/3D Gaussian covariance ellipsoids, CLT sampling simulations, and Student-t tail transitions.'
        }
      },
      {
        unitCode: 'MATH-7.2',
        title: 'Estimation Theory, Maximum Likelihood & Cramér-Rao Bound',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Central Limit Theorem, Maximum Likelihood Estimator (MLE), score function, Fisher Information Matrix, Cramér-Rao Lower Bound (CRLB), and asymptotic normality.',
        detailedTopics: [
          'Asymptotic Convergence: Convergence in probability, convergence in distribution, Lindeberg-Lévy Central Limit Theorem',
          'Point Estimation: Method of Moments, Maximum Likelihood Estimation (MLE), score function, log-likelihood concavity',
          'Fisher Information: Fisher Information matrix I(θ), Cramér-Rao Lower Bound (CRLB) for unbiased estimators',
          'Sufficient Statistics: Neyman-Fisher Factorization Theorem, Rao-Blackwell Theorem, Lehmann-Scheffé completeness theorem'
        ],
        coreCompetencies: ['MLE log-likelihood derivation', 'Fisher information matrix calculation', 'CRLB minimum variance verification'],
        recommendedTextbooks: ['Casella & Berger (Statistical Inference)', 'Lehmann & Casella (Theory of Point Estimation)']
      }
    ]
  },
  {
    trackId: 'math-track-8',
    trackNumber: 8,
    trackTitle: 'Track 8: Stochastic Processes, SDEs & Frontier Research Analysis',
    streamId: 'math_stats',
    educationLevel: 'doctoral',
    levelBadge: 'Level 600+: Doctoral Frontier',
    summary: 'Brownian motion, Itô\'s Lemma, stochastic differential equations, Fokker-Planck diffusion, non-convex optimization dynamics, and random matrix theory.',
    units: [
      {
        unitCode: 'MATH-8.1',
        title: 'Itô Calculus, Stochastic Differential Equations (SDEs) & Diffusion',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Brownian motion W(t), quadratic variation, Itô\'s Lemma, Euler-Maruyama SDE numerical integration, Langevin dynamics, and Fokker-Planck equations.',
        detailedTopics: [
          'Brownian Motion: Continuous path properties, martingale characterization, quadratic variation [W, W]_t = t',
          'Itô Stochastic Calculus: Itô integral, Itô\'s Lemma for multivariate processes, stochastic chain rule',
          'Stochastic Differential Equations: Drift and diffusion coefficients, Euler-Maruyama numerical solver, Ornstein-Uhlenbeck process',
          'Fokker-Planck Equation: Forward Kolmogorov PDE for transition probability density evolution, Langevin sampling dynamics'
        ],
        coreCompetencies: ['Itô\'s Lemma expansion', 'Euler-Maruyama SDE simulation', 'Fokker-Planck density PDE formulation'],
        recommendedTextbooks: ['Oksendal (Stochastic Differential Equations)', 'Karatzas & Shreve (Brownian Motion and Stochastic Calculus)']
      },
      {
        unitCode: 'MATH-8.2',
        title: 'Non-Convex Optimization Dynamics & Random Matrix Theory',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Non-convex loss landscapes, escaping saddle points via noise injection, Polyak-Łojasiewicz inequality, Wigner semicircular law, and Marchenko-Pastur distribution.',
        detailedTopics: [
          'Non-Convex Optimization: Saddle point geometry, strict saddle property, Polyak-Łojasiewicz (PL) inequality and linear convergence',
          'Noise-Injected Gradient Dynamics: Perturbed SGD, Langevin dynamics for non-convex global optimization',
          'Random Matrix Theory: Wigner semicircular law for Gaussian orthogonal ensembles (GOE)',
          'Sample Covariance Matrices: Marchenko-Pastur spectral distribution, Tracy-Widom edge fluctuation law',
          'Optimal Transport: Wasserstein distance W₂(P, Q), Monge-Kantorovich formulation, Benamou-Brenier dynamic formulation'
        ],
        coreCompetencies: ['Saddle-point escape analysis', 'Wigner semicircular law spectral density derivation', 'Wasserstein metric evaluation'],
        recommendedTextbooks: ['Villani (Optimal Transport: Old and New)', 'Tao (Topics in Random Matrix Theory)']
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 2. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (7 TRACKS)
  // ═════════════════════════════════════════════════════════════════════════
  {
    trackId: 'ai-track-1',
    trackNumber: 1,
    trackTitle: 'Track 1: Classical Symbolic AI, Heuristic Search & Game Theory',
    streamId: 'ai_ml',
    educationLevel: 'foundations',
    levelBadge: 'Level 0 – 100: Foundations',
    summary: 'Intelligent agent architectures, state-space search (BFS/DFS), informed A* heuristic search, adversarial Minimax game trees with Alpha-Beta pruning, and CSP.',
    units: [
      {
        unitCode: 'AI-1.1',
        title: 'State-Space Representation, Uninformed & Heuristic Search (A*)',
        educationLevel: 'foundations',
        levelBadge: 'Level 0 – 100: Foundations',
        overview: 'Problem formulation, state transitions, tree search vs graph search, heuristic evaluation f(n) = g(n) + h(n), admissibility, and consistency.',
        detailedTopics: [
          'Intelligent Agents: PEAS description, environment types (deterministic, observable, discrete, dynamic), agent types',
          'Uninformed Search: BFS, DFS, Uniform Cost Search (Dijkstra variant), Iterative Deepening DFS (IDDFS)',
          'Informed Search (A*): Admissible heuristics h(n) ≤ h*(n), consistent heuristics, optimality proofs, IDA* and RBFS',
          'Heuristic Design: Relaxed problem abstractions, pattern databases, landmark heuristics'
        ],
        coreCompetencies: ['A* heuristic consistency proofs', 'State-space graph search implementation', 'Search complexity analysis'],
        recommendedTextbooks: ['Russell & Norvig (Artificial Intelligence: A Modern Approach, 4th Ed)']
      },
      {
        unitCode: 'AI-1.2',
        title: 'Adversarial Game Playing, Alpha-Beta Pruning & CSP',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Minimax game trees, static evaluation functions, Alpha-Beta pruning bounds, Monte Carlo Tree Search (MCTS), and Constraint Satisfaction Problems (AC-3).',
        detailedTopics: [
          'Game Playing: Minimax theorem, zero-sum games, static evaluation functions, horizon effect',
          'Alpha-Beta Pruning: Branch-and-bound pruning conditions [α, β], move ordering heuristics, transposition tables',
          'Monte Carlo Tree Search (MCTS): Selection (UCT), Expansion, Simulation rollout, Backpropagation update (AlphaGo framework)',
          'Constraint Satisfaction Problems: Forward Checking, Arc Consistency (AC-3 algorithm), MRV and LCV heuristics'
        ],
        coreCompetencies: ['Alpha-Beta tree pruning evaluation', 'MCTS selection math (UCT)', 'AC-3 constraint propagation'],
        recommendedTextbooks: ['Russell & Norvig (AIMA Chapter 5 & 6)']
      }
    ]
  },
  {
    trackId: 'ai-track-2',
    trackNumber: 2,
    trackTitle: 'Track 2: Classical Statistical Learning & Kernel Methods',
    streamId: 'ai_ml',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'Linear/Logistic regression, Softmax classification, Cross-Entropy loss landscapes, Support Vector Machines (SVC/SVR), and 3D Mercer kernel paraboloid lifts.',
    units: [
      {
        unitCode: 'AI-2.1',
        title: 'Linear & Logistic Regression, Softmax & Cross-Entropy Loss',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Ordinary Least Squares, L2 Ridge vs L1 Lasso sparsity, Bernoulli logistic regression, multi-class Softmax normalizations, and gradient descent optimization.',
        detailedTopics: [
          'Linear Regression: Normal equations derivation, Maximum Likelihood under Gaussian noise, Ridge and Lasso regularization',
          'Logistic Regression: Sigmoid activation σ(z), log-odds, Bernoulli cross-entropy loss, gradient descent updates',
          'Multi-Class Softmax: Softmax probability vector, temperature scaling, categorical cross-entropy loss, decision boundaries',
          'Model Evaluation: Confusion matrix, Precision, Recall, F1-score, ROC-AUC curve, Bias-Variance tradeoff'
        ],
        coreCompetencies: ['Cross-entropy gradient derivations', 'L1 vs L2 regularization geometric analysis', 'Softmax temperature tuning'],
        recommendedTextbooks: ['Christopher Bishop (Pattern Recognition and Machine Learning - PRML)', 'Hastie, Tibshirani, Friedman (ESL)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open Logistic & Softmax Decision Studio',
          description: 'Interact with multi-class Softmax decision boundaries and 4D logistic probability slicing.'
        }
      },
      {
        unitCode: 'AI-2.2',
        title: 'Support Vector Machines (SVC/SVR) & 3D Mercer Kernel Lift',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Hard vs soft margin hyperplanes, slack variables ξᵢ, hinge loss surrogate, Mercer kernel trick (RBF, Polynomial), 3D paraboloid lift, and SVR ε-tubes.',
        detailedTopics: [
          'Maximal Margin Classifiers: Hyperplane geometry, geometric margin 2/||w||, quadratic programming dual formulation',
          'Soft Margin SVM: Penalty parameter C, slack variables ξᵢ, hinge loss minimization',
          'Mercer\'s Kernel Trick: Implicit mapping to Reproducing Kernel Hilbert Space (RKHS), RBF Gaussian kernel',
          '3D Paraboloid Lift: Mapping non-linear 2D concentric circles to 3D linearly separable paraboloids z = x₁² + x₂²',
          'Support Vector Regression (SVR): ε-insensitive loss tube, dual slack optimization'
        ],
        coreCompetencies: ['SVM Lagrangian dual formulation', 'Mercer kernel RKHS verification', 'Non-linear kernel parameter tuning'],
        recommendedTextbooks: ['Bishop (PRML Chapters 6 & 7)', 'Schölkopf & Smola (Learning with Kernels)'],
        interactiveLab: {
          workspace: 'test_diagrams',
          label: 'Open SVC 3D Paraboloid Lift & SVR Studio',
          description: 'Orbit a live 3D paraboloid lift where 2D non-linear points become linearly separable by a slicing plane.'
        }
      }
    ]
  },
  {
    trackId: 'ai-track-3',
    trackNumber: 3,
    trackTitle: 'Track 3: Deep Neural Architectures, Optimization & Backpropagation',
    streamId: 'ai_ml',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Multi-layer perceptrons, universal approximation, non-saturating activations (ReLU, GELU), exact tensor backpropagation calculus, and adaptive optimizers (Adam, RMSProp).',
    units: [
      {
        unitCode: 'AI-3.1',
        title: 'Multi-Layer Perceptrons, Universal Approximations & Activations',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Biological vs artificial neurons, Universal Approximation Theorem, activation function saturation (Sigmoid vs ReLU/GELU/Swish), and computational DAGs.',
        detailedTopics: [
          'Perceptron Foundations: Linear separability limitations (XOR problem), Multi-Layer Perceptron (MLP) architecture',
          'Universal Approximation: Cybenko and Hornik theorems for single/multi-hidden layer networks',
          'Activation Function Dynamics: Vanishing gradients in Sigmoid/Tanh, dead neuron pathology in ReLU, GELU and Swish/SiLU non-monotonicity',
          'Regularization: L2 weight decay, Dropout Bernoulli masks, Batch Normalization vs Layer Normalization'
        ],
        coreCompetencies: ['Universal approximation proofs', 'Activation derivative evaluations', 'Dropout expectation scaling'],
        recommendedTextbooks: ['Goodfellow, Bengio, Courville (Deep Learning)', 'Nielsen (Neural Networks and Deep Learning)'],
        interactiveLab: {
          workspace: 'deep_learning_studio',
          label: 'Open MLP Playground & Backpropagation Studio',
          description: 'Train live neural networks with adjustable layers, learning rates, activation derivatives, and loss curves.'
        }
      },
      {
        unitCode: 'AI-3.2',
        title: 'Exact Backpropagation Calculus & Adaptive Optimizers (AdamW)',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Reverse-mode automatic differentiation, layer error propagation δ^{(l)}, matrix gradient tensor formulations, SGD with momentum, RMSProp, and Adam/AdamW.',
        detailedTopics: [
          'Automatic Differentiation: Forward vs Reverse mode autodiff, computational graphs, Jacobian-vector products (JVPs)',
          'Exact Backprop Equations: Layer error δ^{(l)} = ((W^{(l+1)})ᵀ δ^{(l+1)}) ⊙ σ\'(z^{(l)}), weight gradient ∂L/∂W = δ (aᵗ⁻¹)ᵀ',
          'Adaptive Optimizers: Momentum, Nesterov Accelerated Gradient, RMSProp variance scaling, Adam with bias correction, AdamW decoupled weight decay',
          'Learning Rate Dynamics: Warmup schedules, Cosine Annealing, loss surface saddle-point escape dynamics'
        ],
        coreCompetencies: ['Matrix tensor backpropagation calculus', 'AdamW moment update derivations', 'Autodiff graph execution'],
        recommendedTextbooks: ['Goodfellow (Deep Learning Chapter 6 & 8)', 'Paszke et al. (PyTorch: An Imperative Style, High-Performance Deep Learning Library)']
      }
    ]
  },
  {
    trackId: 'ai-track-4',
    trackNumber: 4,
    trackTitle: 'Track 4: Computer Vision, Spatial Convolutions & Visual Transformers',
    streamId: 'ai_ml',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: '2D spatial convolutions, pooling, receptive fields, ResNet skip connections, object detection (YOLO/Faster R-CNN), segmentation (U-Net), and Vision Transformers (ViT).',
    units: [
      {
        unitCode: 'AI-4.1',
        title: 'Convolutional Neural Networks (CNNs) & Residual Learning (ResNet)',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Spatial 2D convolutions, kernel weight sharing, translation equivariance, receptive field expansion, and He Kaiming identity skip connections solving deep degradation.',
        detailedTopics: [
          'Convolution Mechanics: 2D convolution, valid/same padding, stride, receptive field calculation, channel hierarchies',
          'Downsampling & Pooling: Max pooling, average pooling, strided convolutions, effective receptive field (ERF)',
          'Classical Backbones: AlexNet, VGGNet, GoogLeNet/Inception 1x1 bottlenecks',
          'Residual Learning (ResNet): Identity skip connections F(x) + x, gradient highway preservation, ResNeXt and ConvNeXt'
        ],
        coreCompetencies: ['CNN receptive field calculations', 'ResNet gradient highway proofs', 'Convolutional backprop derivations'],
        recommendedTextbooks: ['Goodfellow (Deep Learning Chapter 9)', 'Szeliski (Computer Vision: Algorithms and Applications)'],
        interactiveLab: {
          workspace: 'deep_learning_studio',
          label: 'Open CNN Feature Map Visualizer',
          description: 'Inspect live convolutional filters, feature channels, and activation maps layer by layer.'
        }
      },
      {
        unitCode: 'AI-4.2',
        title: 'Object Detection, Segmentation & Vision Transformers (ViT)',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Two-stage (Faster R-CNN) vs single-stage (YOLO) detectors, U-Net semantic segmentation, and Vision Transformer patch tokenization with self-attention.',
        detailedTopics: [
          'Object Detection: Region Proposal Networks (RPN), RoI Align, YOLO grid-based real-time bounding box prediction',
          'Semantic Segmentation: Fully Convolutional Networks (FCN), U-Net encoder-decoder skip connections, Mask R-CNN',
          'Vision Transformers (ViT): Non-overlapping patch extraction, linear projection, [CLS] token, self-attention over image patches',
          'Self-Supervised Vision: Masked Autoencoders (MAE), DINOv2 self-distillation representations'
        ],
        coreCompetencies: ['YOLO bounding box loss derivations', 'ViT patch projection math', 'U-Net segmentation architectures'],
        recommendedTextbooks: ['Dosovitskiy et al. (An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale)', 'Redmon et al. (You Only Look Once)']
      }
    ]
  },
  {
    trackId: 'ai-track-5',
    trackNumber: 5,
    trackTitle: 'Track 5: Natural Language Processing, Transformers & Foundation LLMs',
    streamId: 'ai_ml',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Scaled dot-product self-attention, Multi-Head Attention, Rotary Positional Embeddings (RoPE), autoregressive causal masking, KV caching, and scaling laws.',
    units: [
      {
        unitCode: 'AI-5.1',
        title: 'Scaled Dot-Product Attention, Multi-Head Projections & Positional Encodings',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Queries/Keys/Values routing, scaled dot-product Softmax(QKᵀ/√dₖ)V, multi-head concatenation, sinusoidal vs Rotary Position Embeddings (RoPE), and LayerNorm.',
        detailedTopics: [
          'Attention Mechanics: Query, Key, Value linear projections; Scaled dot-product Softmax temperature scaling √dₖ',
          'Multi-Head Attention: Linear sub-space projection W_q, W_k, W_v, head concatenation, output projection W_o',
          'Positional Encodings: Sinusoidal absolute encodings, Rotary Position Embeddings (RoPE) complex plane rotation, ALiBi',
          'Architectural Normalization: Pre-LN vs Post-LN stability, RMSNorm, SwiGLU feedforward activation blocks'
        ],
        coreCompetencies: ['Attention complexity derivation O(N² d)', 'RoPE rotational matrix derivations', 'Multi-head projection calculus'],
        recommendedTextbooks: ['Vaswani et al. (Attention Is All You Need)', 'Jurafsky & Martin (Speech and Language Processing, 3rd Ed)'],
        interactiveLab: {
          workspace: 'deep_learning_studio',
          label: 'Open Transformer Multi-Head Attention Lab',
          description: 'Explore live attention heatmaps, token relationships, and query-key dot products.'
        }
      },
      {
        unitCode: 'AI-5.2',
        title: 'Autoregressive Pre-Training, KV Caching & Kaplan/Chinchilla Scaling Laws',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Decoder-only autoregressive LLMs, causal triangular masking, Key-Value (KV) cache inference acceleration, cross-entropy next-token prediction, and compute-optimal scaling laws.',
        detailedTopics: [
          'Decoder-Only Architectures: Causal masking triangular matrix, next-token prediction cross-entropy loss',
          'KV Caching: Reusing past K and V projection tensors to achieve O(1) step computation in generative token decoding',
          'Scaling Laws: Kaplan et al. vs Chinchilla (Hoffmann et al.) compute-optimal tokens-to-parameters scaling N ≈ 20D',
          'Tokenization: Byte-Pair Encoding (BPE), WordPiece, Unigram tokenizers, vocabulary size tradeoffs'
        ],
        coreCompetencies: ['KV cache memory bandwidth calculations', 'Chinchilla optimal compute budget allocation', 'BPE tokenizer algorithm implementation'],
        recommendedTextbooks: ['Hoffmann et al. (Training Compute-Optimal Large Language Models - Chinchilla)', 'Kaplan et al. (Scaling Laws for Neural Language Models)']
      }
    ]
  },
  {
    trackId: 'ai-track-6',
    trackNumber: 6,
    trackTitle: 'Track 6: Generative Modeling: VAEs, Latent Diffusion & Flow Matching',
    streamId: 'ai_ml',
    educationLevel: 'doctoral',
    levelBadge: 'Level 600+: Doctoral Frontier',
    summary: 'Variational Autoencoders (VAEs), ELBO bounds, reparameterization trick, score-based diffusion models (DDPM, SGM), continuous flow matching, and latent manifolds.',
    units: [
      {
        unitCode: 'AI-6.1',
        title: 'Variational Autoencoders (VAEs), ELBO & Reparameterization Trick',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Variational inference, approximate posterior q_ϕ(z|x), Evidence Lower Bound (ELBO), KL divergence regularization, and the reparameterization trick enabling backpropagation.',
        detailedTopics: [
          'Variational Inference: Tractable approximation q_ϕ(z|x) of intractable posterior p(z|x), Jensen\'s inequality derivation of ELBO',
          'ELBO Formulation: Reconstruction loss 𝔼[log p(x|z)] - KL divergence D_KL(q(z|x) || p(z)) trade-off',
          'Reparameterization Trick: Sampling z = μ(x) + σ(x) ⊙ ε with ε ~ N(0, I) allowing backpropagation through stochastic nodes',
          'Latent Space Manifolds: Disentanglement (β-VAE), spherical interpolation (slerp), cluster topological organization'
        ],
        coreCompetencies: ['ELBO mathematical derivation', 'Reparameterization gradient backprop flow', 'KL divergence Gaussian closed-form evaluation'],
        recommendedTextbooks: ['Kingma & Welling (An Introduction to Variational Autoencoders)', 'Bishop (PRML Chapter 10)'],
        interactiveLab: {
          workspace: 'deep_learning_studio',
          label: 'Open 3D Latent Space & VAE Generative Studio',
          description: 'Orbit 3D latent space clusters and interpolate smoothly between generative data representations.'
        }
      },
      {
        unitCode: 'AI-6.2',
        title: 'Score-Based Diffusion (DDPM), SDEs & Continuous Flow Matching',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Forward Gaussian Markov noise addition, reverse U-Net score matching ∇_x log p_t(x), stochastic differential equation (SDE) formulation, and optimal transport flow matching.',
        detailedTopics: [
          'Forward Process: Variance-preserving Gaussian noise schedule q(x_t|x_0), closed-form sampling x_t = √ᾱ_t x_0 + √(1-ᾱ_t) ε',
          'Reverse Denoising: U-Net noise predictor ε_θ(x_t, t), simplified MSE loss ||ε - ε_θ(x_t, t)||²',
          'Score-Based SDEs: Song et al. reverse-time SDE formulation, Probability Flow ODE deterministic sampling',
          'Flow Matching: Continuous normalizing flows, vector velocity fields, straight optimal transport probability trajectories'
        ],
        coreCompetencies: ['DDPM noise schedule derivations', 'Reverse-time SDE formulations', 'Continuous flow matching vector field calculus'],
        recommendedTextbooks: ['Sohl-Dickstein et al. (Deep Unsupervised Learning using Nonequilibrium Thermodynamics)', 'Ho et al. (Denoising Diffusion Probabilistic Models)']
      }
    ]
  },
  {
    trackId: 'ai-track-7',
    trackNumber: 7,
    trackTitle: 'Track 7: Agentic AI, Autonomous Workflows & Post-Training Alignment',
    streamId: 'ai_ml',
    educationLevel: 'doctoral',
    levelBadge: 'Level 600+: Doctoral Frontier',
    summary: 'Reinforcement Learning from Human Feedback (RLHF), Direct Preference Optimization (DPO), Model Context Protocol (MCP), tool-use planning, and multi-agent consensus.',
    units: [
      {
        unitCode: 'AI-7.1',
        title: 'Post-Training Alignment: SFT, RLHF, DPO & Reasoning Models',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Supervised Fine-Tuning (SFT), Reward Model training, PPO reinforcement learning, Direct Preference Optimization (DPO closed-form loss), and test-time search reasoning.',
        detailedTopics: [
          'Alignment Paradigms: Instruction tuning, dataset curation, Supervised Fine-Tuning (SFT) loss',
          'RLHF with PPO: Bradley-Terry preference model, reward function training, KL penalty regularization against base policy',
          'Direct Preference Optimization (DPO): Eliminating reward models via exact analytical substitution into policy loss',
          'Frontier Reasoning Models: Chain-of-Thought (CoT), Process Reward Models (PRMs), Monte Carlo Tree Search test-time compute scaling'
        ],
        coreCompetencies: ['DPO closed-form loss mathematical derivation', 'Bradley-Terry preference log-likelihood', 'Process reward model scoring'],
        recommendedTextbooks: ['Rafailov et al. (Direct Preference Optimization)', 'Ouyang et al. (Training language models to follow instructions with human feedback - InstructGPT)']
      },
      {
        unitCode: 'AI-7.2',
        title: 'Agentic Architectures, Tool Use, Protocols (MCP) & Multi-Agent Orchestration',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'ReAct loops (Reason + Act), Model Context Protocol (MCP) tool execution, Agentic Memory (Episodic, Semantic, GraphRAG), and multi-agent supervisor/peer consensus protocols.',
        detailedTopics: [
          'Single-Agent Cognition: ReAct (Reason + Act) loop, Plan-and-Solve, function calling schemas and tool execution',
          'Model Context Protocol (MCP): Client-host-server architecture, JSON-RPC schema transport, resource/tool lazily loaded bindings',
          'Agentic Memory & Retrieval: Short-term context window caching, long-term vector memory, Knowledge Graph GraphRAG community summaries',
          'Multi-Agent Systems: Supervisor-worker orchestration, debate and consensus protocols, self-healing code execution loops'
        ],
        coreCompetencies: ['MCP JSON-RPC protocol implementation', 'ReAct agentic loop state machines', 'Multi-agent consensus orchestration'],
        recommendedTextbooks: ['Yao et al. (ReAct: Synergizing Reasoning and Acting in Language Models)', 'Anthropic (Model Context Protocol Specification)']
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 3. DATA STRUCTURES & ALGORITHMS (6 TRACKS)
  // ═════════════════════════════════════════════════════════════════════════
  {
    trackId: 'dsa-track-1',
    trackNumber: 1,
    trackTitle: 'Track 1: Linear Abstract Data Types & Memory Locality',
    streamId: 'cs_algo',
    educationLevel: 'foundations',
    levelBadge: 'Level 0 – 100: Foundations',
    summary: 'Contiguous vs node-based memory, amortized array doubling, singly/doubly linked lists, Monotonic Stacks, circular queue ring buffers, and Two-Pointer paradigms.',
    units: [
      {
        unitCode: 'DSA-1.1',
        title: 'Arrays, Dynamic Doubling & Two-Pointer Invariants',
        educationLevel: 'foundations',
        levelBadge: 'Level 0 – 100: Foundations',
        overview: 'Memory layouts, row/column-major indexing, CPU L1/L2 cache spatial locality, amortized O(1) dynamic array doubling, and Two-Pointer convergence paradigms.',
        detailedTopics: [
          'Memory Layout & Locality: Contiguous memory addressing, cache line prefetching, CPU cache friendly row-major traversals',
          'Dynamic Array Mechanics: Capacity vs size, geometric doubling reallocation proof showing amortized O(1) push_back',
          'Two-Pointer Technique: Opposite-direction convergence for sorted pair sums, partition pointers in QuickSelect',
          'Sliding Window Technique: Fixed-size vs dynamic-size window invariants, monotonic deque optimization for O(n) window maximums'
        ],
        coreCompetencies: ['Amortized analysis accounting', 'Sliding window invariant proofs', 'Spatial cache locality optimizations'],
        recommendedTextbooks: ['Thomas H. Cormen et al. (CLRS - Introduction to Algorithms, 4th Ed)', 'Sedgewick & Wayne (Algorithms, 4th Ed)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open Two-Pointers & Sliding Window Visualizer',
          description: 'Step through two-pointer and sliding window traversals with live pointer arrows.'
        }
      },
      {
        unitCode: 'DSA-1.2',
        title: 'Linked Lists, Monotonic Stacks & Circular Ring Buffers',
        educationLevel: 'foundations',
        levelBadge: 'Level 0 – 100: Foundations',
        overview: 'Singly/doubly linked lists, sentinel nodes, Floyd\'s Tortoise and Hare cycle detection, LIFO Monotonic Stacks in O(n), and circular queue ring buffers.',
        detailedTopics: [
          'Linked Lists: Sentinel head/tail nodes, in-place list reversal, fast-and-slow runner pointer cycle detection (Floyd\'s algorithm)',
          'Stacks & LIFO Mechanics: Call-stack simulation, expression parsing (Infix to Postfix Dijkstra Shunting-Yard algorithm)',
          'Monotonic Stacks: Next Greater Element in linear O(n) time, largest rectangle in histogram geometric optimization',
          'Queues & Deques: FIFO queues, ring buffer circular array indexing (head/tail modulo arithmetic), double-ended deques'
        ],
        coreCompetencies: ['Floyd\'s cycle invariant proof', 'Monotonic stack linear time proofs', 'Shunting-yard expression parsing'],
        recommendedTextbooks: ['CLRS (Chapter 10)', 'Mark Allen Weiss (Data Structures and Algorithm Analysis in C++)']
      }
    ]
  },
  {
    trackId: 'dsa-track-2',
    trackNumber: 2,
    trackTitle: 'Track 2: Asymptotic Analysis, Recurrences & Sorting Lower Bounds',
    streamId: 'cs_algo',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'Asymptotic notation (O, Ω, Θ), Master Theorem for divide-and-conquer, Merge/Quick/Heap sort invariants, and the decision-tree Ω(n log n) comparison lower bound.',
    units: [
      {
        unitCode: 'DSA-2.1',
        title: 'Asymptotic Notation, Recurrence Relations & Master Theorem',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Formal definitions of Big-O, Big-Omega, Big-Theta, substitution method, recursion trees, and the Master Theorem for divide-and-conquer recurrences.',
        detailedTopics: [
          'Asymptotic Complexity: Formal mathematical definitions of O(g(n)), Ω(g(n)), Θ(g(n)), o(g(n)), ω(g(n))',
          'Recurrence Relations: Recursion tree method, substitution proof method, Akra-Bazzi generalization',
          'Master Theorem: Three cases for T(n) = aT(n/b) + f(n), critical exponent log_b(a) comparisons',
          'Space Complexity: Auxiliary memory vs in-place memory, recursion stack depth bounds'
        ],
        coreCompetencies: ['Master theorem case proofs', 'Asymptotic limit ratio tests', 'Recursion tree cost summations'],
        recommendedTextbooks: ['CLRS (Chapters 3 & 4)', 'Kleinberg & Tardos (Algorithm Design)']
      },
      {
        unitCode: 'DSA-2.2',
        title: 'Comparison & Non-Comparison Sorting, Invariants & Lower Bound Ω(n log n)',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Merge sort divide-and-conquer, Quick sort Lomuto/Hoare partitioning, Binary Heap sort invariants, Decision-tree lower bound proof, and Radix/Counting sort.',
        detailedTopics: [
          'Merge Sort: Stable divide-and-conquer sorting, recurrence T(n) = 2T(n/2) + O(n), external merge sorting',
          'Quick Sort: In-place Lomuto vs Hoare partitioning, randomized pivot selection, O(n log n) expected vs O(n²) worst-case',
          'Heap Sort: Binary max-heap invariant A[parent(i)] ≥ A[i], sift-down in O(log n), in-place O(n log n) total sorting',
          'Comparison Lower Bound: Decision tree height theorem proving minimum Ω(n log n) comparisons for comparison-based sorting',
          'Linear-Time Sorting: Counting Sort, Radix Sort (LSD/MSD), Bucket Sort (uniform distribution assumptions)'
        ],
        coreCompetencies: ['Decision-tree lower bound mathematical proof', 'Heap sift-down invariant maintenance', 'Quick sort partition proofs'],
        recommendedTextbooks: ['CLRS (Chapters 6, 7, 8 & 9)', 'Robert Sedgewick (Algorithms, 4th Ed)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open Sorting Visualizer & Step Tracer',
          description: 'Step through sorting algorithms with live array bar swapping, comparisons, and multi-language code tabs.'
        }
      }
    ]
  },
  {
    trackId: 'dsa-track-3',
    trackNumber: 3,
    trackTitle: 'Track 3: Hierarchical Structures & Self-Balancing Trees',
    streamId: 'cs_algo',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'Binary Search Trees (BST), in-order traversal monotonicity, balance factor bf, and self-balancing AVL rotations (LL, RR, LR, RL) guaranteeing O(log n) height.',
    units: [
      {
        unitCode: 'DSA-3.1',
        title: 'Binary Search Trees (BST) & In-Order Monotonicity',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'BST property, recursive search, predecessor/successor extraction, node deletion with two children (in-order successor swap), and tree traversals (Pre/In/Post/Level).',
        detailedTopics: [
          'BST Invariant: Left subtree keys < root key < right subtree keys, in-order monotonicity property',
          'Basic Operations: Search, insertion, min/max, predecessor and successor in O(h) time',
          'Deletion Algorithm: Deleting leaf nodes, single-child nodes, and two-child nodes via in-order successor swap',
          'Tree Traversals: Pre-order, In-order, Post-order recursion; Morris in-order traversal with O(1) auxiliary space'
        ],
        coreCompetencies: ['In-order traversal monotonicity proofs', 'Two-child deletion pointer restructuring', 'Morris traversal thread pointers'],
        recommendedTextbooks: ['CLRS (Chapter 12)', 'Weiss (Data Structures and Algorithm Analysis in C++)']
      },
      {
        unitCode: 'DSA-3.2',
        title: 'Self-Balancing AVL Trees & Height-Restoring Rotations',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Balance factor bf = h_L - h_R ∈ {-1, 0, +1}, Single Right/Left rotations, Double Left-Right / Right-Left rotations, and Fibonacci tree height bound proof.',
        detailedTopics: [
          'AVL Balance Invariant: Balance factor bf(v) = height(left) - height(right) ∈ {-1, 0, +1} at all nodes',
          'Single Rotations: Left-Left (LL) Right Rotation, Right-Right (RR) Left Rotation restoring O(1) local balance',
          'Double Rotations: Left-Right (LR) Double Rotation, Right-Left (RL) Double Rotation',
          'Maximum AVL Height: Fibonacci minimal node tree relation N(h) = N(h-1) + N(h-2) + 1, proving height h < 1.44 log₂(n + 2)',
          'Red-Black Trees Overview: 5 Red-Black invariants, black height, 2-3-4 tree isomorphism'
        ],
        coreCompetencies: ['AVL rotation pointer swaps', 'Fibonacci minimal node height bound proof', 'Red-Black invariant verification'],
        recommendedTextbooks: ['CLRS (Chapter 13)', 'Sedgewick (Left-Leaning Red-Black Trees)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open Trees & AVL Rotations Interactive Lab',
          description: 'Insert and delete nodes in live visual AVL trees and watch self-balancing rotations execute step-by-step.'
        }
      }
    ]
  },
  {
    trackId: 'dsa-track-4',
    trackNumber: 4,
    trackTitle: 'Track 4: Graph Topologies, Traversals & Shortest Path Optimization',
    streamId: 'cs_algo',
    educationLevel: 'undergraduate',
    levelBadge: 'Level 200 – 300: Undergraduate',
    summary: 'Adjacency representations, BFS/DFS, cycle detection, topological sorting (Kahn\'s algorithm), Dijkstra shortest path with min-heaps, and Kruskal/Prim MST.',
    units: [
      {
        unitCode: 'DSA-4.1',
        title: 'Graph Traversals (BFS/DFS), Edge Classification & Topological Sort',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Adjacency list vs matrix tradeoffs, BFS shortest path on unweighted graphs, DFS entry/exit timestamps, edge classification (tree/back/forward/cross), and Kahn\'s DAG topological sort.',
        detailedTopics: [
          'Graph Representations: Adjacency list vs adjacency matrix, space-time tradeoffs, forward/reverse star representation',
          'Breadth-First Search (BFS): Wavefront queue expansion, unweighted shortest paths, bipartite graph 2-coloring',
          'Depth-First Search (DFS): Discovery/finish timestamps, edge classification (tree, back, forward, cross edges), cycle detection',
          'Directed Acyclic Graphs (DAGs): Topological sorting via DFS finish times and Kahn\'s in-degree queue algorithm',
          'Connectivity: Strongly Connected Components (SCC), Kosaraju\'s two-pass DFS algorithm, Tarjan\'s low-link algorithm'
        ],
        coreCompetencies: ['Tarjan low-link SCC derivations', 'Kahn\'s topological sort DAG validation', 'DFS edge classification proofs'],
        recommendedTextbooks: ['CLRS (Chapter 22)', 'Kleinberg & Tardos (Algorithm Design Chapter 3)']
      },
      {
        unitCode: 'DSA-4.2',
        title: 'Shortest Path Algorithms (Dijkstra, Bellman-Ford) & Minimum Spanning Trees',
        educationLevel: 'undergraduate',
        levelBadge: 'Level 200 – 300: Undergraduate',
        overview: 'Greedy edge relaxation, Dijkstra with binary/Fibonacci heaps in O((V + E) log V), Bellman-Ford negative edge cycle detection, and Kruskal/Prim MST.',
        detailedTopics: [
          'Dijkstra\'s Algorithm: Non-negative edge weights, min-heap priority queue, triangle inequality invariant d[v] ≤ d[u] + w(u, v)',
          'Bellman-Ford Algorithm: General edge weights, dynamic programming edge relaxation across V-1 passes, negative cycle detection',
          'All-Pairs Shortest Path: Floyd-Warshall dynamic programming algorithm in O(V³), Johnson\'s reweighting algorithm',
          'Minimum Spanning Trees: Cut property, cycle property, Kruskal\'s with Disjoint Set Union (DSU / Union-Find with rank & path compression), Prim\'s algorithm'
        ],
        coreCompetencies: ['Dijkstra correctness proof via greedy non-negative substructure', 'Union-Find path compression amortized analysis α(n)', 'Cut property proofs for MST'],
        recommendedTextbooks: ['CLRS (Chapters 23, 24 & 25)', 'Dasgupta, Papadimitriou, Vazirani (Algorithms)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open Graph Traversals & Dijkstra Shortest Path Studio',
          description: 'Step through BFS wavefronts, DFS recursion trees, and Dijkstra edge relaxations on interactive graph topologies.'
        }
      }
    ]
  },
  {
    trackId: 'dsa-track-5',
    trackNumber: 5,
    trackTitle: 'Track 5: Dynamic Programming, Memoization & Recurrence Grids',
    streamId: 'cs_algo',
    educationLevel: 'postgraduate',
    levelBadge: 'Level 400 – 500: Postgraduate',
    summary: 'Principle of Optimality, overlapping subproblems, top-down memoization vs bottom-up tabulation, 0/1 Knapsack, Longest Common Subsequence (LCS), and Interval/Bitmask DP.',
    units: [
      {
        unitCode: 'DSA-5.1',
        title: 'Foundations of DP: 0/1 Knapsack, LCS & Space Optimization',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Optimal substructure, overlapping subproblem DAGs, 0/1 Knapsack 2D grid vs 1D reverse rolling buffer, and Longest Common Subsequence back-pointer string reconstruction.',
        detailedTopics: [
          'DP Characterization: Optimal substructure, overlapping subproblems, state space formulation, DAG topological dependency',
          '0/1 Knapsack Problem: State definition dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i), 2D grid filling, 1D reverse rolling buffer space optimization',
          'Longest Common Subsequence (LCS): Match vs mismatch state transitions, 2D matrix back-pointer string reconstruction',
          'Longest Increasing Subsequence (LIS): O(n²) DP vs O(n log n) patience sorting with binary search',
          'Coin Change & Unbounded Knapsack: 1D forward rolling array transitions'
        ],
        coreCompetencies: ['DP state-transition mathematical formulations', '1D rolling array space optimization', 'Patience sorting LIS binary search'],
        recommendedTextbooks: ['CLRS (Chapter 15)', 'Dasgupta, Papadimitriou, Vazirani (Algorithms Chapter 6)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open Dynamic Programming 2D Grid Visualizer',
          description: 'Watch the 2D DP memoization grid fill cell-by-cell with real-time value propagation and reconstruction.'
        }
      },
      {
        unitCode: 'DSA-5.2',
        title: 'Advanced DP: Interval DP, Tree DP, Bitmask DP & Digit DP',
        educationLevel: 'postgraduate',
        levelBadge: 'Level 400 – 500: Postgraduate',
        overview: 'Matrix Chain Multiplication interval DP, Tree diameter/independent set DP, Traveling Salesperson Problem (TSP) bitmask state compression in O(n² 2ⁿ), and Digit DP.',
        detailedTopics: [
          'Interval DP: Matrix Chain Multiplication dp[i][j] = min_k (dp[i][k] + dp[k+1][j] + d_{i-1}d_k d_j), optimal parenthesization, Burst Balloons',
          'Tree Dynamic Programming: Subtree state aggregation, tree diameter, Maximum Weight Independent Set on trees',
          'Bitmask Dynamic Programming: State compression using integer bitmasks, Traveling Salesperson Problem (TSP) in O(n² 2ⁿ) time vs O(n!) brute-force',
          'Digit Dynamic Programming: Counting numbers with specific digit properties under upper bound constraints'
        ],
        coreCompetencies: ['Interval DP boundary conditions', 'Bitmask state transition bitwise math', 'Tree DP post-order traversal updates'],
        recommendedTextbooks: ['CLRS (Chapter 15)', 'Steven Halim (Competitive Programming 4)']
      }
    ]
  },
  {
    trackId: 'dsa-track-6',
    trackNumber: 6,
    trackTitle: 'Track 6: Computational Complexity, P vs NP & Karp Polynomial Reductions',
    streamId: 'cs_algo',
    educationLevel: 'doctoral',
    levelBadge: 'Level 600+: Doctoral Frontier',
    summary: 'Turing machines, class P and class NP, polynomial-time verifiers, Cook-Levin theorem (SAT NP-completeness), and Karp\'s 21 NP-complete problem reduction chains.',
    units: [
      {
        unitCode: 'DSA-6.1',
        title: 'Turing Machines, Class P, Class NP & Polynomial-Time Verification',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Deterministic vs Non-Deterministic Turing Machines, time and space complexity classes, polynomial-time certifiers, and co-NP / NP-Hard classifications.',
        detailedTopics: [
          'Turing Machine Foundations: Deterministic Turing Machines (DTM), Nondeterministic Turing Machines (NTM), deciders vs recognizers',
          'Complexity Classes: Class P (polynomial-time solvable), Class NP (polynomial-time verifiable via certificates)',
          'Polynomial-Time Verification: Certificate relation R(x, y), language L ∈ NP iff polynomial certifier V exists',
          'Class co-NP & NP-Hard: Complement languages, tautologies, relationship between P, NP, and co-NP'
        ],
        coreCompetencies: ['Polynomial-time verification proofs', 'Turing machine configuration transitions', 'Certificate size bound derivations'],
        recommendedTextbooks: ['Michael Sipser (Introduction to the Theory of Computation, 3rd Ed)', 'Arora & Barak (Computational Complexity: A Modern Approach)']
      },
      {
        unitCode: 'DSA-6.2',
        title: 'Cook-Levin Theorem, Karp Reductions & Approximation Algorithms',
        educationLevel: 'doctoral',
        levelBadge: 'Level 600+: Doctoral Frontier',
        overview: 'Boolean Satisfiability (SAT), Cook-Levin Circuit-SAT theorem, polynomial-time Karp reductions (3-SAT ≤_P Clique ≤_P Vertex Cover), and approximation algorithms.',
        detailedTopics: [
          'Cook-Levin Theorem: Circuit-SAT and Boolean Satisfiability (SAT) are NP-Complete via tableau Turing machine encoding',
          'Karp\'s Reduction Paradigm: Language reduction A ≤_P B, reduction transitivity, proving NP-Completeness',
          'Standard Reduction Chain: Circuit-SAT → 3-SAT → Clique → Vertex Cover → Set Cover → Subset Sum → 0/1 Knapsack Decision',
          'Approximation Algorithms: Approximation ratio, 2-approximation for Vertex Cover, PTAS and FPTAS for Knapsack'
        ],
        coreCompetencies: ['Polynomial-time Karp reduction proofs', 'NP-Completeness proof construction', 'Approximation factor bounds'],
        recommendedTextbooks: ['Sipser (Theory of Computation Chapter 7 & 8)', 'Garey & Johnson (Computers and Intractability: A Guide to the Theory of NP-Completeness)'],
        interactiveLab: {
          workspace: 'dsa_lab',
          label: 'Open N-Queens Backtracking & Complexity Studio',
          description: 'Interact with recursive state-space tree pruning and backtracking search animations.'
        }
      }
    ]
  }
];
