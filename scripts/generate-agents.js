import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, '..', 'agents');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const agentsData = [
  {
    id: "ProductManagerAgent",
    name: "Product Manager Agent",
    role: "Lead Orchestrator & SDLC Product Strategist",
    responsibilities: [
      "Receive project concepts and synthesize vision into high-level roadmap",
      "Decompose features into Sprints, Epics, and User Stories",
      "Orchestrate 16 specialized domain agents and validate JSON payloads",
      "Resolve conflicting requirements across architecture, security, and finance",
      "Calculate project timelines, critical paths, and effort estimates",
      "Predict delivery risks and project health metrics",
      "Generate executive summaries and product health dashboards"
    ],
    inputs: ["User Project Prompt", "Domain Agent Outputs", "Shared Memory State"],
    outputs: ["Product Requirements Document (PRD)", "Sprint Backlog", "Executive Report", "Orchestration Matrix"],
    constraints: ["Must wait for mandatory dependencies before dispatching downstream agents", "Enforce strict JSON schema validation"],
    metrics: ["100% agent synthesis completion", "Zero conflicting requirements", "On-time delivery index > 95%"],
    protocol: "REST/JSON Event Bus, Async Request-Response with Status Polling",
    tools: [
      {
        name: "create_roadmap",
        description: "Generates high level roadmap and milestones from project prompt.",
        parameters: { type: "object", properties: { project_name: { type: "string" }, scope: { type: "string" } } }
      },
      {
        name: "dispatch_agent",
        description: "Triggers specialized agent with task context.",
        parameters: { type: "object", properties: { target_agent: { type: "string" }, context: { type: "object" } } }
      },
      {
        name: "aggregate_executive_report",
        description: "Synthesizes outputs from all 16 agents into final report.",
        parameters: { type: "object", properties: { all_outputs: { type: "array" } } }
      }
    ]
  },
  {
    id: "RequirementAgent",
    name: "Requirement Engineering Agent",
    role: "Requirements Analyst & Scope Specifier",
    responsibilities: [
      "Elicit functional and non-functional requirements from user prompt",
      "Define user personas, user stories, acceptance criteria, and edge cases",
      "Identify scope boundaries and out-of-scope features"
    ],
    inputs: ["Project Vision", "Market Context"],
    outputs: ["Detailed Functional Requirements", "User Personas", "Acceptance Criteria Matrix"],
    constraints: ["All stories must follow INVEST criteria", "Clear out-of-scope demarcation"],
    metrics: ["100% story acceptance coverage", "Zero ambiguous requirements"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "extract_user_stories",
        description: "Breaks down project prompt into user stories.",
        parameters: { type: "object", properties: { domain: { type: "string" } } }
      }
    ]
  },
  {
    id: "BusinessAnalystAgent",
    name: "Business Analyst Agent",
    role: "Market & Feasibility Analyst",
    responsibilities: [
      "Conduct market analysis, competitive intelligence, and TAM/SAM evaluation",
      "Define monetization strategy, pricing models, and ROI projections",
      "Map business workflows and value stream diagrams"
    ],
    inputs: ["Requirements", "Industry Domain"],
    outputs: ["Market Feasibility Study", "Pricing Matrix", "ROI Projections"],
    constraints: ["Rely on verified industry benchmark data"],
    metrics: ["ROI accuracy range ±10%", "Clear TAM/SAM sizing"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "evaluate_tam_sam",
        description: "Calculates TAM, SAM, and SOM metrics.",
        parameters: { type: "object", properties: { category: { type: "string" } } }
      }
    ]
  },
  {
    id: "UIUXAgent",
    name: "UI/UX Design Agent",
    role: "User Experience & Visual Interface Architect",
    responsibilities: [
      "Map user journeys, wireframe schemas, and interaction models",
      "Create component design tokens, accessibility standards (WCAG 2.1 AA)",
      "Design design system layout guidelines and interactive prototypes"
    ],
    inputs: ["User Personas", "User Stories"],
    outputs: ["User Journey Maps", "Design System Tokens", "Wireframe Component Tree"],
    constraints: ["WCAG 2.1 AA contrast compliance", "Mobile-first responsive grids"],
    metrics: ["100% accessibility compliance score"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "generate_wireframe_tree",
        description: "Generates UI component hierarchy and design tokens.",
        parameters: { type: "object", properties: { screens: { type: "array" } } }
      }
    ]
  },
  {
    id: "ArchitectureAgent",
    name: "System Architecture Agent",
    role: "Enterprise Software & Cloud Architect",
    responsibilities: [
      "Design system architecture (Microservices vs Serverless vs Modular Monolith)",
      "Define database schemas, ER diagrams, caching strategies, and API gateways",
      "Publish Architectural Decision Records (ADRs) and scalability models"
    ],
    inputs: ["Functional Requirements", "Non-Functional Scale Requirements"],
    outputs: ["System Topology Diagram Specs", "Database Schema", "ADRs", "Tech Stack Matrix"],
    constraints: ["Sub-100ms API response SLA", "99.99% availability design"],
    metrics: ["Zero single point of failure", "99.99% uptime blueprint"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "design_system_topology",
        description: "Outputs architecture specs and microservices diagram.",
        parameters: { type: "object", properties: { scale_users: { type: "number" } } }
      }
    ]
  },
  {
    id: "FrontendAgent",
    name: "Frontend Engineering Agent",
    role: "Client Application Architect",
    responsibilities: [
      "Define frontend tech stack (React/Vite/Next.js/TypeScript)",
      "Draft page routing, client state management, dynamic data fetching hooks",
      "Specify responsive layout blueprints and bundle optimization strategies"
    ],
    inputs: ["Wireframe Component Tree", "API Specifications"],
    outputs: ["Frontend Architecture Plan", "State Management Model", "Page Routing Schema"],
    constraints: ["Lighthouse Performance score > 90", "First Contentful Paint < 1.2s"],
    metrics: ["Component reuse rate > 80%"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "plan_frontend_stack",
        description: "Structures client app state and routes.",
        parameters: { type: "object", properties: { framework: { type: "string" } } }
      }
    ]
  },
  {
    id: "BackendAgent",
    name: "Backend Engineering Agent",
    role: "API & Data Services Engineer",
    responsibilities: [
      "Design OpenAPI 3.0 REST & GraphQL API specifications",
      "Define database migrations, ORM entities, authentication middleware",
      "Specify event queues (Kafka/RabbitMQ) and background workers"
    ],
    inputs: ["Architecture Specs", "Database Schema"],
    outputs: ["OpenAPI 3.0 Spec", "Data Models", "Authentication Flow"],
    constraints: ["RESTful standard compliance", "JWT/OAuth2 RBAC enforcement"],
    metrics: ["API test coverage > 90%", "Mean latency < 45ms"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "generate_openapi_spec",
        description: "Builds OpenAPI specification for REST endpoints.",
        parameters: { type: "object", properties: { modules: { type: "array" } } }
      }
    ]
  },
  {
    id: "QAAgent",
    name: "Quality Assurance Agent",
    role: "Test Automation & Quality Strategist",
    responsibilities: [
      "Formulate master test plan (Unit, Integration, E2E, Load, Chaos)",
      "Create test case repository with automated test scripts",
      "Define code coverage thresholds and quality gate rules"
    ],
    inputs: ["User Stories", "Acceptance Criteria", "OpenAPI Spec"],
    outputs: ["Master Test Plan", "Test Case Suites", "Quality Gate Checklist"],
    constraints: ["Minimum 85% statement coverage required for build pass"],
    metrics: ["100% critical path test automation"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "build_test_suite",
        description: "Generates unit and E2E test suites.",
        parameters: { type: "object", properties: { endpoints: { type: "array" } } }
      }
    ]
  },
  {
    id: "DevOpsAgent",
    name: "DevOps & Infrastructure Agent",
    role: "Cloud Infrastructure & CI/CD Pipeline Specialist",
    responsibilities: [
      "Design Terraform/IaC scripts for AWS/GCP/Azure infrastructure",
      "Define Kubernetes deployment manifests and Helm charts",
      "Establish CI/CD build pipelines (GitHub Actions/GitLab CI) with zero-downtime blue/green deployments"
    ],
    inputs: ["Architecture Specs", "Backend/Frontend Tech Stack"],
    outputs: ["CI/CD Pipeline Spec", "Terraform IaC Blueprint", "K8s Deployment Spec"],
    constraints: ["Zero-downtime deployment strategy", "Automated rollback triggers"],
    metrics: ["Deployment velocity < 10 mins", "MTTR < 15 mins"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "generate_cicd_pipeline",
        description: "Creates CI/CD YAML configuration.",
        parameters: { type: "object", properties: { provider: { type: "string" } } }
      }
    ]
  },
  {
    id: "SecurityAgent",
    name: "Cybersecurity & Compliance Agent",
    role: "Security Auditor & Compliance Officer",
    responsibilities: [
      "Perform threat modeling (STRIDE/PASTA) and SAST/DAST rule definitions",
      "Audit OWASP Top 10 vulnerabilities and data encryption standards (AES-256/TLS 1.3)",
      "Ensure regulatory compliance (GDPR, HIPAA, SOC2 Type II, PCI-DSS)"
    ],
    inputs: ["Architecture Specs", "Backend OpenAPI Spec", "Data Flow Diagram"],
    outputs: ["Security Audit Report", "Threat Matrix", "Compliance Roadmap (SOC2/GDPR)"],
    constraints: ["Zero Critical or High vulnerabilities allowed at launch"],
    metrics: ["100% OWASP compliance checklist coverage"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "audit_threat_model",
        description: "Runs STRIDE threat analysis on architecture.",
        parameters: { type: "object", properties: { components: { type: "array" } } }
      }
    ]
  },
  {
    id: "DocumentationAgent",
    name: "Technical Documentation Agent",
    role: "Knowledge Engineer & Technical Writer",
    responsibilities: [
      "Generate Developer API Portal documentation and SDK quickstart guides",
      "Draft User Manuals, Admin Guides, and System Runbooks",
      "Maintain Architecture Decision Records (ADRs) and release notes"
    ],
    inputs: ["OpenAPI Spec", "Architecture Specs", "User Personas"],
    outputs: ["Developer Guide", "API Documentation", "System Runbook"],
    constraints: ["Markdown and OpenAPI 3.0 standard formatting"],
    metrics: ["100% API endpoint documentation completeness"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "compile_docs",
        description: "Compiles user and API developer guides.",
        parameters: { type: "object", properties: { target: { type: "string" } } }
      }
    ]
  },
  {
    id: "MarketingAgent",
    name: "Product Marketing Agent",
    role: "Go-to-Market (GTM) Strategist",
    responsibilities: [
      "Develop Product Launch Campaign and positioning statements",
      "Design lead generation funnels, SEO strategy, and content plan",
      "Formulate Product Hunt / TechCrunch PR announcement kits"
    ],
    inputs: ["Target Market", "User Personas", "Value Proposition"],
    outputs: ["GTM Strategy Blueprint", "Launch Checklist", "Marketing Content Kit"],
    constraints: ["Align with allocated marketing budget limits"],
    metrics: ["Target initial user signups: 10,000 in Month 1"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "create_gtm_plan",
        description: "Generates go-to-market campaign and channels.",
        parameters: { type: "object", properties: { channels: { type: "array" } } }
      }
    ]
  },
  {
    id: "FinanceAgent",
    name: "Financial & Budgeting Agent",
    role: "Financial Controller & Cost Analyst",
    responsibilities: [
      "Model total cost of ownership (TCO) including cloud infra, licensing, and labor",
      "Perform burn-rate analysis, break-even timeline calculations, and gross margin modeling",
      "Establish budget allocation caps across development phases"
    ],
    inputs: ["Architecture Scale Specs", "DevOps Infra Blueprint", "Team Size"],
    outputs: ["Project Budget Breakdown", "TCO Analysis", "Financial Forecast"],
    constraints: ["Must stay within $50,000 MVP development ceiling"],
    metrics: ["Variance to actual cost < 5%"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "calculate_tco",
        description: "Computes cloud infra and team labor costs.",
        parameters: { type: "object", properties: { user_scale: { type: "number" } } }
      }
    ]
  },
  {
    id: "RiskAgent",
    name: "Risk Management Agent",
    role: "Project Risk Specialist",
    responsibilities: [
      "Identify technical, operational, financial, and schedule risks",
      "Construct 5x5 Risk Matrix evaluating Likelihood vs Impact",
      "Define mitigation strategies, contingency plans, and risk trigger indicators"
    ],
    inputs: ["All Domain Agent Outputs"],
    outputs: ["Project Risk Register", "5x5 Risk Heatmap", "Contingency Matrix"],
    constraints: ["High risk items must have fallback mitigation plan"],
    metrics: ["100% high-risk mitigation coverage"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "generate_risk_matrix",
        description: "Synthesizes risk factors into 5x5 heatmap dataset.",
        parameters: { type: "object", properties: { risks: { type: "array" } } }
      }
    ]
  },
  {
    id: "CommunicationAgent",
    name: "Internal Communication Agent",
    role: "Team Alignment & Slack/Email Dispatcher",
    responsibilities: [
      "Draft daily standup summaries, sprint retrospectives, and blocker alerts",
      "Broadcast automated Slack/Teams notifications on milestone completion",
      "Maintain team communication protocols and status sync cadence"
    ],
    inputs: ["Sprint Backlog", "Agent Execution Logs"],
    outputs: ["Daily Sync Summary", "Blocker Resolution Notice", "Sprint Retro Digest"],
    constraints: ["Clear actionable summary in under 200 words"],
    metrics: ["Zero uncommunicated blocker > 24 hours"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "send_team_digest",
        description: "Generates Slack digest for team members.",
        parameters: { type: "object", properties: { updates: { type: "array" } } }
      }
    ]
  },
  {
    id: "StakeholderAgent",
    name: "Stakeholder Management Agent",
    role: "Executive Alignment & Relationship Manager",
    responsibilities: [
      "Draft executive status briefs for C-Suite, Board, and Investors",
      "Map stakeholder expectations, influence vs interest grid",
      "Manage change requests and scope variation approvals"
    ],
    inputs: ["Project Health Score", "Executive Report", "Financial Forecast"],
    outputs: ["Executive Briefing Deck", "Stakeholder Matrix", "Change Control Log"],
    constraints: ["High-level executive focus without overly granular dev noise"],
    metrics: ["Stakeholder satisfaction index > 90%"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "create_exec_brief",
        description: "Outputs high-level summary for board members.",
        parameters: { type: "object", properties: { metrics: { type: "object" } } }
      }
    ]
  },
  {
    id: "AnalyticsAgent",
    name: "Product Analytics & KPI Agent",
    role: "Data & Telemetry Specialist",
    responsibilities: [
      "Define North Star Metric, OKRs, and funnel conversion KPIs",
      "Specify event tracking taxonomy (Mixpanel/Amplitude schema)",
      "Establish A/B testing framework and data telemetry pipelines"
    ],
    inputs: ["User Journeys", "Requirements"],
    outputs: ["Product KPI Dashboard Spec", "Event Tracking Schema", "A/B Testing Framework"],
    constraints: ["GDPR/CCPA compliant telemetry collection"],
    metrics: ["100% core user funnel tracking"],
    protocol: "JSON Payload over Event Bus",
    tools: [
      {
        name: "define_telemetry_schema",
        description: "Builds event tracking taxonomy.",
        parameters: { type: "object", properties: { events: { type: "array" } } }
      }
    ]
  }
];

