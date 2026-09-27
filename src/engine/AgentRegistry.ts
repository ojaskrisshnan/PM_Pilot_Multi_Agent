import type { AgentId, AgentMetadata } from '../types/agent';

export const AGENT_ROSTER: Record<AgentId, AgentMetadata> = {
  ProductManagerAgent: {
    id: 'ProductManagerAgent',
    name: 'Product Manager Agent',
    role: 'Lead Orchestrator & SDLC Product Strategist',
    responsibilities: [
      'Receive project concepts and synthesize vision into high-level roadmap',
      'Decompose features into Sprints, Epics, and User Stories',
      'Orchestrate 16 specialized domain agents and validate JSON payloads',
      'Resolve conflicting requirements across architecture, security, and finance',
      'Calculate project timelines, critical paths, and effort estimates',
      'Predict delivery risks and project health metrics',
      'Generate executive summaries and product health dashboards'
    ],
    inputs: ['User Project Prompt', 'Domain Agent Outputs', 'Shared Memory State'],
    outputs: ['Product Requirements Document (PRD)', 'Sprint Backlog', 'Executive Report', 'Orchestration Matrix'],
    constraints: ['Must wait for mandatory dependencies before dispatching downstream agents', 'Enforce strict JSON schema validation'],
    metrics: ['100% agent synthesis completion', 'Zero conflicting requirements', 'On-time delivery index > 95%'],
    protocol: 'REST/JSON Event Bus, Async Request-Response with Status Polling',
    toolsContent: [
      { name: 'create_roadmap', description: 'Generates high level roadmap and milestones from project prompt.' },
      { name: 'dispatch_agent', description: 'Triggers specialized agent with task context.' },
      { name: 'aggregate_executive_report', description: 'Synthesizes outputs from all 16 agents into final report.' }
    ],
    schemaContent: {
      type: "object",
      properties: {
        agent: { type: "string", const: "ProductManagerAgent" },
        status: { type: "string" },
        summary: { type: "string" }
      }
    }
  },
  RequirementAgent: {
    id: 'RequirementAgent',
    name: 'Requirement Engineering Agent',
    role: 'Requirements Analyst & Scope Specifier',
    responsibilities: [
      'Elicit functional and non-functional requirements from user prompt',
      'Define user personas, user stories, acceptance criteria, and edge cases',
      'Identify scope boundaries and out-of-scope features'
    ],
    inputs: ['Project Vision', 'Market Context'],
    outputs: ['Detailed Functional Requirements', 'User Personas', 'Acceptance Criteria Matrix'],
    constraints: ['All stories must follow INVEST criteria', 'Clear out-of-scope demarcation'],
    metrics: ['100% story acceptance coverage', 'Zero ambiguous requirements'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'extract_user_stories', description: 'Breaks down project prompt into user stories.' }
    ]
  },
  BusinessAnalystAgent: {
    id: 'BusinessAnalystAgent',
    name: 'Business Analyst Agent',
    role: 'Market & Feasibility Analyst',
    responsibilities: [
      'Conduct market analysis, competitive intelligence, and TAM/SAM evaluation',
      'Define monetization strategy, pricing models, and ROI projections',
      'Map business workflows and value stream diagrams'
    ],
    inputs: ['Requirements', 'Industry Domain'],
    outputs: ['Market Feasibility Study', 'Pricing Matrix', 'ROI Projections'],
    constraints: ['Rely on verified industry benchmark data'],
    metrics: ['ROI accuracy range ±10%', 'Clear TAM/SAM sizing'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'evaluate_tam_sam', description: 'Calculates TAM, SAM, and SOM metrics.' }
    ]
  },
  UIUXAgent: {
    id: 'UIUXAgent',
    name: 'UI/UX Design Agent',
    role: 'User Experience & Visual Interface Architect',
    responsibilities: [
      'Map user journeys, wireframe schemas, and interaction models',
      'Create component design tokens, accessibility standards (WCAG 2.1 AA)',
      'Design design system layout guidelines and interactive prototypes'
    ],
    inputs: ['User Personas', 'User Stories'],
    outputs: ['User Journey Maps', 'Design System Tokens', 'Wireframe Component Tree'],
    constraints: ['WCAG 2.1 AA contrast compliance', 'Mobile-first responsive grids'],
    metrics: ['100% accessibility compliance score'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'generate_wireframe_tree', description: 'Generates UI component hierarchy and design tokens.' }
    ]
  },
  ArchitectureAgent: {
    id: 'ArchitectureAgent',
    name: 'System Architecture Agent',
    role: 'Enterprise Software & Cloud Architect',
    responsibilities: [
      'Design system architecture (Microservices vs Serverless vs Modular Monolith)',
      'Define database schemas, ER diagrams, caching strategies, and API gateways',
      'Publish Architectural Decision Records (ADRs) and scalability models'
    ],
    inputs: ['Functional Requirements', 'Non-Functional Scale Requirements'],
    outputs: ['System Topology Diagram Specs', 'Database Schema', 'ADRs', 'Tech Stack Matrix'],
    constraints: ['Sub-100ms API response SLA', '99.99% availability design'],
    metrics: ['Zero single point of failure', '99.99% uptime blueprint'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'design_system_topology', description: 'Outputs architecture specs and microservices diagram.' }
    ]
  },
  FrontendAgent: {
    id: 'FrontendAgent',
    name: 'Frontend Engineering Agent',
    role: 'Client Application Architect',
    responsibilities: [
      'Define frontend tech stack (React/Vite/Next.js/TypeScript)',
      'Draft page routing, client state management, dynamic data fetching hooks',
      'Specify responsive layout blueprints and bundle optimization strategies'
    ],
    inputs: ['Wireframe Component Tree', 'API Specifications'],
    outputs: ['Frontend Architecture Plan', 'State Management Model', 'Page Routing Schema'],
    constraints: ['Lighthouse Performance score > 90', 'First Contentful Paint < 1.2s'],
    metrics: ['Component reuse rate > 80%'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'plan_frontend_stack', description: 'Structures client app state and routes.' }
    ]
  },
  BackendAgent: {
    id: 'BackendAgent',
    name: 'Backend Engineering Agent',
    role: 'API & Data Services Engineer',
    responsibilities: [
      'Design OpenAPI 3.0 REST & GraphQL API specifications',
      'Define database migrations, ORM entities, authentication middleware',
      'Specify event queues (Kafka/RabbitMQ) and background workers'
    ],
    inputs: ['Architecture Specs', 'Database Schema'],
    outputs: ['OpenAPI 3.0 Spec', 'Data Models', 'Authentication Flow'],
    constraints: ['RESTful standard compliance', 'JWT/OAuth2 RBAC enforcement'],
    metrics: ['API test coverage > 90%', 'Mean latency < 45ms'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'generate_openapi_spec', description: 'Builds OpenAPI specification for REST endpoints.' }
    ]
  },
  QAAgent: {
    id: 'QAAgent',
    name: 'Quality Assurance Agent',
    role: 'Test Automation & Quality Strategist',
    responsibilities: [
      'Formulate master test plan (Unit, Integration, E2E, Load, Chaos)',
      'Create test case repository with automated test scripts',
      'Define code coverage thresholds and quality gate rules'
    ],
    inputs: ['User Stories', 'Acceptance Criteria', 'OpenAPI Spec'],
    outputs: ['Master Test Plan', 'Test Case Suites', 'Quality Gate Checklist'],
    constraints: ['Minimum 85% statement coverage required for build pass'],
    metrics: ['100% critical path test automation'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'build_test_suite', description: 'Generates unit and E2E test suites.' }
    ]
  },
  DevOpsAgent: {
    id: 'DevOpsAgent',
    name: 'DevOps & Infrastructure Agent',
    role: 'Cloud Infrastructure & CI/CD Pipeline Specialist',
    responsibilities: [
      'Design Terraform/IaC scripts for AWS/GCP/Azure infrastructure',
      'Define Kubernetes deployment manifests and Helm charts',
      'Establish CI/CD build pipelines (GitHub Actions/GitLab CI) with zero-downtime blue/green deployments'
    ],
    inputs: ['Architecture Specs', 'Backend/Frontend Tech Stack'],
    outputs: ['CI/CD Pipeline Spec', 'Terraform IaC Blueprint', 'K8s Deployment Spec'],
    constraints: ['Zero-downtime deployment strategy', 'Automated rollback triggers'],
    metrics: ['Deployment velocity < 10 mins', 'MTTR < 15 mins'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'generate_cicd_pipeline', description: 'Creates CI/CD YAML configuration.' }
    ]
  },
  SecurityAgent: {
    id: 'SecurityAgent',
    name: 'Cybersecurity & Compliance Agent',
    role: 'Security Auditor & Compliance Officer',
    responsibilities: [
      'Perform threat modeling (STRIDE/PASTA) and SAST/DAST rule definitions',
      'Audit OWASP Top 10 vulnerabilities and data encryption standards (AES-256/TLS 1.3)',
      'Ensure regulatory compliance (GDPR, HIPAA, SOC2 Type II, PCI-DSS)'
    ],
    inputs: ['Architecture Specs', 'Backend OpenAPI Spec', 'Data Flow Diagram'],
    outputs: ['Security Audit Report', 'Threat Matrix', 'Compliance Roadmap (SOC2/GDPR)'],
    constraints: ['Zero Critical or High vulnerabilities allowed at launch'],
    metrics: ['100% OWASP compliance checklist coverage'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'audit_threat_model', description: 'Runs STRIDE threat analysis on architecture.' }
    ]
  },
  DocumentationAgent: {
    id: 'DocumentationAgent',
    name: 'Technical Documentation Agent',
    role: 'Knowledge Engineer & Technical Writer',
    responsibilities: [
      'Generate Developer API Portal documentation and SDK quickstart guides',
      'Draft User Manuals, Admin Guides, and System Runbooks',
      'Maintain Architecture Decision Records (ADRs) and release notes'
    ],
    inputs: ['OpenAPI Spec', 'Architecture Specs', 'User Personas'],
    outputs: ['Developer Guide', 'API Documentation', 'System Runbook'],
    constraints: ['Markdown and OpenAPI 3.0 standard formatting'],
    metrics: ['100% API endpoint documentation completeness'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'compile_docs', description: 'Compiles user and API developer guides.' }
    ]
  },
  MarketingAgent: {
    id: 'MarketingAgent',
    name: 'Product Marketing Agent',
    role: 'Go-to-Market (GTM) Strategist',
    responsibilities: [
      'Develop Product Launch Campaign and positioning statements',
      'Design lead generation funnels, SEO strategy, and content plan',
      'Formulate Product Hunt / TechCrunch PR announcement kits'
    ],
    inputs: ['Target Market', 'User Personas', 'Value Proposition'],
    outputs: ['GTM Strategy Blueprint', 'Launch Checklist', 'Marketing Content Kit'],
    constraints: ['Align with allocated marketing budget limits'],
    metrics: ['Target initial user signups: 10,000 in Month 1'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'create_gtm_plan', description: 'Generates go-to-market campaign and channels.' }
    ]
  },
  FinanceAgent: {
    id: 'FinanceAgent',
    name: 'Financial & Budgeting Agent',
    role: 'Financial Controller & Cost Analyst',
    responsibilities: [
      'Model total cost of ownership (TCO) including cloud infra, licensing, and labor',
      'Perform burn-rate analysis, break-even timeline calculations, and gross margin modeling',
      'Establish budget allocation caps across development phases'
    ],
    inputs: ['Architecture Scale Specs', 'DevOps Infra Blueprint', 'Team Size'],
    outputs: ['Project Budget Breakdown', 'TCO Analysis', 'Financial Forecast'],
    constraints: ['Must stay within $50,000 MVP development ceiling'],
    metrics: ['Variance to actual cost < 5%'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'calculate_tco', description: 'Computes cloud infra and team labor costs.' }
    ]
  },
  RiskAgent: {
    id: 'RiskAgent',
    name: 'Risk Management Agent',
    role: 'Project Risk Specialist',
    responsibilities: [
      'Identify technical, operational, financial, and schedule risks',
      'Construct 5x5 Risk Matrix evaluating Likelihood vs Impact',
      'Define mitigation strategies, contingency plans, and risk trigger indicators'
    ],
    inputs: ['All Domain Agent Outputs'],
    outputs: ['Project Risk Register', '5x5 Risk Heatmap', 'Contingency Matrix'],
    constraints: ['High risk items must have fallback mitigation plan'],
    metrics: ['100% high-risk mitigation coverage'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'generate_risk_matrix', description: 'Synthesizes risk factors into 5x5 heatmap dataset.' }
    ]
  },
  CommunicationAgent: {
    id: 'CommunicationAgent',
    name: 'Internal Communication Agent',
    role: 'Team Alignment & Slack/Email Dispatcher',
    responsibilities: [
      'Draft daily standup summaries, sprint retrospectives, and blocker alerts',
      'Broadcast automated Slack/Teams notifications on milestone completion',
      'Maintain team communication protocols and status sync cadence'
    ],
    inputs: ['Sprint Backlog', 'Agent Execution Logs'],
    outputs: ['Daily Sync Summary', 'Blocker Resolution Notice', 'Sprint Retro Digest'],
    constraints: ['Clear actionable summary in under 200 words'],
    metrics: ['Zero uncommunicated blocker > 24 hours'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'send_team_digest', description: 'Generates Slack digest for team members.' }
    ]
  },
  StakeholderAgent: {
    id: 'StakeholderAgent',
    name: 'Stakeholder Management Agent',
    role: 'Executive Alignment & Relationship Manager',
    responsibilities: [
      'Draft executive status briefs for C-Suite, Board, and Investors',
      'Map stakeholder expectations, influence vs interest grid',
      'Manage change requests and scope variation approvals'
    ],
    inputs: ['Project Health Score', 'Executive Report', 'Financial Forecast'],
    outputs: ['Executive Briefing Deck', 'Stakeholder Matrix', 'Change Control Log'],
    constraints: ['High-level executive focus without overly granular dev noise'],
    metrics: ['Stakeholder satisfaction index > 90%'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'create_exec_brief', description: 'Outputs high-level summary for board members.' }
    ]
  },
  AnalyticsAgent: {
    id: 'AnalyticsAgent',
    name: 'Product Analytics & KPI Agent',
    role: 'Data & Telemetry Specialist',
    responsibilities: [
      'Define North Star Metric, OKRs, and funnel conversion KPIs',
      'Specify event tracking taxonomy (Mixpanel/Amplitude schema)',
      'Establish A/B testing framework and data telemetry pipelines'
    ],
    inputs: ['User Journeys', 'Requirements'],
    outputs: ['Product KPI Dashboard Spec', 'Event Tracking Schema', 'A/B Testing Framework'],
    constraints: ['GDPR/CCPA compliant telemetry collection'],
    metrics: ['100% core user funnel tracking'],
    protocol: 'JSON Payload over Event Bus',
    toolsContent: [
      { name: 'define_telemetry_schema', description: 'Builds event tracking taxonomy.' }
    ]
  }
};
