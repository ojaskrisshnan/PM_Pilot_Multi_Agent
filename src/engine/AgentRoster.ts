import type { AgentId, AgentDefinition } from '../types/project';

export const ALL_17_AGENTS: Record<AgentId, AgentDefinition> = {
  ProductManagerAgent: {
    id: 'ProductManagerAgent',
    name: 'Product Manager Agent',
    role: 'Central SDLC Orchestrator & Strategy Lead',
    systemPrompt: `You are the ProductManagerAgent, the central orchestrator of the PMPilot multi-agent SDLC ecosystem. Your responsibility is to translate executive vision into a coherent milestone schedule, align domain agents, enforce Standard Operating Procedures (SOPs), and manage execution flow through structured JSON events.`,
    inputArtifacts: ['Project Charter', 'Executive Prompt'],
    outputArtifacts: ['Master SDLC Roadmap', 'Milestone Schedule', 'Execution Directives'],
    tools: ['create_roadmap', 'assign_milestone', 'dispatch_agent_signal', 'evaluate_phase_gates'],
    dependencies: [],
    approvalRequired: false,
    canRunParallel: false,
    phaseOrder: 1,
    typicalDurationDays: 2
  },

  RequirementAgent: {
    id: 'RequirementAgent',
    name: 'Requirement Engineering Agent',
    role: 'Functional & Non-Functional Specification Architect',
    systemPrompt: `You are the RequirementAgent. You specialize in requirement elicitation, domain boundary definition, MoSCoW prioritization, and creating rigorous acceptance criteria adhering to industry standards (IEEE 830 / ISO/IEC/IEEE 29148).`,
    inputArtifacts: ['Master SDLC Roadmap'],
    outputArtifacts: ['FR/NFR Specification', 'Scope Boundary Document', 'Stakeholder Personas'],
    tools: ['elicit_requirements', 'prioritize_moscow', 'validate_scope_boundaries'],
    dependencies: ['ProductManagerAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 2,
    typicalDurationDays: 3
  },

  BusinessAnalystAgent: {
    id: 'BusinessAnalystAgent',
    name: 'Business Analyst Agent',
    role: 'User Story Decomposer & Backlog Architect',
    systemPrompt: `You are the BusinessAnalystAgent. You decompose high-level requirements into agile epics, user stories, Gherkin acceptance criteria (Given/When/Then), and assign Fibonacci story points.`,
    inputArtifacts: ['FR/NFR Specification'],
    outputArtifacts: ['Sprint Backlog', 'User Story Inventory', 'Agile Estimation Matrix'],
    tools: ['decompose_into_epics', 'estimate_story_points', 'generate_gherkin_criteria'],
    dependencies: ['RequirementAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 3,
    typicalDurationDays: 2
  },

  UIUXAgent: {
    id: 'UIUXAgent',
    name: 'UI/UX Design Systems Agent',
    role: 'Interface Architect & Experience Designer',
    systemPrompt: `You are the UIUXAgent. You formulate human-centered design tokens, responsive layout hierarchies, accessibility standards (WCAG 2.1 AA), and modern Tailwind CSS component specifications.`,
    inputArtifacts: ['User Story Inventory', 'Stakeholder Personas'],
    outputArtifacts: ['Design Token Schema', 'Component Wireframes', 'Interaction Prototypes'],
    tools: ['generate_design_tokens', 'verify_wcag_contrast', 'synthesize_layout_wireframes'],
    dependencies: ['BusinessAnalystAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 4,
    typicalDurationDays: 3
  },

  ArchitectureAgent: {
    id: 'ArchitectureAgent',
    name: 'System Architecture Agent',
    role: 'Microservices & Distributed Systems Architect',
    systemPrompt: `You are the ArchitectureAgent. You design high-throughput microservices topologies, data-flow pipelines, caching strategies, and document architectural decisions via formal Architectural Decision Records (ADRs).`,
    inputArtifacts: ['FR/NFR Specification', 'Design Token Schema'],
    outputArtifacts: ['ADR-001-Architecture.md', 'System Topology Diagram', 'Data Flow Specification'],
    tools: ['design_topology', 'formulate_adr', 'calculate_throughput_capacity'],
    dependencies: ['RequirementAgent', 'BusinessAnalystAgent'],
    approvalRequired: true, // Human-in-the-loop checkpoint!
    canRunParallel: false,
    phaseOrder: 5,
    typicalDurationDays: 4
  },

  FrontendAgent: {
    id: 'FrontendAgent',
    name: 'Frontend Engineering Agent',
    role: 'Client-Side SPA & Component Developer',
    systemPrompt: `You are the FrontendAgent. You synthesize production-grade TypeScript React components, state management stores, and responsive UI implementations utilizing modern best practices.`,
    inputArtifacts: ['Design Token Schema', 'ADR-001-Architecture.md'],
    outputArtifacts: ['EventDashboard.tsx', 'Client State Store', 'UI Component Manifest'],
    tools: ['generate_react_component', 'lint_jsx_syntax', 'validate_responsive_breakpoints'],
    dependencies: ['ArchitectureAgent', 'UIUXAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 6,
    typicalDurationDays: 4
  },

  BackendAgent: {
    id: 'BackendAgent',
    name: 'Backend Engineering Agent',
    role: 'API, Service & Database Architect',
    systemPrompt: `You are the BackendAgent. You implement robust RESTful & GraphQL endpoints, SQL schema migrations, transaction locks, and atomic business logic optimized for low latency and high concurrency.`,
    inputArtifacts: ['ADR-001-Architecture.md', 'User Story Inventory'],
    outputArtifacts: ['server.ts', 'schema.sql', 'Service Controllers'],
    tools: ['generate_express_routes', 'build_database_schema', 'inject_atomic_transactions'],
    dependencies: ['ArchitectureAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 6,
    typicalDurationDays: 4
  },

  QAAgent: {
    id: 'QAAgent',
    name: 'Quality Assurance Agent',
    role: 'Test Automation & Verification Engineer',
    systemPrompt: `You are the QAAgent. You synthesize end-to-end integration test suites, unit tests, and performance load tests (e.g. 5,000 RPS simulations) using Vitest, Playwright, and Locust.`,
    inputArtifacts: ['server.ts', 'EventDashboard.tsx', 'User Story Inventory'],
    outputArtifacts: ['e2e.test.ts', 'Test Coverage Report', 'Load Testing Script'],
    tools: ['generate_vitest_specs', 'simulate_load_concurrency', 'audit_code_coverage'],
    dependencies: ['BackendAgent', 'FrontendAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 7,
    typicalDurationDays: 3
  },

  DevOpsAgent: {
    id: 'DevOpsAgent',
    name: 'DevOps & Cloud Infrastructure Agent',
    role: 'Containerization & CI/CD Pipeline Architect',
    systemPrompt: `You are the DevOpsAgent. You architect multi-stage Docker container builds, Docker Compose orchestration, Kubernetes Helm manifests, and GitHub Actions automated deployment pipelines.`,
    inputArtifacts: ['server.ts', 'ADR-001-Architecture.md'],
    outputArtifacts: ['Dockerfile', 'docker-compose.yml', 'k8s-manifest.yaml', 'CI/CD Workflow'],
    tools: ['lint_dockerfile', 'generate_k8s_manifests', 'build_cicd_pipeline'],
    dependencies: ['BackendAgent', 'ArchitectureAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 7,
    typicalDurationDays: 3
  },

  SecurityAgent: {
    id: 'SecurityAgent',
    name: 'Cybersecurity & Compliance Agent',
    role: 'STRIDE Threat Modeler & OWASP Auditor',
    systemPrompt: `You are the SecurityAgent. You perform STRIDE threat modeling, OWASP Top 10 vulnerability assessments, secret scanning, and regulatory compliance audits (PCI-DSS, HIPAA, GDPR).`,
    inputArtifacts: ['ADR-001-Architecture.md', 'server.ts', 'Dockerfile'],
    outputArtifacts: ['stride_threat_model.json', 'Security Audit Report', 'Compliance Checklist'],
    tools: ['run_stride_threat_modeling', 'audit_owasp_vulnerabilities', 'verify_pci_dss_controls'],
    dependencies: ['BackendAgent', 'DevOpsAgent'],
    approvalRequired: true, // Human-in-the-loop checkpoint!
    canRunParallel: false,
    phaseOrder: 8,
    typicalDurationDays: 3
  },

  DocumentationAgent: {
    id: 'DocumentationAgent',
    name: 'Technical Documentation Agent',
    role: 'API Specifications & Developer Guide Author',
    systemPrompt: `You are the DocumentationAgent. You formulate OpenAPI 3.0 specs, system architecture guides, runbooks, and developer README files with clear deployment instructions.`,
    inputArtifacts: ['server.ts', 'ADR-001-Architecture.md', 'Dockerfile'],
    outputArtifacts: ['openapi.json', 'README.md', 'Developer Runbook'],
    tools: ['generate_openapi_spec', 'synthesize_readme', 'validate_swagger_compliance'],
    dependencies: ['BackendAgent', 'DevOpsAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 9,
    typicalDurationDays: 2
  },

  MarketingAgent: {
    id: 'MarketingAgent',
    name: 'Product Marketing & Growth Agent',
    role: 'GTM Strategy & Customer Acquisition Lead',
    systemPrompt: `You are the MarketingAgent. You construct Go-To-Market (GTM) blueprints, value proposition messaging, user acquisition funnels, and launch communication strategies.`,
    inputArtifacts: ['Project Charter', 'Stakeholder Personas'],
    outputArtifacts: ['GTM Launch Blueprint', 'Target Demographic Analysis', 'Product Positioning Matrix'],
    tools: ['calculate_tam_sam_som', 'generate_launch_funnel', 'position_value_prop'],
    dependencies: ['ProductManagerAgent', 'RequirementAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 9,
    typicalDurationDays: 2
  },

  FinanceAgent: {
    id: 'FinanceAgent',
    name: 'Financial Modeling & TCO Agent',
    role: 'Budget Controller & ROI Analyst',
    systemPrompt: `You are the FinanceAgent. You calculate Total Cost of Ownership (TCO), monthly cloud infrastructure run-rates, blended engineering capital expenditures, break-even timelines, and 3-year ROI forecasts.`,
    inputArtifacts: ['ADR-001-Architecture.md', 'Dockerfile', 'Master SDLC Roadmap'],
    outputArtifacts: ['TCO Financial Model', 'Cloud Cost Run-Rate', '3-Year ROI Forecast'],
    tools: ['calculate_tco', 'project_roi', 'estimate_cloud_tier_costs'],
    dependencies: ['ArchitectureAgent', 'DevOpsAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 10,
    typicalDurationDays: 2
  },

  RiskAgent: {
    id: 'RiskAgent',
    name: 'Risk Governance & Mitigation Agent',
    role: '5x5 Risk Matrix & Contingency Strategist',
    systemPrompt: `You are the RiskAgent. You evaluate project risks across Technical, Operational, Financial, and Schedule dimensions, placing them onto a deterministic 5x5 Likelihood vs Impact matrix and defining mitigation strategies.`,
    inputArtifacts: ['ADR-001-Architecture.md', 'stride_threat_model.json', 'TCO Financial Model'],
    outputArtifacts: ['Risk Register', '5x5 Risk Heatmap', 'Contingency Protocol'],
    tools: ['build_risk_matrix', 'evaluate_contingency_buffer', 'assign_risk_owners'],
    dependencies: ['ArchitectureAgent', 'SecurityAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 10,
    typicalDurationDays: 2
  },

  CommunicationAgent: {
    id: 'CommunicationAgent',
    name: 'Inter-Agent Communication Agent',
    role: 'Message Broker & Event Dispatch Logger',
    systemPrompt: `You are the CommunicationAgent. You validate structured JSON message contracts, log inter-agent events, verify message schemas, and ensure reliable asynchronous message delivery across the 17 agents.`,
    inputArtifacts: ['All Agent Messages'],
    outputArtifacts: ['Structured Event Audit Log', 'Message Bus Metrics'],
    tools: ['validate_json_schema', 'broadcast_event', 'audit_message_latency'],
    dependencies: ['ProductManagerAgent'],
    approvalRequired: false,
    canRunParallel: true,
    phaseOrder: 11,
    typicalDurationDays: 1
  },

  StakeholderAgent: {
    id: 'StakeholderAgent',
    name: 'Executive Stakeholder Agent',
    role: 'Executive Sign-Off & Governance Gatekeeper',
    systemPrompt: `You are the StakeholderAgent. You represent executive leadership, tracking milestone velocity, assessing compliance with corporate KPIs, and authorizing final production release.`,
    inputArtifacts: ['Master SDLC Roadmap', 'stride_threat_model.json', 'TCO Financial Model', 'Test Coverage Report'],
    outputArtifacts: ['Executive Release Authorization', 'Milestone Review Brief'],
    tools: ['validate_kpis', 'authorize_release', 'audit_executive_governance'],
    dependencies: ['SecurityAgent', 'QAAgent', 'FinanceAgent'],
    approvalRequired: false,
    canRunParallel: false,
    phaseOrder: 12,
    typicalDurationDays: 1
  },

  AnalyticsAgent: {
    id: 'AnalyticsAgent',
    name: 'Analytics & Product Health Agent',
    role: 'KPI Synthesizer & Health Score Indexer',
    systemPrompt: `You are the AnalyticsAgent. You compute the holistic Product Health Score (0-100), combining architecture consistency, security audits, test coverage, risk density, and budget variance into an executive KPI index.`,
    inputArtifacts: ['All Agent Deliverables', 'Risk Register', 'Test Coverage Report'],
    outputArtifacts: ['97/100 Product Health Scorecard', 'Executive KPI Radar'],
    tools: ['compute_health_score', 'aggregate_quality_metrics', 'generate_kpi_radar'],
    dependencies: ['StakeholderAgent', 'RiskAgent', 'QAAgent'],
    approvalRequired: false,
    canRunParallel: false,
    phaseOrder: 13,
    typicalDurationDays: 1
  }
};

export const AGENT_ORDER_LIST: AgentId[] = [
  'ProductManagerAgent',
  'RequirementAgent',
  'BusinessAnalystAgent',
  'UIUXAgent',
  'ArchitectureAgent',
  'FrontendAgent',
  'BackendAgent',
  'QAAgent',
  'DevOpsAgent',
  'SecurityAgent',
  'DocumentationAgent',
  'MarketingAgent',
  'FinanceAgent',
  'RiskAgent',
  'CommunicationAgent',
  'StakeholderAgent',
  'AnalyticsAgent'
];
