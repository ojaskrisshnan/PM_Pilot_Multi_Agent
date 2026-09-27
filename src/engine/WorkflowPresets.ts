import type { AgentId, RiskLevel, UserStory, ADR, RiskItem } from '../types/agent';

export interface WorkflowStepDefinition {
  agent: AgentId;
  phase: string;
  estimated_days: number;
  risk: RiskLevel;
  dependencies: AgentId[];
  summary: string;
  tool_calls: Array<{ tool: string; args: Record<string, any>; result: Record<string, any> }>;
  payload: Record<string, any>;
  memoryUpdates: {
    requirements?: Array<{ id: string; title: string; type: any; priority: any; description: string; acceptance: string[] }>;
    stories?: UserStory[];
    decisions?: ADR[];
    risks?: RiskItem[];
    architecture?: Partial<{ topology: string; database: string; services: Array<{ name: string; tech: string; description: string }>; slas: any }>;
    financials?: Partial<{ totalBudget: number; spentBudget: number; infraCostMonthly: number; laborCost: number; roiProjection: string; breakEvenMonths: number; breakdown: any[] }>;
    analytics?: Partial<{ healthScore: number; securityIndex: number; qualityScore: number; timelineDaysTotal: number; criticalPathDays: number; completedSteps: number; totalSteps: number; northStarMetric: string; kpis: any[] }>;
  };
}

