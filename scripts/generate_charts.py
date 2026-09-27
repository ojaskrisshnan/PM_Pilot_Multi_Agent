import os
import matplotlib.pyplot as plt
import numpy as np

os.makedirs('scripts/figures', exist_ok=True)
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8

# 1. Figure 1: Workflow diagram
fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
ax.axis('off')
boxes = [
    ("Executive\nPrompt", 0.06, 0.5, "#4338ca", "white"),
    ("ProductManager\nAgent", 0.22, 0.5, "#6366f1", "white"),
    ("Shared\nProjectState", 0.42, 0.8, "#0f766e", "white"),
    ("16 Domain\nAgents", 0.42, 0.2, "#0369a1", "white"),
    ("Human Governance\nGate (HITL)", 0.64, 0.5, "#b45309", "white"),
    ("Hybrid LLM\nRouter", 0.84, 0.8, "#7c3aed", "white"),
    ("Synthesized\nSDLC Deliverables", 0.84, 0.2, "#047857", "white")
]
for text, x, y, bg, fg in boxes:
    ax.text(x, y, text, ha='center', va='center', color=fg, weight='bold', fontsize=9,
            bbox=dict(boxstyle="round,pad=0.6", facecolor=bg, edgecolor='#1e293b', lw=1.5))

arrows = [
    (0.12, 0.5, 0.16, 0.5),
    (0.28, 0.58, 0.35, 0.74),
    (0.28, 0.42, 0.35, 0.26),
    (0.42, 0.70, 0.42, 0.32),
    (0.49, 0.24, 0.57, 0.44),
    (0.49, 0.76, 0.57, 0.56),
    (0.71, 0.56, 0.77, 0.74),
    (0.71, 0.44, 0.77, 0.26)
]
for x1, y1, x2, y2 in arrows:
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", lw=1.8, color="#334155"))

ax.set_title("PMPilot: Event-Driven Multi-Agent SDLC Orchestration Architecture", fontsize=12, weight='bold', pad=15)
plt.tight_layout()
plt.savefig('scripts/figures/fig1_workflow.png')
plt.close()

