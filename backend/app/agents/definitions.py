from dataclasses import dataclass, field
from typing import Optional

@dataclass
class AgentDefinition:
    id: str
    name: str
    role: str
    phase_order: int
    system_prompt: str
    dependencies: list[str] = field(default_factory=list)
    input_artifacts: list[str] = field(default_factory=list)
    output_artifacts: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    approval_required: bool = False
    typical_duration_days: int = 2

ALL_17_AGENTS: dict[str, AgentDefinition] = {
    "ProductManagerAgent": AgentDefinition(
        id="ProductManagerAgent",
        name="Product Manager Agent",
        role="Central SDLC Orchestrator & Strategy Lead",
        phase_order=1,
        system_prompt=(
            "You are ProductManagerAgent, the central orchestrator of the PMPilot multi-agent SDLC ecosystem. "
            "Your responsibility is to translate executive vision into a milestone schedule, decompose epics, "
            "and output structured JSON containing summary, findings, recommendations, and deliverables."
        ),
        dependencies=[],
        input_artifacts=["Project Charter", "Executive Prompt"],
        output_artifacts=["Master SDLC Roadmap.md", "Milestone Schedule"],
        tools=["create_roadmap", "assign_milestone", "dispatch_agent_signal"],
        approval_required=False,
        typical_duration_days=2
    ),

    "RequirementAgent": AgentDefinition(
        id="RequirementAgent",
        name="Requirement Engineering Agent",
        role="Functional & Non-Functional Specification Architect",
        phase_order=2,
        system_prompt=(
            "You are RequirementAgent. You specialize in requirement elicitation, domain boundary definition, "
            "MoSCoW prioritization, and creating rigorous acceptance criteria adhering to IEEE 830 standards."
        ),
        dependencies=["ProductManagerAgent"],
        input_artifacts=["Master SDLC Roadmap.md"],
        output_artifacts=["FR_NFR_Specification.md", "Scope Boundary Document"],
        tools=["elicit_requirements", "prioritize_moscow", "validate_scope_boundaries"],
        approval_required=False,
        typical_duration_days=3
    ),

    "BusinessAnalystAgent": AgentDefinition(
        id="BusinessAnalystAgent",
        name="Business Analyst Agent",
        role="User Story Decomposer & Backlog Architect",
        phase_order=3,
        system_prompt=(
            "You are BusinessAnalystAgent. You decompose high-level requirements into agile epics, user stories, "
            "Gherkin acceptance criteria (Given/When/Then), and assign Fibonacci story points."
        ),
        dependencies=["RequirementAgent"],
        input_artifacts=["FR_NFR_Specification.md"],
        output_artifacts=["Sprint_Backlog.json", "User Story Inventory"],
        tools=["decompose_into_epics", "estimate_story_points", "generate_gherkin_criteria"],
        approval_required=False,
        typical_duration_days=2
    ),

    "UIUXAgent": AgentDefinition(
        id="UIUXAgent",
        name="UI/UX Design Systems Agent",
        role="Interface Architect & Experience Designer",
        phase_order=4,
        system_prompt=(
            "You are UIUXAgent. You formulate human-centered design tokens, responsive layout hierarchies, "
            "accessibility standards (WCAG 2.1 AA), and modern Tailwind CSS component specifications."
        ),
        dependencies=["BusinessAnalystAgent"],
        input_artifacts=["User Story Inventory"],
        output_artifacts=["design_tokens.json", "Component Wireframes"],
        tools=["generate_design_tokens", "verify_wcag_contrast", "synthesize_layout_wireframes"],
        approval_required=False,
        typical_duration_days=3
    ),

    "ArchitectureAgent": AgentDefinition(
        id="ArchitectureAgent",
        name="System Architecture Agent",
        role="Microservices & Distributed Systems Architect",
        phase_order=5,
        system_prompt=(
            "You are ArchitectureAgent. You design high-throughput microservices topologies, data-flow pipelines, "
            "caching strategies, and document architectural decisions via formal Architectural Decision Records (ADRs)."
        ),
        dependencies=["RequirementAgent", "BusinessAnalystAgent"],
        input_artifacts=["FR_NFR_Specification.md", "design_tokens.json"],
        output_artifacts=["ADR-001-Architecture.md", "System Topology Diagram"],
        tools=["design_topology", "formulate_adr", "calculate_throughput_capacity"],
        approval_required=True,
        typical_duration_days=4
    ),

    "FrontendAgent": AgentDefinition(
        id="FrontendAgent",
        name="Frontend Engineering Agent",
        role="Client-Side SPA & Component Developer",
        phase_order=6,
        system_prompt=(
            "You are FrontendAgent. You synthesize production-grade TypeScript React components, state management stores, "
            "and responsive UI implementations utilizing modern best practices."
        ),
        dependencies=["ArchitectureAgent", "UIUXAgent"],
        input_artifacts=["design_tokens.json", "ADR-001-Architecture.md"],
        output_artifacts=["ApiClient.ts", "UI Component Manifest"],
        tools=["generate_react_component", "lint_jsx_syntax", "validate_responsive_breakpoints"],
        approval_required=False,
        typical_duration_days=4
    ),

    "BackendAgent": AgentDefinition(
        id="BackendAgent",
        name="Backend Engineering Agent",
        role="API, Service & Database Architect",
        phase_order=6,
        system_prompt=(
            "You are BackendAgent. You implement robust RESTful & GraphQL endpoints, SQL schema migrations, "
            "transaction locks, and atomic business logic optimized for low latency and high concurrency."
        ),
        dependencies=["ArchitectureAgent"],
        input_artifacts=["ADR-001-Architecture.md", "User Story Inventory"],
        output_artifacts=["schema.sql", "server.ts", "Service Controllers"],
        tools=["generate_express_routes", "build_database_schema", "inject_atomic_transactions"],
        approval_required=False,
        typical_duration_days=4
    ),

    "QAAgent": AgentDefinition(
        id="QAAgent",
        name="Quality Assurance Agent",
        role="Test Automation & Verification Engineer",
        phase_order=7,
        system_prompt=(
            "You are QAAgent. You synthesize end-to-end integration test suites, unit tests, and performance "
            "load tests (e.g. 5,000 RPS simulations) using Vitest, Playwright, and pytest."
        ),
        dependencies=["BackendAgent", "FrontendAgent"],
        input_artifacts=["schema.sql", "ApiClient.ts"],
        output_artifacts=["test_suite.py", "Test Coverage Report"],
        tools=["generate_vitest_specs", "simulate_load_concurrency", "audit_code_coverage"],
        approval_required=False,
        typical_duration_days=3
    ),

    "DevOpsAgent": AgentDefinition(
        id="DevOpsAgent",
        name="DevOps & Cloud Infrastructure Agent",
        role="Containerization & CI/CD Pipeline Architect",
        phase_order=7,
        system_prompt=(
            "You are DevOpsAgent. You architect multi-stage Docker container builds, Docker Compose orchestration, "
            "Kubernetes manifests, and GitHub Actions automated deployment pipelines."
        ),
        dependencies=["BackendAgent", "ArchitectureAgent"],
        input_artifacts=["schema.sql", "ADR-001-Architecture.md"],
        output_artifacts=["docker-compose.yml", "Dockerfile", "k8s-manifest.yaml"],
        tools=["lint_dockerfile", "generate_k8s_manifests", "build_cicd_pipeline"],
        approval_required=False,
        typical_duration_days=3
    ),

    "SecurityAgent": AgentDefinition(
        id="SecurityAgent",
        name="Cybersecurity & Compliance Agent",
        role="STRIDE Threat Modeler & OWASP Auditor",
        phase_order=8,
        system_prompt=(
            "You are SecurityAgent. You perform STRIDE threat modeling, OWASP Top 10 vulnerability assessments, "
            "secret scanning, and regulatory compliance audits (PCI-DSS, HIPAA, GDPR)."
        ),
        dependencies=["BackendAgent", "DevOpsAgent"],
        input_artifacts=["ADR-001-Architecture.md", "schema.sql", "docker-compose.yml"],
        output_artifacts=["stride_threat_model.json", "Security Audit Report"],
        tools=["run_stride_threat_modeling", "audit_owasp_vulnerabilities", "verify_pci_dss_controls"],
        approval_required=True,
        typical_duration_days=3
    ),

    "DocumentationAgent": AgentDefinition(
        id="DocumentationAgent",
        name="Technical Documentation Agent",
        role="API Specifications & Developer Guide Author",
        phase_order=9,
        system_prompt=(
            "You are DocumentationAgent. You formulate OpenAPI 3.0 specs, system architecture guides, runbooks, "
            "and developer README files with clear deployment instructions."
        ),
        dependencies=["BackendAgent", "DevOpsAgent"],
        input_artifacts=["schema.sql", "ADR-001-Architecture.md"],
        output_artifacts=["API_Documentation.md", "OpenAPI Specification"],
        tools=["generate_openapi_spec", "synthesize_readme", "validate_swagger_compliance"],
        approval_required=False,
        typical_duration_days=2
    ),

    "MarketingAgent": AgentDefinition(
        id="MarketingAgent",
        name="Product Marketing & Growth Agent",
        role="GTM Strategy & Customer Acquisition Lead",
        phase_order=9,
        system_prompt=(
            "You are MarketingAgent. You construct Go-To-Market (GTM) blueprints, value proposition messaging, "
            "user acquisition funnels, and launch communication strategies."
        ),
        dependencies=["ProductManagerAgent", "RequirementAgent"],
        input_artifacts=["Master SDLC Roadmap.md", "FR_NFR_Specification.md"],
        output_artifacts=["GTM_Launch_Blueprint.md", "Product Positioning Matrix"],
        tools=["calculate_tam_sam_som", "generate_launch_funnel", "position_value_prop"],
        approval_required=False,
        typical_duration_days=2
    ),

    "FinanceAgent": AgentDefinition(
        id="FinanceAgent",
        name="Financial Modeling & TCO Agent",
        role="Budget Controller & ROI Analyst",
        phase_order=10,
        system_prompt=(
            "You are FinanceAgent. You calculate Total Cost of Ownership (TCO), monthly cloud infrastructure "
            "run-rates, blended engineering capital expenditures, break-even timelines, and 3-year ROI forecasts."
        ),
        dependencies=["ArchitectureAgent", "DevOpsAgent"],
        input_artifacts=["ADR-001-Architecture.md", "docker-compose.yml"],
        output_artifacts=["TCO_Financial_Model.json", "3-Year ROI Forecast"],
        tools=["calculate_tco", "project_roi", "estimate_cloud_tier_costs"],
        approval_required=False,
        typical_duration_days=2
    ),

    "RiskAgent": AgentDefinition(
        id="RiskAgent",
        name="Risk Governance & Mitigation Agent",
        role="5x5 Risk Matrix & Contingency Strategist",
        phase_order=10,
        system_prompt=(
            "You are RiskAgent. You evaluate project risks across Technical, Operational, Financial, and Schedule "
            "dimensions, placing them onto a deterministic 5x5 matrix and defining mitigation strategies."
        ),
        dependencies=["ArchitectureAgent", "SecurityAgent"],
        input_artifacts=["ADR-001-Architecture.md", "stride_threat_model.json"],
        output_artifacts=["Risk_Matrix.json", "Contingency Protocol"],
        tools=["build_risk_matrix", "evaluate_contingency_buffer", "assign_risk_owners"],
        approval_required=False,
        typical_duration_days=2
    ),

    "CommunicationAgent": AgentDefinition(
        id="CommunicationAgent",
        name="Inter-Agent Communication Agent",
        role="Message Broker & Event Dispatch Logger",
        phase_order=11,
        system_prompt=(
            "You are CommunicationAgent. You validate structured JSON message contracts, log inter-agent events, "
            "verify message schemas, and ensure reliable asynchronous message delivery across the 17 agents."
        ),
        dependencies=["ProductManagerAgent"],
        input_artifacts=["All Agent Messages"],
        output_artifacts=["Event_Audit_Log.json", "Message Bus Metrics"],
        tools=["validate_json_schema", "broadcast_event", "audit_message_latency"],
        approval_required=False,
        typical_duration_days=1
    ),

    "StakeholderAgent": AgentDefinition(
        id="StakeholderAgent",
        name="Executive Stakeholder Agent",
        role="Executive Sign-Off & Governance Gatekeeper",
        phase_order=12,
        system_prompt=(
            "You are StakeholderAgent. You represent executive leadership, tracking milestone velocity, "
            "assessing compliance with corporate KPIs, and authorizing final production release."
        ),
        dependencies=["SecurityAgent", "QAAgent", "FinanceAgent"],
        input_artifacts=["stride_threat_model.json", "TCO_Financial_Model.json", "test_suite.py"],
        output_artifacts=["Executive_Release_Authorization.md"],
        tools=["validate_kpis", "authorize_release", "audit_executive_governance"],
        approval_required=False,
        typical_duration_days=1
    ),

    "AnalyticsAgent": AgentDefinition(
        id="AnalyticsAgent",
        name="Analytics & Product Health Agent",
        role="KPI Synthesizer & Health Score Indexer",
        phase_order=13,
        system_prompt=(
            "You are AnalyticsAgent. You compute the holistic Product Health Score (0-100), combining architecture "
            "consistency, security audits, test coverage, risk density, and budget variance into an executive KPI index."
        ),
        dependencies=["StakeholderAgent", "RiskAgent", "QAAgent"],
        input_artifacts=["All Agent Deliverables", "Risk_Matrix.json"],
        output_artifacts=["Product_Health_Scorecard.json", "Executive KPI Radar"],
        tools=["compute_health_score", "aggregate_quality_metrics", "generate_kpi_radar"],
        approval_required=False,
        typical_duration_days=1
    )
}

AGENT_EXECUTION_ORDER: list[str] = [
    "ProductManagerAgent",
    "RequirementAgent",
    "BusinessAnalystAgent",
    "UIUXAgent",
    "ArchitectureAgent",
    "FrontendAgent",
    "BackendAgent",
    "QAAgent",
    "DevOpsAgent",
    "SecurityAgent",
    "DocumentationAgent",
    "MarketingAgent",
    "FinanceAgent",
    "RiskAgent",
    "CommunicationAgent",
    "StakeholderAgent",
    "AnalyticsAgent"
]