agentsData.forEach((agent) => {
  const agentDir = path.join(baseDir, agent.id);
  const schemasDir = path.join(agentDir, 'schemas');
  const memoryDir = path.join(agentDir, 'memory');
  const outputsDir = path.join(agentDir, 'outputs');

  fs.mkdirSync(schemasDir, { recursive: true });
  fs.mkdirSync(memoryDir, { recursive: true });
  fs.mkdirSync(outputsDir, { recursive: true });

  // 1. SKILL.md
  const skillContent = `---
name: ${agent.id}
title: ${agent.name}
role: ${agent.role}
version: 1.0.0
---

# ${agent.name} (${agent.id})

## Responsibilities
${agent.responsibilities.map(r => `- ${r}`).join('\n')}

## Inputs
${agent.inputs.map(i => `- ${i}`).join('\n')}

## Outputs
${agent.outputs.map(o => `- ${o}`).join('\n')}

## Constraints
${agent.constraints.map(c => `- ${c}`).join('\n')}

## Success Metrics
${agent.metrics.map(m => `- ${m}`).join('\n')}

## Communication Protocol
${agent.protocol}
`;
  fs.writeFileSync(path.join(agentDir, 'SKILL.md'), skillContent);

  // 2. prompt.md
  const promptContent = `You are the ${agent.name}, operating as the ${agent.role} in the PMPilot AI Product Management Platform.
Your goal is to process incoming project state and produce highly detailed, structured, professional outputs for your domain.

### Operational Guidelines:
1. Always return structured JSON adhering to your schema.
2. Validate inputs against dependencies before execution.
3. Quantify risks, days required, and dependencies in every response.
`;
  fs.writeFileSync(path.join(agentDir, 'prompt.md'), promptContent);

  // 3. examples.md
  const examplesContent = `# ${agent.name} Execution Examples

## Example Input Context:
\`\`\`json
{
  "project_name": "Event Management Platform",
  "phase": "SDLC Orchestration",
  "request": "Process domain requirements"
}
\`\`\`

## Example Structured Output Response:
\`\`\`json
{
  "agent": "${agent.id}",
  "status": "Completed",
  "risk": "Low",
  "estimated_days": 4,
  "dependencies": ["ProductManagerAgent"],
  "summary": "Completed domain analysis and generated artifacts successfully."
}
\`\`\`
`;
  fs.writeFileSync(path.join(agentDir, 'examples.md'), examplesContent);

  // 4. tools.json
  fs.writeFileSync(path.join(agentDir, 'tools.json'), JSON.stringify(agent.tools, null, 2));

  // 5. schemas/input_output_schema.json
  const schemaObj = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: `${agent.id} Schema`,
    type: "object",
    properties: {
      agent: { type: "string", const: agent.id },
      status: { type: "string", enum: ["Pending", "In_Progress", "Completed", "Failed"] },
      risk: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
      estimated_days: { type: "number" },
      dependencies: { type: "array", items: { type: "string" } },
      summary: { type: "string" },
      payload: { type: "object" }
    },
    required: ["agent", "status", "risk", "estimated_days", "dependencies", "summary"]
  };
  fs.writeFileSync(path.join(schemasDir, 'input_output_schema.json'), JSON.stringify(schemaObj, null, 2));

  // 6. memory/agent_memory.json
  const memoryObj = {
    agent: agent.id,
    history_count: 12,
    last_active: new Date().toISOString(),
    knowledge_base: [
      `Best practices for ${agent.name}`,
      `Standard operating procedures & compliance checks`
    ]
  };
  fs.writeFileSync(path.join(memoryDir, 'agent_memory.json'), JSON.stringify(memoryObj, null, 2));

  // 7. outputs/event_platform_output.json
  const outputObj = {
    agent: agent.id,
    status: "Completed",
    risk: agent.id === 'RiskAgent' || agent.id === 'SecurityAgent' ? "Medium" : "Low",
    estimated_days: Math.floor(Math.random() * 5) + 3,
    dependencies: agent.id === 'ProductManagerAgent' ? [] : ['ProductManagerAgent'],
    summary: `${agent.name} successfully executed domain analysis and published technical specs.`,
    payload: {
      domain: agent.name,
      artifacts_generated: agent.outputs,
      key_highlights: [
        `Executed domain specifications for Event Management Platform`,
        `Validated non-functional metrics and quality gates`
      ]
    }
  };
  fs.writeFileSync(path.join(outputsDir, 'event_platform_output.json'), JSON.stringify(outputObj, null, 2));

  console.log(`Generated agent directory: ${agent.id}`);
});

console.log('All 17 agent directories populated successfully!');