# 2. Figure 2: Health Scores Across Test Cases
fig, ax = plt.subplots(figsize=(7, 4.2), dpi=300)
cases = ['TC1: Student Task App', 'TC2: E-Commerce Platform', 'TC3: BCI Telemetry Hub']
scores = [97.4, 98.2, 96.8]
bars = ax.bar(cases, scores, color=['#4f46e5', '#06b6d4', '#10b981'], width=0.45, edgecolor='#1e1b4b', lw=1.2)
ax.set_ylim(85, 102)
ax.set_ylabel('Product Health Score (0 - 100)', fontsize=10, weight='bold')
ax.set_title('PMPilot Product Health Index Across Empirical Test Cases', fontsize=11, weight='bold')
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, yval + 0.6, f'{yval:.1f} / 100', ha='center', va='bottom', fontsize=9, weight='bold')
ax.grid(axis='y', linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig2_health_scores.png')
plt.close()

# 3. Figure 3: Comparative Evaluation Score of PMPilot vs State-of-the-Art
fig, ax = plt.subplots(figsize=(8, 4.2), dpi=300)
systems = ['PMPilot\n(Our Work)', 'MetaGPT\n(ICLR 2024)', 'ChatDev\n(ACL 2024)', 'SALLMA\n(SATrends 25)', 'AutoGen\n(MS 2023)']
scores = [97.5, 88.4, 84.1, 82.0, 79.6]
colors = ['#4338ca', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']
bars = ax.bar(systems, scores, color=colors, width=0.55, edgecolor='#1e293b', lw=1.2)
ax.set_ylim(60, 105)
ax.set_ylabel('Composite SDLC Benchmark Index (%)', fontsize=10, weight='bold')
ax.set_title('Comparative Benchmark: PMPilot vs. Existing Multi-Agent Frameworks', fontsize=11, weight='bold')
for bar in bars:
    y = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, y + 1.0, f'{y:.1f}%', ha='center', va='bottom', fontsize=9, weight='bold')
ax.grid(axis='y', linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig3_comparative_score.png')
plt.close()

# 4. Figure 4: Response Latency Comparison (Local vs Cloud vs Hybrid)
fig, ax = plt.subplots(figsize=(7.5, 4.2), dpi=300)
x = np.arange(3)
width = 0.25
cases = ['TC1 (Task App)', 'TC2 (E-Comm)', 'TC3 (BCI Telemetry)']
local = [58, 64, 62]
cloud = [460, 510, 480]
hybrid = [70, 78, 74]

ax.bar(x - width, local, width, label='Local Mode (Ollama 8B)', color='#10b981', edgecolor='#064e3b')
ax.bar(x, cloud, width, label='Cloud API (Gemini/OpenAI)', color='#f59e0b', edgecolor='#78350f')
ax.bar(x + width, hybrid, width, label='Hybrid Router (PMPilot)', color='#6366f1', edgecolor='#312e81')

ax.set_ylabel('P99 Turnaround Latency (ms)', fontsize=10, weight='bold')
ax.set_title('Response Latency Comparison Across Execution Modes', fontsize=11, weight='bold')
ax.set_xticks(x)
ax.set_xticklabels(cases, weight='bold')
ax.legend(frameon=True, facecolor='white', framealpha=0.9)
ax.grid(axis='y', linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig4_latency.png')
plt.close()

# 5. Figure 5: Cost & Financial Runway Savings
fig, ax = plt.subplots(figsize=(7, 4.2), dpi=300)
runs = np.array([1, 10, 50, 100, 250, 500])
cloud_cost = runs * 0.42
local_cost = runs * 0.00
hybrid_cost = runs * 0.035

ax.plot(runs, cloud_cost, 'o--', color='#ef4444', lw=2, label='Cloud API Only ($0.42/run)')
ax.plot(runs, hybrid_cost, 's-', color='#3b82f6', lw=2, label='PMPilot Hybrid ($0.035/run)')
ax.plot(runs, local_cost, '^-', color='#10b981', lw=2.5, label='PMPilot Local Ollama ($0.00/run)')

ax.set_xlabel('Cumulative Full SDLC Orchestration Runs', fontsize=10, weight='bold')
ax.set_ylabel('Inference Cost (USD $)', fontsize=10, weight='bold')
ax.set_title('Financial Runway & Cumulative Token Cost Economy', fontsize=11, weight='bold')
ax.legend(frameon=True)
ax.grid(True, linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig5_cost_economy.png')
plt.close()

# 6. Figure 6: Command Center Interface Mockup
fig, ax = plt.subplots(figsize=(8, 4.2), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.axis('off')
ax.text(0.04, 0.88, "PMPilot Command Center & Master SDLC Cockpit", color='white', fontsize=12, weight='bold')
ax.text(0.04, 0.80, "Status: RUNNING | Active Phase: 5/17 (ArchitectureAgent) | Mode: HYBRID (74ms)", color='#38bdf8', fontsize=8, family='monospace')

# Status cards
cards = [
    ("Health Score", "97 / 100", 0.04, 0.48, "#1e293b", "#34d399"),
    ("Critical Path", "28 Days", 0.28, 0.48, "#1e293b", "#a78bfa"),
    ("MVP Budget", "$18,400", 0.52, 0.48, "#1e293b", "#38bdf8"),
    ("OWASP Audit", "96% Pass", 0.76, 0.48, "#1e293b", "#fbbf24")
]
for title, val, x, y, bg, fg in cards:
    ax.text(x + 0.1, y + 0.12, title, color='#94a3b8', fontsize=7, weight='bold', ha='center')
    ax.text(x + 0.1, y + 0.02, val, color=fg, fontsize=12, weight='bold', ha='center',
            bbox=dict(boxstyle="square,pad=0.5", facecolor=bg, edgecolor='#334155', lw=1))

ax.text(0.04, 0.22, "Active Execution Stream:", color='#cbd5e1', fontsize=8, weight='bold')
ax.text(0.04, 0.10, "▶ EVT-104: ArchitectureAgent synthesized ADR-001 relational schema and composite indexing\n▶ EVT-105: HITL Checkpoint triggered; awaiting Project Manager sign-off before dispatching BackendAgent", color='#94a3b8', fontsize=7, family='monospace')

plt.tight_layout()
plt.savefig('scripts/figures/fig6_command_center.png')
plt.close()

# 7. Figure 7: Human Governance Gate Checkpoint Review
fig, ax = plt.subplots(figsize=(8, 4.4), dpi=300)
ax.set_facecolor('#0b0f19')
fig.patch.set_facecolor('#0b0f19')
ax.axis('off')
ax.text(0.5, 0.90, "HUMAN-IN-THE-LOOP GOVERNANCE GATE", color='#f59e0b', fontsize=11, weight='bold', ha='center',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='#451a03', edgecolor='#d97706', lw=1.2))
ax.text(0.5, 0.78, "Architecture Checkpoint Review (Submitted by ArchitectureAgent)", color='white', fontsize=10, weight='bold', ha='center')
ax.text(0.08, 0.62, "Synthesis Summary: Authorize Student Task Relational Schema & JWT State Strategy (ADR-001)", color='#e2e8f0', fontsize=8)
ax.text(0.08, 0.48, "Recommendations:\n• Confirm composite index on (user_id, status, deadline) for instantaneous task filtering\n• Verify timezone offset serialization for international student submissions", color='#86efac', fontsize=7.5)
ax.text(0.08, 0.28, "Flagged Risks:\n• Potential deadline misalignment if UTC conversions are not applied client-side", color='#fca5a5', fontsize=7.5)
ax.text(0.08, 0.14, "Affected Artifacts: ADR-001-architecture.md, schema.sql", color='#93c5fd', fontsize=7.5, family='monospace')

# Action buttons
ax.text(0.35, 0.04, "[ Request Re-evaluation ]", color='#fda4af', fontsize=7.5, weight='bold', ha='center',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='#881337', edgecolor='#f43f5e', lw=1))
ax.text(0.72, 0.04, "[ Approve & Dispatch Next Phase ]", color='white', fontsize=7.5, weight='bold', ha='center',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='#065f46', edgecolor='#10b981', lw=1))

plt.tight_layout()
plt.savefig('scripts/figures/fig7_governance_gate.png')
plt.close()

# 8. Figure 8: Radar Chart of 17 Agent Competencies
fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True), dpi=300)
categories = ['Autonomy', 'Code Quality', 'Security Rigor', 'Domain Alignment', 'Latency Speed', 'Cost Efficiency']
N = len(categories)
angles = [n / float(N) * 2 * np.pi for n in range(N)]
angles += angles[:1]

