import time
import json
import asyncio
from typing import Any
from backend.app.providers.base import BaseLLMProvider, LLMRequest, LLMResponse

class MockProvider(BaseLLMProvider):
    """
    Deterministic Offline / Testing Mock Provider.
    Clearly labelled: OFFLINE / MOCK MODE.
    Provides rich, domain-aware, structured outputs adhering to the Pydantic schema
    for all 17 agents, consuming upstream context without external network calls.
    """

    async def ping(self) -> dict[str, Any]:
        return {
            "success": True,
            "latency_ms": 5,
            "message": "OFFLINE / MOCK MODE - Deterministic engine active"
        }

    async def query(self, request: LLMRequest) -> LLMResponse:
        start = time.perf_counter()
        # Realistic local execution latency simulation (50ms - 120ms)
        await asyncio.sleep(0.06)
        latency_ms = int((time.perf_counter() - start) * 1000)

        agent_id = request.agent_id
        project_name = "Enterprise Software System"
        for line in request.user_prompt.splitlines():
            if line.lower().startswith("project:") or line.lower().startswith("project name:"):
                project_name = line.split(":", 1)[1].strip() or project_name
                break

        structured = self._generate_agent_deliverable(agent_id, project_name, request.project_context or "")
        content = json.dumps(structured, indent=2)

        return LLMResponse(
            content=content,
            provider="mock",
            model="deterministic-offline-v2",
            latency_ms=latency_ms,
            tokens_used=len(content.split()) * 2,
            structured_output=structured
        )

    def _generate_agent_deliverable(self, agent_id: str, project_name: str, context: str) -> dict[str, Any]:
        base = {
            "agent_id": agent_id,
            "status": "completed",
            "metadata": {
                "engine": "OFFLINE_MOCK_ENGINE",
                "project": project_name,
                "validated_schema": True
            }
        }

        if agent_id == "ProductManagerAgent":
            return {
                **base,
                "summary": f"Charter established for {project_name}. Synthesized high-level vision into 5 core execution epics and aligned milestone schedule across all 16 downstream agents.",
                "findings": [
                    "Target launch timeframe defined for Q4 with 28-day critical path",
                    "Ecosystem decomposed into 5 epics: Foundation, Core Services, Frontend SPA, Security Gate, Production Launch",
                    "Identified mandatory human checkpoints at Architecture and Security phases"
                ],
                "recommendations": [
                    "Enforce strict API contract schemas between frontend and backend services",
                    "Maintain continuous risk scoring throughout sprint execution"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "Master SDLC Roadmap.md",
                        "content": f"# Master SDLC Roadmap: {project_name}\n\n## Vision\nDeliver a resilient, high-concurrency enterprise system.\n\n## Milestones\n- M1: Requirements & Architecture Sign-Off (Day 7)\n- M2: Core Microservices & Database Schema (Day 16)\n- M3: E2E Integration & Security Hardening (Day 24)\n- M4: Production Deployment & Stakeholder Authorization (Day 28)\n"
                    }
                ]
            }

        elif agent_id == "RequirementAgent":
            return {
                **base,
                "summary": f"Elicited functional and non-functional specifications for {project_name} adhering to IEEE 830 standards with MoSCoW prioritization.",
                "findings": [
                    "Must Have: Low-latency atomic transaction handling (sub-250ms)",
                    "Must Have: Role-based access control (RBAC) with cryptographic session tokens",
                    "Should Have: Real-time telemetry and audit logging of all sensitive mutations"
                ],
                "recommendations": [
                    "Specify boundary limits on concurrent database connection pools",
                    "Isolate customer data schemas to support GDPR/data sovereignty"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "FR_NFR_Specification.md",
                        "content": f"# Requirements Specification: {project_name}\n\n## Functional Requirements\n- REQ-01: User registration and authentication with bcrypt and JWT.\n- REQ-02: Project lifecycle state transitions with immutable event logging.\n- REQ-03: Real-time multi-agent execution pipeline with status polling.\n\n## Non-Functional Requirements\n- NFR-01: 99.95% API uptime.\n- NFR-02: P95 API response latency < 200ms.\n"
                    }
                ]
            }

        elif agent_id == "BusinessAnalystAgent":
            return {
                **base,
                "summary": f"Decomposed {project_name} requirements into agile sprint backlog with Gherkin acceptance criteria and Fibonacci story points.",
                "findings": [
                    "Total backlog estimated at 34 story points across 4 execution sprints",
                    "Auth and database transactions designated as Critical path stories (8 pts each)",
                    "Defined Given-When-Then criteria for automated QA test harness validation"
                ],
                "recommendations": [
                    "Conduct spike on high-concurrency ticket locking mechanism before Sprint 2"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "Sprint_Backlog.json",
                        "content": json.dumps([
                            {"id": "STORY-1", "title": "User Authentication & JWT Issuance", "points": 5, "priority": "Critical"},
                            {"id": "STORY-2", "title": "Relational Data Storage & Migrations", "points": 8, "priority": "Critical"},
                            {"id": "STORY-3", "title": "Asynchronous Agent Dispatch Engine", "points": 8, "priority": "High"},
                            {"id": "STORY-4", "title": "Real-time Frontend Execution Monitor", "points": 5, "priority": "High"}
                        ], indent=2)
                    }
                ]
            }

        elif agent_id == "UIUXAgent":
            return {
                **base,
                "summary": f"Constructed WCAG 2.1 AA compliant design system tokens, Tailwind CSS color palette, and layout wireframe manifests for {project_name}.",
                "findings": [
                    "Adopted slate-950 dark theme with high-contrast emerald and indigo accent tokens",
                    "Verified 4.5:1 text-to-background contrast ratio across all interactive buttons",
                    "Specified responsive grid breakpoints for mobile (390px), tablet (768px), and desktop (1280px)"
                ],
                "recommendations": [
                    "Utilize skeleton loaders for asynchronous agent execution streams"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "design_tokens.json",
                        "content": json.dumps({
                            "theme": "dark",
                            "palette": {
                                "background": "#020617",
                                "surface": "#0f172a",
                                "border": "#1e293b",
                                "accent": "#6366f1",
                                "success": "#10b981",
                                "danger": "#ef4444"
                            },
                            "typography": {"fontFamily": "Plus Jakarta Sans, sans-serif"}
                        }, indent=2)
                    }
                ]
            }

        elif agent_id == "ArchitectureAgent":
            return {
                **base,
                "summary": f"Formulated ADR-001 System Architecture Record and microservices data pipeline for {project_name}.",
                "findings": [
                    "Selected FastAPI + SQLAlchemy as resilient modular monolithic backend",
                    "Adopted SQLite for local development with zero external daemon requirements and direct migration path to PostgreSQL",
                    "Defined dependency-driven DAG orchestrator to execute agents concurrently when dependencies are satisfied"
                ],
                "recommendations": [
                    "Enforce database transaction boundaries per agent execution step",
                    "Require human sign-off checkpoint before proceeding to heavy downstream implementation"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "ADR-001-Architecture.md",
                        "content": f"# ADR-001: Modular Architecture for {project_name}\n\n## Status\nAccepted\n\n## Context\nThe system requires high-speed local development, persistent audit logs, and extensible LLM provider pluggability.\n\n## Decision\nImplement a clean modular architecture: React SPA -> FastAPI REST API -> SQLAlchemy ORM -> SQLite/PostgreSQL.\n\n## Consequences\nEliminates in-memory data loss upon browser refresh; guarantees deterministic execution."
                    }
                ]
            }

        elif agent_id == "FrontendAgent":
            return {
                **base,
                "summary": f"Implemented client-side API clients, persistent state subscriptions, and execution monitor views for {project_name}.",
                "findings": [
                    "Decoupled React state from simulation mocks; connected real REST API endpoints",
                    "Constructed real-time status polling hook with exponential backoff on error",
                    "Preserved existing 24 dashboard views while binding them to backend API models"
                ],
                "recommendations": [
                    "Cache read-only project metadata in SWR/React Query or lightweight store"
                ],
                "deliverables": [
                    {
                        "type": "code",
                        "title": "ApiClient.ts",
                        "content": "// Production REST API client connecting React to FastAPI backend\nexport const apiClient = {\n  getProjects: () => fetch('/api/projects').then(r => r.json()),\n  getRunStatus: (id: string) => fetch(`/api/runs/${id}`).then(r => r.json())\n};\n"
                    }
                ]
            }

        elif agent_id == "BackendAgent":
            return {
                **base,
                "summary": f"Implemented core API controllers, relational schemas, transaction locks, and authentication routes for {project_name}.",
                "findings": [
                    "Defined SQLAlchemy declarative models: User, Project, AgentRun, AgentExecution, Deliverable, Metric",
                    "Configured Alembic-ready migration schemas with indexed foreign keys",
                    "Integrated bcrypt password hashing and HS256 JWT bearer token authentication"
                ],
                "recommendations": [
                    "Use async session pooling when deploying to high-concurrency PostgreSQL"
                ],
                "deliverables": [
                    {
                        "type": "code",
                        "title": "schema.sql",
                        "content": "-- Production relational database schema\nCREATE TABLE IF NOT EXISTS users (\n  id VARCHAR(36) PRIMARY KEY,\n  name VARCHAR(120) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n"
                    }
                ]
            }

        elif agent_id == "QAAgent":
            return {
                **base,
                "summary": f"Synthesized automated test suites covering API contracts, dependency execution graphs, and boundary error conditions for {project_name}.",
                "findings": [
                    "Built 12 automated integration tests across Auth, Projects, and Run Orchestration",
                    "Verified error handling when LLM provider is offline or missing credentials",
                    "100% test pass rate across all database and dependency resolution test cases"
                ],
                "recommendations": [
                    "Add automated Playwright E2E browser tests for full human-in-the-loop workflows"
                ],
                "deliverables": [
                    {
                        "type": "code",
                        "title": "test_suite.py",
                        "content": "# Automated QA Test Suite\ndef test_agent_run_execution():\n    assert True, 'Agent execution completed successfully'\n"
                    }
                ]
            }

        elif agent_id == "DevOpsAgent":
            return {
                **base,
                "summary": f"Engineered multi-stage containerization specifications and local launch scripts for {project_name}.",
                "findings": [
                    "Created Dockerfile with non-root user and multi-stage frontend build",
                    "Configured docker-compose.yml bridging React frontend and FastAPI backend with health checks",
                    "Zero external cloud requirements for local execution"
                ],
                "recommendations": [
                    "Set up GitHub Actions CI workflow to run pytest and oxlint on every pull request"
                ],
                "deliverables": [
                    {
                        "type": "configuration",
                        "title": "docker-compose.yml",
                        "content": "version: '3.8'\nservices:\n  backend:\n    build: ./backend\n    ports:\n      - '8000:8000'\n    environment:\n      - DATABASE_URL=sqlite:///./pmpilot.db\n  frontend:\n    build: .\n    ports:\n      - '5173:5173'\n"
                    }
                ]
            }

        elif agent_id == "SecurityAgent":
            return {
                **base,
                "summary": f"Conducted STRIDE threat modeling and OWASP Top 10 security audit on {project_name}.",
                "findings": [
                    "Mitigated Spoofing: Required JWT signature validation on all mutating endpoints",
                    "Mitigated Tampering: Enforced Pydantic schema validation preventing mass assignment",
                    "Mitigated Information Disclosure: Masked passwords and secrets in API error responses"
                ],
                "recommendations": [
                    "Set CORS allow-origins strictly to approved frontend hostnames in production",
                    "Human security sign-off approved for release gate"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "stride_threat_model.json",
                        "content": json.dumps({
                            "threats": [
                                {"category": "Spoofing", "status": "Mitigated", "control": "JWT HS256 + Bcrypt"},
                                {"category": "Tampering", "status": "Mitigated", "control": "Pydantic Schema Validation"},
                                {"category": "Repudiation", "status": "Mitigated", "control": "Immutable Event Logging"}
                            ]
                        }, indent=2)
                    }
                ]
            }

        elif agent_id == "DocumentationAgent":
            return {
                **base,
                "summary": f"Authored developer documentation, API specifications, and local onboarding runbooks for {project_name}.",
                "findings": [
                    "Generated complete OpenAPI 3.0 specification covering all REST endpoints",
                    "Created step-by-step developer guide for starting frontend and backend servers",
                    "Documented environment variable matrix in .env.example"
                ],
                "recommendations": [
                    "Host interactive Swagger UI documentation at /docs"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "API_Documentation.md",
                        "content": f"# API Documentation: {project_name}\n\nFastAPI automatically serves interactive Swagger docs at `http://localhost:8000/docs`.\n"
                    }
                ]
            }

        elif agent_id == "MarketingAgent":
            return {
                **base,
                "summary": f"Formulated Go-To-Market strategy, user value propositions, and positioning framework for {project_name}.",
                "findings": [
                    "Target audience: Engineering Leads, Product Managers, and Agile Development Teams",
                    "Core value proposition: Transform ambiguous project ideas into verifiable, production-ready SDLC blueprints in minutes",
                    "Competitive moat: Real 17-agent collaborative collective with persistent database storage"
                ],
                "recommendations": [
                    "Launch public demo showcase with interactive live simulations"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "GTM_Launch_Blueprint.md",
                        "content": f"# Go-To-Market Blueprint: {project_name}\n\n## Value Proposition\nAutonomous multi-agent SDLC orchestration that delivers verified code artifacts, test suites, and compliance documentation.\n"
                    }
                ]
            }

        elif agent_id == "FinanceAgent":
            return {
                **base,
                "summary": f"Calculated Total Cost of Ownership (TCO), cloud infrastructure run-rates, and 3-year ROI forecasts for {project_name}.",
                "findings": [
                    "Local developer environment run-rate: $0/month using on-device inference",
                    "Production cloud infrastructure estimated at $185/month for managed database and container host",
                    "Calculated 3-Year ROI of 340% based on 65% reduction in requirements-gathering turnaround time"
                ],
                "recommendations": [
                    "Leverage SQLite during prototype and test stages to eliminate database hosting overhead"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "TCO_Financial_Model.json",
                        "content": json.dumps({
                            "monthlyCloudInfra": 185,
                            "annualEngineeringSavings": 78000,
                            "threeYearRoiPercent": 340,
                            "breakEvenMonths": 4.2
                        }, indent=2)
                    }
                ]
            }

        elif agent_id == "RiskAgent":
            return {
                **base,
                "summary": f"Constructed deterministic 5x5 Likelihood vs Impact risk matrix and mitigation protocols for {project_name}.",
                "findings": [
                    "Risk 1: Cloud LLM API downtime or rate-limiting (Likelihood: 3, Impact: 4) -> Mitigated via offline MockProvider fallback",
                    "Risk 2: Requirement drift between agents (Likelihood: 2, Impact: 4) -> Mitigated via strict dependency passing",
                    "Overall project risk level: LOW (all critical risks mitigated)"
                ],
                "recommendations": [
                    "Monitor token usage and response latencies continuously"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "Risk_Matrix.json",
                        "content": json.dumps([
                            {"id": "RISK-01", "name": "LLM Rate Limit", "severity": "Medium", "mitigation": "Hybrid offline router fallback"},
                            {"id": "RISK-02", "name": "Schema Inconsistency", "severity": "Low", "mitigation": "Strict Pydantic models"}
                        ], indent=2)
                    }
                ]
            }

        elif agent_id == "CommunicationAgent":
            return {
                **base,
                "summary": f"Verified inter-agent JSON message contracts, payload integrity, and event audit logging for {project_name}.",
                "findings": [
                    "100% of inter-agent messages conform to validated Pydantic schemas",
                    "Zero dropped events or malformed payload exceptions across all 17 agent transitions",
                    "Persisted full audit trail to database with millisecond timestamps"
                ],
                "recommendations": [
                    "Retain execution logs for 90 days for compliance audits"
                ],
                "deliverables": [
                    {
                        "type": "specification",
                        "title": "Event_Audit_Log.json",
                        "content": json.dumps({
                            "verifiedMessagesCount": 17,
                            "schemaComplianceRate": "100%",
                            "busProtocol": "In-Memory Orchestration Engine with SQLite Persistence"
                        }, indent=2)
                    }
                ]
            }

        elif agent_id == "StakeholderAgent":
            return {
                **base,
                "summary": f"Conducted executive milestone evaluation and ratified production release authorization for {project_name}.",
                "findings": [
                    "All 16 upstream domain agent deliverables verified and compliant with charter",
                    "Security audit passed with zero unmitigated High/Critical vulnerabilities",
                    "Budget and timeline approved by executive governance committee"
                ],
                "recommendations": [
                    "Authorize final release deployment to production staging"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "Executive_Release_Authorization.md",
                        "content": f"# Executive Release Authorization: {project_name}\n\n## Decision\nAPPROVED FOR PRODUCTION DEPLOYMENT.\n\nAll phase gates ratified.\n"
                    }
                ]
            }

        elif agent_id == "AnalyticsAgent":
            return {
                **base,
                "summary": f"Synthesized holistic Product Health Score and executive performance radar for {project_name}.",
                "findings": [
                    "Computed Product Health Score: 98/100",
                    "Architecture Quality Index: 96%",
                    "Security & Compliance Index: 100%",
                    "Requirement Coverage Index: 98%"
                ],
                "recommendations": [
                    "Publish executive benchmark dashboard to leadership portal"
                ],
                "deliverables": [
                    {
                        "type": "report",
                        "title": "Product_Health_Scorecard.json",
                        "content": json.dumps({
                            "healthScore": 98,
                            "indices": {
                                "architecture": 96,
                                "security": 100,
                                "testCoverage": 95,
                                "budgetAdherence": 99
                            }
                        }, indent=2)
                    }
                ]
            }

        # Fallback generic structured deliverable
        return {
            **base,
            "summary": f"{agent_id} completed phase analysis for {project_name}.",
            "findings": ["Task objectives fulfilled", "Deliverables synthesized"],
            "recommendations": ["Proceed to downstream dependent phase"],
            "deliverables": [
                {
                    "type": "specification",
                    "title": f"{agent_id}_Output.md",
                    "content": f"# Deliverable from {agent_id}\nCompleted successfully for {project_name}."
                }
            ]
        }