export const EVENT_PLATFORM_WORKFLOW: WorkflowStepDefinition[] = [
  // 1. ProductManagerAgent
  {
    agent: 'ProductManagerAgent',
    phase: 'Discovery & Vision Elicitation',
    estimated_days: 2,
    risk: 'Low',
    dependencies: [],
    summary: 'Analyzed user request for "Event Management Platform". Formulated project scope, charter, milestone roadmap, and initialized multi-agent orchestration.',
    tool_calls: [
      {
        tool: 'create_roadmap',
        args: { project_name: 'Event Management Platform', target_launch: 'Q4 2026' },
        result: { roadmap_id: 'ROADMAP-2026-EVENT', milestone_count: 5 }
      }
    ],
    payload: {
      project_name: 'Event Management Platform',
      vision: 'A modern, high-concurrency event ticketing, attendee check-in, and venue management platform with real-time analytics.',
      milestones: [
        'Milestone 1: Core Elicitation & Architecture Blueprint (Days 1-5)',
        'Milestone 2: Backend APIs & Client UI Construction (Days 6-18)',
        'Milestone 3: QA Automation & Security Audit (Days 19-24)',
        'Milestone 4: Infrastructure Provisioning & DevOps (Days 25-28)',
        'Milestone 5: GTM Launch & Executive Handover (Days 29-32)'
      ]
    },
    memoryUpdates: {
      analytics: { healthScore: 98, totalSteps: 17, completedSteps: 1 }
    }
  },
  // 2. RequirementAgent
  {
    agent: 'RequirementAgent',
    phase: 'Requirements Elicitation',
    estimated_days: 3,
    risk: 'Low',
    dependencies: ['ProductManagerAgent'],
    summary: 'Defined 14 core functional and non-functional requirements, 3 user personas (Event Organizer, Attendee, Venue Admin), and acceptance criteria.',
    tool_calls: [
      {
        tool: 'extract_user_stories',
        args: { domain: 'Event Management' },
        result: { extracted_stories: 14, personas_created: 3 }
      }
    ],
    payload: {
      personas: [
        { name: 'Sarah (Organizer)', goal: 'Create events, manage ticket tiers, and view real-time sales revenue.' },
        { name: 'Alex (Attendee)', goal: 'Browse local events, purchase tickets via Apple Pay/Credit Card, receive instant QR pass.' },
        { name: 'Marcus (Venue Admin)', goal: 'Scan QR codes at door with sub-500ms latency and monitor gate capacity.' }
      ],
      scope_boundaries: {
        in_scope: ['Ticketing Engine', 'QR Code Gate Scanner', 'Stripe Payments', 'Organizer Analytics'],
        out_of_scope: ['In-person physical cash register hardware integration']
      }
    },
    memoryUpdates: {
      requirements: [
        { id: 'REQ-1', title: 'High-Concurrency Ticket Booking', type: 'Functional', priority: 'Must Have', description: 'Handle 5,000 requests/sec during drop events without double booking.', acceptance: ['Zero race conditions', 'Sub-300ms reservation lock'] },
        { id: 'REQ-2', title: 'Dynamic QR Code Generation & Verification', type: 'Functional', priority: 'Must Have', description: 'Encrypted offline-verifiable QR code pass generation.', acceptance: ['Offline verification capable', 'AES-256 HMAC payload'] },
        { id: 'REQ-3', title: 'PCI-DSS Compliant Payment Gateway', type: 'Security', priority: 'Must Have', description: 'Stripe API integration for multi-currency processing.', acceptance: ['PCI-DSS Level 1 compliance', 'Webhook retry handling'] }
      ]
    }
  },
  // 3. BusinessAnalystAgent
  {
    agent: 'BusinessAnalystAgent',
    phase: 'Market Feasibility & Monetization',
    estimated_days: 3,
    risk: 'Low',
    dependencies: ['RequirementAgent'],
    summary: 'Evaluated TAM ($14.2B global event software market). Modeled 3.5% + $0.99 per ticket transaction fee model with 480% 3-year ROI projection.',
    tool_calls: [
      {
        tool: 'evaluate_tam_sam',
        args: { category: 'Event Tech & Ticketing' },
        result: { TAM: '$14.2B', SAM: '$2.8B', SOM: '$150M' }
      }
    ],
    payload: {
      market_size: { TAM: '$14.2 Billion', SAM: '$2.8 Billion', SOM: '$150 Million (Year 3)' },
      monetization: [
        'Tier 1: Free Events (0% fee)',
        'Tier 2: Standard Ticket Sales (3.5% + $0.99 / ticket)',
        'Tier 3: Enterprise Custom Venue Licensing ($1,200/mo base + custom SLAs)'
      ],
      competitor_matrix: [
        { competitor: 'Eventbrite', weakness: 'High fees (3.7% + $1.79), slow payout cycles' },
        { competitor: 'Luma', weakness: 'Limited large venue gate scanning hardware support' }
      ]
    },
    memoryUpdates: {
      financials: { roiProjection: '480% over 36 months', breakEvenMonths: 9 }
    }
  },
  // 4. ArchitectureAgent
  {
    agent: 'ArchitectureAgent',
    phase: 'System Topology & Data Architecture',
    estimated_days: 4,
    risk: 'Medium',
    dependencies: ['BusinessAnalystAgent'],
    summary: 'Designed Distributed Microservices Architecture with Node.js/Go backend services, PostgreSQL (partitioned), Redis Cluster caching, and NATS event stream.',
    tool_calls: [
      {
        tool: 'design_system_topology',
        args: { scale_users: 500000 },
        result: { services: 5, db: 'PostgreSQL + Redis', message_broker: 'NATS JetStream' }
      }
    ],
    payload: {
      architecture_style: 'Event-Driven Microservices',
      services: [
        { name: 'Auth & Identity Service', tech: 'Node.js / Express / OAuth2', description: 'User management & RBAC' },
        { name: 'Event Management Service', tech: 'Go / Fiber', description: 'Event creation & inventory tracking' },
        { name: 'Ticketing & Inventory Engine', tech: 'Go / Redis Lua scripts', description: 'High-speed ticket locking engine' },
        { name: 'Payment Bridge Service', tech: 'Node.js / Stripe SDK', description: 'Webhooks & payment settlement' },
        { name: 'QR Gate Verification Service', tech: 'Elixir / Phoenix', description: 'Real-time WebSocket door scan validation' }
      ],
      slas: { latency: 'P99 < 85ms', uptime: '99.99%', throughput: '10,000 RPS' }
    },
    memoryUpdates: {
      architecture: {
        topology: 'Microservices with NATS JetStream & Redis Cluster',
        database: 'PostgreSQL 16 with Row-Level Locking & TimescaleDB telemetry',
        services: [
          { name: 'Auth Service', tech: 'Node.js', description: 'JWT & OAuth2' },
          { name: 'Ticketing Service', tech: 'Go', description: 'Inventory & Locking' },
          { name: 'Gate Verification', tech: 'Elixir', description: 'WebSocket Scanner' }
        ],
        slas: { latency: '< 85ms P99', uptime: '99.99%', throughput: '10,000 RPS' }
      },
      decisions: [
        { id: 'ADR-1', adrNumber: 1, title: 'Use Redis Lua Scripting for Ticket Inventory Locks', status: 'Accepted', context: 'Prevent race conditions when 1,000 users attempt buying 1 ticket simultaneously.', decision: 'Execute atomic inventory decrement via Redis Lua scripts before database transaction.', impact: 'Guarantees zero overbooking with sub-5ms lock latency.' },
        { id: 'ADR-2', adrNumber: 2, title: 'Adopt NATS JetStream for Event Sourcing', status: 'Accepted', context: 'Asynchronous event distribution for payment confirmation and notification broadcasting.', decision: 'Utilize NATS JetStream for lightweight, sub-millisecond event streaming.', impact: 'Decouples ticket checkout from email/SMS receipt delivery.' }
      ]
    }
  },
  // 5. UIUXAgent
  {
    agent: 'UIUXAgent',
    phase: 'UI/UX Journey & Design Tokens',
    estimated_days: 4,
    risk: 'Low',
    dependencies: ['ArchitectureAgent'],
    summary: 'Created dark-mode modern design system with glassmorphic cards, 4-step ticket purchase funnel, and WCAG 2.1 AA accessible color palette.',
    tool_calls: [
      {
        tool: 'generate_wireframe_tree',
        args: { screens: ['Organizer Dashboard', 'Event Discovery Page', 'Checkout Modal', 'Scanner Mobile App'] },
        result: { component_count: 32, design_tokens: 'Dark Theme Slate/Violet' }
      }
    ],
    payload: {
      design_system: {
        primary_color: '#6366F1 (Indigo)',
        secondary_color: '#10B981 (Emerald)',
        background: '#0F172A (Dark Slate)',
        font_family: 'Inter, system-ui, sans-serif'
      },
      user_funnel_steps: [
        '1. Event Discovery & Tier Selection',
        '2. Seat / Ticket Allocation & Hold (10 min timer)',
        '3. One-Click Express Payment (Stripe/Apple Pay)',
        '4. Interactive QR Pass & Add-to-Apple-Wallet'
      ]
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-101', epic: 'Ticket Purchase', title: 'Interactive Seat Map Selection', description: 'Allow users to select seats from visual SVG venue layout', points: 5, priority: 'High', status: 'In_Progress', assignee: 'FrontendAgent' },
        { id: 'STORY-102', epic: 'Organizer Portal', title: 'Real-Time Sales Heatmap Dashboard', description: 'Display ticket sales speed graphs updated via WebSockets', points: 8, priority: 'High', status: 'To_Do', assignee: 'FrontendAgent' }
      ]
    }
  },
  // 6. BackendAgent
  {
    agent: 'BackendAgent',
    phase: 'API Specification & Backend Engineering',
    estimated_days: 6,
    risk: 'Medium',
    dependencies: ['ArchitectureAgent'],
    summary: 'Published OpenAPI 3.0 REST spec covering 22 endpoints, gRPC internal service definitions, and JWT RBAC authentication middleware.',
    tool_calls: [
      {
        tool: 'generate_openapi_spec',
        args: { modules: ['Auth', 'Events', 'Tickets', 'Payments', 'Scanner'] },
        result: { total_endpoints: 22, openapi_version: '3.0.3' }
      }
    ],
    payload: {
      endpoints: [
        'POST /api/v1/auth/register - User registration',
        'GET /api/v1/events - Search & filter upcoming events',
        'POST /api/v1/tickets/reserve - Atomic ticket reservation lock',
        'POST /api/v1/payments/checkout - Process Stripe payment intent',
        'GET /api/v1/gate/verify-qr - Offline/Online QR verification endpoint'
      ],
      database_models: ['User', 'Event', 'TicketTier', 'Reservation', 'Transaction', 'CheckInLog']
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-201', epic: 'Backend API', title: 'Redis Atomic Reservation Endpoint', description: 'Implement POST /api/v1/tickets/reserve with Lua Scripting', points: 8, priority: 'Critical', status: 'In_Progress', assignee: 'BackendAgent' },
        { id: 'STORY-202', epic: 'Backend API', title: 'Stripe Webhook Listener Engine', description: 'Handle payment success, refund, and chargeback webhooks', points: 5, priority: 'High', status: 'To_Do', assignee: 'BackendAgent' }
      ]
    }
  },
  // 7. FrontendAgent
  {
    agent: 'FrontendAgent',
    phase: 'Frontend Architecture & Client State',
    estimated_days: 5,
    risk: 'Low',
    dependencies: ['UIUXAgent', 'BackendAgent'],
    summary: 'Structured React 19 + Vite + TypeScript web application with Zustand client state, Tailwind CSS v4 styling, and React Query data caching.',
    tool_calls: [
      {
        tool: 'plan_frontend_stack',
        args: { framework: 'React + TypeScript + Vite' },
        result: { state_management: 'Zustand + TanStack Query', bundle_budget: '< 180kb gzip' }
      }
    ],
    payload: {
      frontend_routes: [
        '/ - Landing & Trending Events',
        '/event/:id - Event Details & Seat Selector',
        '/checkout/:reservationId - Payment Checkout Flow',
        '/organizer/dashboard - Live Sales & Attendee Stats',
        '/pass/:ticketId - Mobile QR Ticket Display'
      ],
      optimizations: ['Dynamic Code Splitting', 'Web Worker QR scanning', 'PWA Offline Pass Storage']
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-301', epic: 'Client Portal', title: 'Mobile-Optimized Ticket Scanner App', description: 'Camera QR scanner interface using WebRTC video stream', points: 5, priority: 'High', status: 'To_Do', assignee: 'FrontendAgent' }
      ]
    }
  },
  // 8. QAAgent
  {
    agent: 'QAAgent',
    phase: 'QA Automation & Master Test Strategy',
    estimated_days: 4,
    risk: 'Low',
    dependencies: ['BackendAgent', 'FrontendAgent'],
    summary: 'Formulated Master Test Strategy: 120 Unit tests, 45 Integration API tests (Supertest), 15 Playwright E2E scenarios, and Locust concurrency load testing for 5,000 RPS drops.',
    tool_calls: [
      {
        tool: 'build_test_suite',
        args: { endpoints: ['reserve', 'checkout', 'verify-qr'] },
        result: { test_cases: 180, coverage_target: '88%' }
      }
    ],
    payload: {
      test_breakdown: {
        unit_tests: '120 test cases (Jest / Vitest)',
        api_integration: '45 endpoint scenarios (Supertest)',
        e2e_playwright: '15 checkout & ticket purchase flows',
        load_testing: 'Locust load script: 5,000 concurrent ticket buyers'
      },
      quality_gates: ['Coverage > 85%', 'Zero P0/P1 open bugs', 'P99 Latency under load < 250ms']
    },
    memoryUpdates: {
      analytics: { qualityScore: 94 }
    }
  },
  // 9. DevOpsAgent
  {
    agent: 'DevOpsAgent',
    phase: 'Cloud Infrastructure & CI/CD Pipeline',
    estimated_days: 4,
    risk: 'Medium',
    dependencies: ['ArchitectureAgent', 'QAAgent'],
    summary: 'Authored Terraform IaC scripts for AWS EKS (Kubernetes), ElastiCache Redis, RDS PostgreSQL Aurora, and GitHub Actions blue/green deployment workflow.',
    tool_calls: [
      {
        tool: 'generate_cicd_pipeline',
        args: { provider: 'AWS EKS + GitHub Actions' },
        result: { pipeline_steps: 6, deployment_strategy: 'Blue/Green Kubernetes Rollout' }
      }
    ],
    payload: {
      cloud_provider: 'AWS (us-east-1)',
      infrastructure: [
        'EKS Kubernetes Cluster (Auto-scaling 3-15 nodes)',
        'RDS PostgreSQL Aurora Serverless v2 (Multi-AZ)',
        'ElastiCache Redis Cluster (3 shards)',
        'CloudFront CDN + AWS WAF'
      ],
      cicd_pipeline: 'GitHub Actions -> Docker Build -> ECR -> Helm Deploy to EKS'
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-401', epic: 'DevOps', title: 'Terraform AWS Infra Scripting', description: 'Provision EKS, RDS Aurora, and ElastiCache via Terraform', points: 8, priority: 'High', status: 'To_Do', assignee: 'DevOpsAgent' }
      ]
    }
  },
  // 10. SecurityAgent
  {
    agent: 'SecurityAgent',
    phase: 'Security Audit & Compliance Review',
    estimated_days: 3,
    risk: 'Medium',
    dependencies: ['DevOpsAgent', 'BackendAgent'],
    summary: 'Executed STRIDE threat analysis. Audited OWASP Top 10 risks. Enforced AES-256 dynamic QR ticket signature tokenization and PCI-DSS Level 1 compliance rules.',
    tool_calls: [
      {
        tool: 'audit_threat_model',
        args: { components: ['Payment Endpoint', 'QR Pass Token', 'Auth Middleware'] },
        result: { threats_identified: 4, mitigation_status: '100% Mitigated' }
      }
    ],
    payload: {
      threat_model: [
        { threat: 'QR Code Screenshot Replay', severity: 'High', mitigation: 'Dynamic TOTP nonce embedded in QR code refreshed every 15s.' },
        { threat: 'Ticket Scalping Bot Floods', severity: 'High', mitigation: 'AWS WAF rate limiting + Cloudflare Turnstile bot detection.' }
      ],
      compliance: ['GDPR Compliant Data Anonymization', 'PCI-DSS Tokenization via Stripe Elements']
    },
    memoryUpdates: {
      analytics: { securityIndex: 96 },
      risks: [
        { id: 'RISK-SEC-1', title: 'QR Ticket Screenshot Duplication Risk', category: 'Security', impact: 4, likelihood: 2, score: 8, riskLevel: 'Medium', mitigation: 'Dynamic TOTP refreshing QR algorithm', owner: 'SecurityAgent' }
      ]
    }
  },
  // 11. FinanceAgent
  {
    agent: 'FinanceAgent',
    phase: 'Budget Allocation & Financial Modeling',
    estimated_days: 2,
    risk: 'Low',
    dependencies: ['DevOpsAgent'],
    summary: 'Calculated Monthly Infrastructure Cost ($1,850/mo), Labor Development Budget ($42,000), and projected 84% gross margins at 50,000 ticket sales/mo.',
    tool_calls: [
      {
        tool: 'calculate_tco',
        args: { user_scale: 500000 },
        result: { monthly_cloud_cost: 1850, total_dev_budget: 42000, margin: '84%' }
      }
    ],
    payload: {
      budget_allocation: [
        { category: 'Engineering & Development', amount: 28000, percentage: 62 },
        { category: 'Cloud Infrastructure & Security', amount: 6500, percentage: 14 },
        { category: 'UI/UX & Design Assets', amount: 5000, percentage: 11 },
        { category: 'Contingency & Reserves', amount: 5500, percentage: 13 }
      ],
      monthly_run_rate: '$1,850 AWS / Cloudflare infra expense'
    },
    memoryUpdates: {
      financials: {
        totalBudget: 45000,
        spentBudget: 12500,
        infraCostMonthly: 1850,
        laborCost: 28000,
        roiProjection: '480% over 3 years',
        breakEvenMonths: 9,
        breakdown: [
          { category: 'Engineering Labor', amount: 28000, percentage: 62 },
          { category: 'Cloud & DevOps Infra', amount: 6500, percentage: 14 },
          { category: 'UI/UX Design', amount: 5000, percentage: 11 },
          { category: 'Contingency Reserve', amount: 5500, percentage: 13 }
        ]
      }
    }
  },
  // 12. RiskAgent
  {
    agent: 'RiskAgent',
    phase: 'Risk Analysis & Contingency Planning',
    estimated_days: 2,
    risk: 'Medium',
    dependencies: ['FinanceAgent', 'SecurityAgent'],
    summary: 'Synthesized 5x5 Project Risk Register across 5 risk domains. Formulated contingency triggers and fallback pathways.',
    tool_calls: [
      {
        tool: 'generate_risk_matrix',
        args: { risks: ['High Concurrency Spike', 'Stripe Outage', 'Venue Offline Gate Connectivity'] },
        result: { high_risks: 2, medium_risks: 3, low_risks: 4 }
      }
    ],
    payload: {
      top_risks: [
        { risk: 'High Concurrency Spike during Ticket Drops', impact: 5, likelihood: 3, mitigation: 'Pre-warmed ElastiCache nodes & automated K8s Horizontal Pod Autoscaling.' },
        { risk: 'Venue Offline Network Failure at Entry Gate', impact: 4, likelihood: 2, mitigation: 'Local PWA SQLite cache for offline QR validation.' },
        { risk: 'Payment Gateway Webhook Delays', impact: 3, likelihood: 3, mitigation: 'NATS queue retry mechanism with exponential backoff.' }
      ]
    },
    memoryUpdates: {
      risks: [
        { id: 'RISK-1', title: 'Ticket Drop Concurrency Spike (5,000+ RPS)', category: 'Technical', impact: 5, likelihood: 3, score: 15, riskLevel: 'High', mitigation: 'ElastiCache cluster + K8s Autoscaler', owner: 'ArchitectureAgent' },
        { id: 'RISK-2', title: 'Venue Cellular Signal Outage at Gate Scanner', category: 'Operational', impact: 4, likelihood: 3, score: 12, riskLevel: 'Medium', mitigation: 'Offline local PWA SQLite caching', owner: 'FrontendAgent' },
        { id: 'RISK-3', title: 'Third-Party Stripe Gateway Webhook Latency', category: 'Financial', impact: 3, likelihood: 3, score: 9, riskLevel: 'Medium', mitigation: 'NATS event streaming retry worker', owner: 'BackendAgent' }
      ]
    }
  },
  // 13. MarketingAgent
  {
    agent: 'MarketingAgent',
    phase: 'Go-to-Market (GTM) Strategy',
    estimated_days: 3,
    risk: 'Low',
    dependencies: ['BusinessAnalystAgent'],
    summary: 'Created GTM Blueprint targeting mid-sized music festivals and tech conferences. Designed Product Hunt launch campaign kit and referral incentives.',
    tool_calls: [
      {
        tool: 'create_gtm_plan',
        args: { channels: ['Product Hunt', 'LinkedIn Event Tech', 'Direct Festival Sales'] },
        result: { launch_channels: 4, acquisition_target: '50 event organizers in Month 1' }
      }
    ],
    payload: {
      campaign_highlights: [
        'Product Hunt Debut Launch ("Zero-Fee Ticket Platform for Independent Creators")',
        'Inbound Content Hub: "How to Host 10k Attendee Drops Without Server Crashes"',
        'Direct Sales Outreach to 250 Regional Music Venue Operators'
      ]
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-501', epic: 'Marketing & GTM', title: 'Product Hunt Launch Page & Media Assets', description: 'Create demo video, screenshots, and promo landing page', points: 3, priority: 'Medium', status: 'To_Do', assignee: 'MarketingAgent' }
      ]
    }
  },
  // 14. DocumentationAgent
  {
    agent: 'DocumentationAgent',
    phase: 'Technical Documentation & Developer Portal',
    estimated_days: 3,
    risk: 'Low',
    dependencies: ['BackendAgent', 'ArchitectureAgent'],
    summary: 'Compiled Developer API Portal, OpenAPI 3.0 Interactive Docs, Admin System Runbook, and Architecture Decision Records (ADRs).',
    tool_calls: [
      {
        tool: 'compile_docs',
        args: { target: 'Developer Portal + Admin Runbook' },
        result: { docs_pages: 18, openapi_spec_valid: true }
      }
    ],
    payload: {
      docs_published: [
        'Interactive OpenAPI 3.0 Swagger Developer Portal',
        'Venue Gate Scanner PWA Installation Guide',
        'DevOps Incident Recovery & Database Backup Runbook',
        'API Authentication & Rate Limiting Guidelines'
      ]
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-601', epic: 'Documentation', title: 'OpenAPI Developer Portal Deployment', description: 'Host interactive Swagger UI for external event integrations', points: 3, priority: 'Medium', status: 'Done', assignee: 'DocumentationAgent' }
      ]
    }
  },
  // 15. AnalyticsAgent
  {
    agent: 'AnalyticsAgent',
    phase: 'Telemetry & Product Analytics Schema',
    estimated_days: 2,
    risk: 'Low',
    dependencies: ['UIUXAgent', 'RequirementAgent'],
    summary: 'Established Product North Star Metric ("Tickets Booked Successfully per Second") and event taxonomy schema for Mixpanel & Amplitude tracking.',
    tool_calls: [
      {
        tool: 'define_telemetry_schema',
        args: { events: ['event_viewed', 'seat_selected', 'checkout_started', 'ticket_purchased', 'qr_scanned'] },
        result: { event_count: 14, schema_type: 'Mixpanel Tracking Spec' }
      }
    ],
    payload: {
      north_star_metric: 'Successful Ticket Purchases per Minute',
      kpis: [
        { name: 'Checkout Conversion Rate', target: '> 68%', current: '72%', status: 'Good' },
        { name: 'Gate Scan Speed P95', target: '< 600ms', current: '380ms', status: 'Good' },
        { name: 'User Drop-off Rate at Payment', target: '< 12%', current: '9.4%', status: 'Good' }
      ]
    },
    memoryUpdates: {
      analytics: {
        northStarMetric: 'Successful Ticket Bookings / Minute',
        kpis: [
          { name: 'Checkout Funnel Conversion', target: '65%', current: '72%', status: 'Good' },
          { name: 'Gate Scan Verification Speed', target: '< 500ms', current: '380ms', status: 'Good' },
          { name: 'System P99 API Latency', target: '< 100ms', current: '62ms', status: 'Good' }
        ]
      }
    }
  },
  // 16. CommunicationAgent
  {
    agent: 'CommunicationAgent',
    phase: 'Internal Team Alignment & Status Broadcast',
    estimated_days: 1,
    risk: 'Low',
    dependencies: ['QAAgent', 'DevOpsAgent'],
    summary: 'Broadcasted Daily Standup Digest & Milestone Completion Notice across team Slack channels and sync dashboards.',
    tool_calls: [
      {
        tool: 'send_team_digest',
        args: { updates: ['Backend API Complete', 'DevOps EKS Infra Live', 'QA Load Testing Passed'] },
        result: { slack_channels_notified: ['#event-platform-build', '#sdlc-orchestration'] }
      }
    ],
    payload: {
      slack_digest: '🚀 *PMPilot SDLC Orchestration Update*\n• Backend APIs & Database Schema: Completed\n• Cloud Infra & EKS Deployment: Provisioned\n• Next Focus: Final Security Gate Review & Executive Handover.'
    },
    memoryUpdates: {
      stories: [
        { id: 'STORY-701', epic: 'Communication', title: 'Automated Slack Status Webhook', description: 'Configure automated notification bot for CI/CD and deployment alerts', points: 2, priority: 'Low', status: 'Done', assignee: 'CommunicationAgent' }
      ]
    }
  },
  // 17. StakeholderAgent
  {
    agent: 'StakeholderAgent',
    phase: 'Executive Alignment & Final Handover',
    estimated_days: 1,
    risk: 'Low',
    dependencies: ['ProductManagerAgent', 'FinanceAgent', 'RiskAgent'],
    summary: 'Prepared Executive Briefing Deck for C-Suite. Confirmed project readiness score of 96/100 and validated $45k budget compliance.',
    tool_calls: [
      {
        tool: 'create_exec_brief',
        args: { metrics: { readiness: '96/100', total_days: 28, budget: '$45,000' } },
        result: { executive_deck_status: 'Approved by VP of Engineering & CPO' }
      }
    ],
    payload: {
      executive_summary: 'The Event Management Platform SDLC workflow has successfully completed orchestration across all 16 domain agents. System design is resilient (sub-85ms P99 latency), security compliant (PCI-DSS & GDPR), and fully within the $45,000 budget allocation with a target launch timeline of 28 business days.',
      readiness_score: '96 / 100'
    },
    memoryUpdates: {
      analytics: { healthScore: 97, completedSteps: 17, totalSteps: 17 }
    }
  }
];