values_pmpilot = [96, 95, 98, 97, 92, 99]
values_pmpilot += values_pmpilot[:1]

values_metagpt = [84, 88, 70, 85, 62, 58]
values_metagpt += values_metagpt[:1]

ax.plot(angles, values_pmpilot, linewidth=2, linestyle='solid', label='PMPilot (17 Agents)', color='#4f46e5')
ax.fill(angles, values_pmpilot, '#4f46e5', alpha=0.25)

ax.plot(angles, values_metagpt, linewidth=1.5, linestyle='dashed', label='MetaGPT (5 Roles)', color='#64748b')
ax.fill(angles, values_metagpt, '#64748b', alpha=0.1)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(categories, fontsize=8, weight='bold')
ax.set_ylim(0, 100)
ax.set_title("17-Agent Collective Capability Radar", fontsize=11, weight='bold', pad=20)
ax.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1), fontsize=8)
plt.tight_layout()
plt.savefig('scripts/figures/fig8_capability_radar.png')
plt.close()

# 9. Figure 9: Security & Threat Modeling Matrix
fig, ax = plt.subplots(figsize=(7, 4.2), dpi=300)
threats = ['Spoofing (Bcrypt)', 'Tampering (HMAC)', 'Repudiation (Audit)', 'Info Disclosure (mTLS)', 'DoS (Rate Limit)', 'Elevation of Priv (RBAC)']
scores = [100, 98, 95, 96, 92, 97]
colors = ['#10b981' if s >= 95 else '#3b82f6' for s in scores]
bars = ax.barh(threats, scores, color=colors, height=0.5, edgecolor='#1e293b')
ax.set_xlim(80, 103)
ax.set_xlabel('Automated Audit Compliance Rate (%)', fontsize=9, weight='bold')
ax.set_title('STRIDE Threat Modeling & OWASP Top 10 Audit Verification', fontsize=11, weight='bold')
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.5, bar.get_y() + bar.get_height()/2.0, f'{w}%', va='center', fontsize=8, weight='bold')
ax.grid(axis='x', linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig9_security_audit.png')
plt.close()

# 10. Figure 10: 28-Day Critical Path Timeline Breakdown
fig, ax = plt.subplots(figsize=(8, 3.8), dpi=300)
milestones = [
    ("M1: Auth & Baseline", 0, 4, "#6366f1"),
    ("M2: Relational DB & CRUD", 4, 5, "#3b82f6"),
    ("M3: Client Dashboard & UI", 9, 8, "#06b6d4"),
    ("M4: Cron & Alert Worker", 17, 6, "#10b981"),
    ("M5: E2E Tests & Launch", 23, 5, "#f59e0b")
]
for i, (name, start, dur, col) in enumerate(milestones):
    ax.barh(name, dur, left=start, color=col, height=0.45, edgecolor='#1e293b')
    ax.text(start + dur/2.0, i, f'{dur}d', ha='center', va='center', color='white', weight='bold', fontsize=8)

ax.set_xlabel('Project Schedule (Days)', fontsize=9, weight='bold')
ax.set_xlim(0, 30)
ax.set_title('28-Day Critical Path Milestone & Dependency Schedule', fontsize=11, weight='bold')
ax.grid(axis='x', linestyle='--', alpha=0.4)
plt.tight_layout()
plt.savefig('scripts/figures/fig10_gantt_schedule.png')
plt.close()

print("All 10 figures generated successfully!")
