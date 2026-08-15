/**
 * Add Predicted Model Paper Sets A & B for Computer Networks (MDS-302)
 * Writes into src/data/examPrepData.json under computer_networks["set-a"] and ["set-b"]
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'examPrepData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// ──────────────────────────────────────────────
// SET A — MODEL QUESTION PAPER
// ──────────────────────────────────────────────
data.computer_networks['set-a'] = `
<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">🎯 PREDICTED MODEL PAPER – SET A (High-Probability Baseline Focus)</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">OU STYLE</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
      <strong>Faculty of Science</strong> — Osmania University | M.Sc. (CBCS) III-Semester Examination |
      <strong>Code No:</strong> MDS-302 |
      <strong>Subject:</strong> COMPUTER NETWORKS (Paper - II) |
      <strong>Time:</strong> 2 ½ Hrs |
      <strong>Max. Marks:</strong> 70
    </p>

    <h5 style="color: #e2e8f0; margin: 1rem 0 0.5rem; font-size: 0.95rem; border-bottom: 1px solid rgba(56,189,248,0.2); padding-bottom: 0.25rem;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(56,189,248,0.12); color: #7dd3fc; margin-bottom: 0.5rem;">SHORT ANSWER</span>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Attempt / Answer ALL Questions. Each question carries 2 Marks.</p>
    <ol style="margin-left: 1.5rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <li>List the layers of the OSI reference model along with the primary responsibility of each layer. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li>Differentiate between Pure ALOHA and Slotted ALOHA with respect to channel efficiency and maximum throughput. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li>State the purpose of the SYN, ACK, and FIN control flags in a TCP segment. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
      <li>Define the terms Subnet Mask and CIDR notation with a suitable example. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - II]</span></li>
      <li>Differentiate between FTP control connection and FTP data connection. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
    </ol>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 class="unit-title" style="color: #818cf8;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129,140,248,0.15); color: #a5b4fc;">ESSAY QUESTIONS</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Attempt / Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</p>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 6:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit I – Application & Analysis]</span><br>
      (a) Compare and contrast the <strong>OSI Reference Model</strong> and the <strong>TCP/IP Reference Model</strong> in detail, highlighting architectural philosophies, layering principles, and service interfaces.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Formulate and analyze the working mechanism of <strong>Sliding Window Protocols</strong>. Compare the performance, window size constraints, and retransmission mechanisms of <strong>Go-Back-N ARQ</strong> and <strong>Selective Repeat ARQ</strong> under noisy channel conditions.
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 7:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit II – Analysis & Evaluation]</span><br>
      (a) Formulate and trace the <strong>Shortest Path Routing using Dijkstra's Algorithm</strong> for a given network graph to determine the least-cost path tree from a designated source router to all other nodes.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Evaluate <strong>Distance Vector Routing</strong> and <strong>Link State Routing</strong> algorithms. Analyze both protocols with respect to convergence time, routing metric computation, memory overhead, and resilience against routing loops (including the Count-to-Infinity problem).
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 8:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit III – Application & Synthesis]</span><br>
      (a) Model and synthesize the <strong>TCP Connection Management</strong> life cycle. Illustrate the complete state transition diagram for the <strong>Three-Way Handshake</strong> connection establishment and the four-step graceful connection release.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Synthesize the operational mechanisms of <strong>TCP Congestion Control</strong>. Analyze in detail how <strong>Slow Start</strong>, <strong>Congestion Avoidance</strong>, <strong>Fast Retransmit</strong>, and <strong>Fast Recovery</strong> dynamically regulate the congestion window (cwnd).
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 9:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed: Unit I / Unit II]</span><br>
      (a) [Unit I] Analyze the <strong>Cyclic Redundancy Check (CRC)</strong> error detection mechanism. Demonstrate the mathematical process of frame generation at the transmitter and error verification at the receiver using a given data polynomial and generator polynomial.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) [Unit II] Evaluate <strong>IPv4 and IPv6</strong> header architectures. Analyze the major field modifications introduced in IPv6 and explain the transition mechanisms (<strong>Dual-Stack</strong> and <strong>Tunneling</strong>) used during network migration.
    </div>

    <div style="margin-bottom: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 10:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed: Unit II / Unit III]</span><br>
      (a) [Unit II] Analyze network interconnecting devices across protocol layers. Detail the functional and operational differences among <strong>Hubs, Multiport Bridges, Layer-2 Switches, Layer-3 Switches, Routers</strong>, and <strong>Application Gateways</strong>.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) [Unit III] Analyze the <strong>Domain Name System (DNS)</strong> architecture. Explain the hierarchical namespace, the roles of Root, TLD, and Authoritative servers, and evaluate the differences between <strong>Iterative</strong> and <strong>Recursive</strong> query resolution.
    </div>
  </div>
</div>
`;

// ──────────────────────────────────────────────
// SET B — MODEL QUESTION PAPER
// ──────────────────────────────────────────────
data.computer_networks['set-b'] = `
<div class="unit-box unit-cyan">
  <div class="unit-header-bar">
    <h4 class="unit-title" style="color: #38bdf8;">🎯 PREDICTED MODEL PAPER – SET B (Alternative Combination Focus)</h4>
    <span class="unit-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">OU STYLE</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
      <strong>Faculty of Science</strong> — Osmania University | M.Sc. (CBCS) III-Semester Examination |
      <strong>Code No:</strong> MDS-302 |
      <strong>Subject:</strong> COMPUTER NETWORKS (Paper - II) |
      <strong>Time:</strong> 2 ½ Hrs |
      <strong>Max. Marks:</strong> 70
    </p>

    <h5 style="color: #e2e8f0; margin: 1rem 0 0.5rem; font-size: 0.95rem; border-bottom: 1px solid rgba(56,189,248,0.2); padding-bottom: 0.25rem;">PART – A: Fundamental Concepts (5 × 2 = 10 Marks)</h5>
    <span class="unit-badge" style="background: rgba(56,189,248,0.12); color: #7dd3fc; margin-bottom: 0.5rem;">SHORT ANSWER</span>
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Attempt / Answer ALL Questions. Each question carries 2 Marks.</p>
    <ol style="margin-left: 1.5rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <li>Explain the purpose of framing in the Data Link Layer and list two character-oriented framing methods. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li>What is 1-persistent CSMA, and how does it handle channel contention? <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - I]</span></li>
      <li>List the fields contained in a standard User Datagram Protocol (UDP) header. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
      <li>State the operational difference between the Address Resolution Protocol (ARP) and the Dynamic Host Configuration Protocol (DHCP). <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - II]</span></li>
      <li>Explain why SSH is preferred over TELNET for remote terminal access. <span style="color: #38bdf8; font-size: 0.8rem;">[Unit - III]</span></li>
    </ol>
  </div>
</div>

<div class="unit-box unit-indigo">
  <div class="unit-header-bar">
    <h5 class="unit-title" style="color: #818cf8;">PART – B: Higher-Order Thinking Skills (5 × 12 = 60 Marks)</h5>
    <span class="unit-badge" style="background: rgba(129,140,248,0.15); color: #a5b4fc;">ESSAY QUESTIONS</span>
  </div>
  <div class="unit-content">
    <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">NOTE: Attempt / Answer ALL Questions. Each question carries 12 Marks (Internal Choice).</p>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 6:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit I – Application & Analysis]</span><br>
      (a) Classify and analyze <strong>Guided Transmission Media</strong> (Twisted Pair Cable, Coaxial Cable, and Fiber Optic Cable) with respect to physical construction, signal propagation modes, transmission bandwidth, and practical network scenarios.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Analyze <strong>Switching Techniques</strong> in communication networks: Compare <strong>Circuit Switching</strong>, <strong>Message Switching</strong>, and <strong>Packet Switching</strong> (distinguishing between Datagram and Virtual Circuit approaches) with respect to setup latency, resource dedication, and fault tolerance.
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 7:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit II – Analysis & Evaluation]</span><br>
      (a) Evaluate the <strong>Carrier Sense Multiple Access with Collision Detection (CSMA/CD)</strong> protocol. Analyze its operation, collision detection criteria, minimum frame size constraint, and the <strong>Binary Exponential Backoff</strong> algorithm.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Analyze and evaluate <strong>Congestion Control Algorithms</strong> at the Network Layer: Compare the open-loop <strong>Leaky Bucket</strong> traffic shaping mechanism with the <strong>Token Bucket</strong> mechanism under bursty transmission conditions.
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 8:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Unit III – Application & Synthesis]</span><br>
      (a) Synthesize the <strong>TCP Segment Header</strong> architecture. Detail the structural layout, function of each field, the role of 32-bit sequence/acknowledgment numbers, and the dynamic window advertisement mechanism.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) Synthesize the architecture and transport requirements of <strong>Real-Time Multimedia Communication</strong>. Analyze the operation of the <strong>Real-Time Transport Protocol (RTP)</strong> and evaluate how it functions alongside UDP for streaming applications.
    </div>

    <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 9:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed: Unit I / Unit II]</span><br>
      (a) [Unit I] Analyze <strong>Data Link Layer Design Issues</strong>. Formulate the operational principles of <strong>Stop-and-Wait ARQ</strong> and evaluate its channel efficiency in long-delay, high-bandwidth networks.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) [Unit II] Analyze the operation of <strong>Internet Control Protocols</strong>. Detail the functional mechanics, packet exchange formats, and error/query reporting mechanisms of <strong>ICMP</strong>, <strong>ARP</strong>, and <strong>DHCP</strong>.
    </div>

    <div style="margin-bottom: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.7;">
      <strong style="color: #e2e8f0;">Question 10:</strong> <span style="color: #818cf8; font-size: 0.78rem;">[Mixed: Unit II / Unit III]</span><br>
      (a) [Unit II] Evaluate <strong>Classless Inter-Domain Routing (CIDR)</strong> and IP addressing schemes. Analyze how CIDR solves routing table explosion through route aggregation (supernetting) and perform subnet prefix calculations for given address blocks.
      <br><span style="color: #f43f5e; font-weight: 600;">(OR)</span><br>
      (b) [Unit III] Synthesize <strong>Application Layer Protocols</strong>: Analyze Electronic Mail Architecture by detailing the roles and message transfer mechanisms of <strong>SMTP</strong>, <strong>POP3</strong>, and <strong>IMAP</strong>.
    </div>
  </div>
</div>
`;

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Predicted Model Paper Sets (Set A & Set B) successfully added for Computer Networks (MDS-302)!');
