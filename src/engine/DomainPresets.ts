import type {
  Requirement,
  Epic,
  UserStory,
  Decision,
  Risk,
  Artifact,
  Milestone,
  FinancialParams,
  DbEntity,
  TestCase,
  Approval
} from '../types/project';

export interface DomainPresetData {
  key: string;
  name: string;
  domain: string;
  tagline: string;
  description: string;
  scaleConstraints: string;
  targetLaunch: string;
  financialParams: FinancialParams;
  requirements: Requirement[];
  epics: Epic[];
  stories: UserStory[];
  decisions: Decision[];
  risks: Risk[];
  artifacts: Artifact[];
  milestones: Milestone[];
  dbEntities?: DbEntity[];
  testCases?: TestCase[];
  approvals?: Approval[];
}

export const DOMAIN_PRESETS: Record<string, DomainPresetData> = {
  event_management: {
    key: 'event_management',
    name: 'EventPulse: High-Concurrency Event & Ticketing Platform',
    domain: 'Enterprise SaaS / Ticketing & Venue Systems',
    tagline: '5,000 RPS Peak Ticketing Engine with Atomic Redis Lua Locking & Offline QR Gate Access',
    description: 'A distributed high-throughput event management platform engineered for tier-1 concerts and sports tournaments. Features millisecond-level seat reservation, offline cryptographic QR check-in, and real-time organizer revenue streams.',
    scaleConstraints: 'Peak 5,000 RPS booking flash drops, <45ms P99 reservation latency, zero double-booking tolerance.',
    targetLaunch: 'Q4 2026 (28-day critical path)',
    financialParams: {
      teamSize: 4,
      blendedHourlyRate: 75,
      cloudTier: 'Growth',
      contingencyPercent: 15
    },
    requirements: [
      {
        id: 'REQ-EVT-01',
        title: 'High-Concurrency Atomic Ticket Reservation',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Process 5,000 concurrent booking requests per second during flash ticket drops without database deadlocks.',
        metricValue: '5,000 RPS',
        acceptance: [
          'Inventory decremented atomically via Redis Lua script before DB commit',
          'Reservation lock expires automatically after 600 seconds if unpaid',
          'Zero duplicate seat allocation race conditions under Locust load test'
        ],
        affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'QAAgent', 'DevOpsAgent']
      },
      {
        id: 'REQ-EVT-02',
        title: 'Offline Dynamic QR Gate Verification',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Venue gate staff mobile scanners must validate attendee tickets offline with sub-400ms scan speed.',
        metricValue: 'sub-400ms scan',
        acceptance: [
          'Time-based cryptographic TOTP rotating tokens inside QR payload',
          'Local PWA cache with venue public verification key',
          'Instant biometric or camera barcode capture'
        ],
        affectedAgents: ['FrontendAgent', 'BackendAgent', 'SecurityAgent']
      },
      {
        id: 'REQ-EVT-03',
        title: 'PCI-DSS Level 1 Payment Gateway',
        type: 'Security',
        priority: 'Must Have',
        description: 'Multi-currency checkout supporting credit cards, Apple Pay, and Google Pay with zero raw PAN storage.',
        metricValue: '100% PCI-DSS Tokenized',
        acceptance: [
          'Direct Stripe/Adyen client-side iframe tokenization',
          'Automated webhook reconciliation with idempotent idempotency-keys',
          'Automated PDF tax receipt dispatch via SES'
        ],
        affectedAgents: ['SecurityAgent', 'BackendAgent', 'FinanceAgent']
      },
      {
        id: 'REQ-EVT-04',
        title: 'Real-Time Organizer Analytics Stream',
        type: 'Non-Functional',
        priority: 'Should Have',
        description: 'Stream live check-in rates, gate throughput, and gross merchandise value (GMV) to organizer dashboards.',
        metricValue: '<200ms websocket latency',
        acceptance: [
          'Event streaming over NATS JetStream topics',
          'Live WebSocket subscription to browser client dashboard',
          'Auto-aggregating 1-minute time series rollups'
        ],
        affectedAgents: ['ArchitectureAgent', 'FrontendAgent', 'AnalyticsAgent']
      }
    ],
    epics: [
      { id: 'EPIC-EVT-1', title: 'Ticketing & Core Inventory Engine', description: 'High-speed atomic reservations and queue management', priority: 'Critical' },
      { id: 'EPIC-EVT-2', title: 'Gate Access & QR Cryptography', description: 'Mobile scanner PWA with offline verification', priority: 'High' },
      { id: 'EPIC-EVT-3', title: 'Payment Processing & Financials', description: 'PCI-DSS checkout and organizer revenue share', priority: 'Critical' },
      { id: 'EPIC-EVT-4', title: 'Organizer Command Center', description: 'Real-time telemetry, heatmaps, and gate capacity', priority: 'Medium' }
    ],
    stories: [
      {
        id: 'STORY-EVT-101',
        epicId: 'EPIC-EVT-1',
        epic: 'Ticketing & Core Inventory Engine',
        title: 'Redis Lua Script for Atomic Seat Hold',
        description: 'Implement atomic ticket count decrement with Redis Lua script to eliminate PostgreSQL row contention.',
        points: 8,
        priority: 'Critical',
        status: 'In_Progress',
        assignee: 'BackendAgent',
        acceptanceCriteria: ['Script executes in <2ms', 'Rollback key on lock timeout', 'Cluster safe hash tags'],
        tasks: [
          { id: 'TASK-101-1', storyId: 'STORY-EVT-101', title: 'Write lua reserve script', status: 'Completed', assignee: 'BackendAgent', durationHours: 6 },
          { id: 'TASK-101-2', storyId: 'STORY-EVT-101', title: 'Unit test lock timeout under concurrency', status: 'Pending', assignee: 'QAAgent', durationHours: 4 }
        ]
      },
      {
        id: 'STORY-EVT-102',
        epicId: 'EPIC-EVT-1',
        epic: 'Ticketing & Core Inventory Engine',
        title: 'Interactive SVG Venue Seating Map',
        description: 'Synthesize interactive canvas seat picker with tier color coding, zoom, and live seat state indicators.',
        points: 5,
        priority: 'High',
        status: 'In_Progress',
        assignee: 'FrontendAgent',
        acceptanceCriteria: ['Renders 10,000 seats at 60 FPS', 'Touch pinch-to-zoom on mobile', 'ARIA accessible labels'],
        tasks: [
          { id: 'TASK-102-1', storyId: 'STORY-EVT-102', title: 'Build React canvas seating component', status: 'Completed', assignee: 'FrontendAgent', durationHours: 12 },
          { id: 'TASK-102-2', storyId: 'STORY-EVT-102', title: 'Hook websocket real-time seat lock state', status: 'Pending', assignee: 'FrontendAgent', durationHours: 6 }
        ]
      },
      {
        id: 'STORY-EVT-103',
        epicId: 'EPIC-EVT-2',
        epic: 'Gate Access & QR Cryptography',
        title: 'HMAC-SHA256 Dynamic QR Token Generator',
        description: 'Encode ticket identity with rotating TOTP seed to prevent ticket screenshot sharing and scalping.',
        points: 5,
        priority: 'Critical',
        status: 'To_Do',
        assignee: 'SecurityAgent',
        acceptanceCriteria: ['QR code refreshes every 15s', 'Works offline with signed ECDSA public key', 'Replay cache prevents double scan'],
        tasks: []
      },
      {
        id: 'STORY-EVT-104',
        epicId: 'EPIC-EVT-3',
        epic: 'Payment Processing & Financials',
        title: 'Stripe Payment Element & Idempotency Webhook',
        description: 'Build checkout session with Stripe SDK and transactional webhook listener updating order state in DB.',
        points: 5,
        priority: 'Critical',
        status: 'To_Do',
        assignee: 'BackendAgent',
        acceptanceCriteria: ['Idempotency key enforced', 'Zero raw card numbers touch API', 'Automatic refund on booking cancel'],
        tasks: []
      },
      {
        id: 'STORY-EVT-105',
        epicId: 'EPIC-EVT-4',
        epic: 'Organizer Command Center',
        title: 'NATS JetStream Gate Telemetry Pipeline',
        description: 'Deploy NATS cluster for ingesting entry gate scans and broadcasting live capacity count to web UI.',
        points: 5,
        priority: 'Medium',
        status: 'To_Do',
        assignee: 'DevOpsAgent',
        acceptanceCriteria: ['Sub-50ms message propagation', 'Durable stream consumer persistence', 'Prometheus exporter configured'],
        tasks: []
      }
    ],
    decisions: [
      {
        id: 'ADR-EVT-001',
        adrNumber: 1,
        title: 'Redis Lua Scripting for Atomic Ticket Reservation',
        status: 'Accepted',
        context: 'High-demand concert drops trigger 5,000 RPS causing database row-level locking deadlocks in PostgreSQL.',
        decision: 'Execute inventory reservations within in-memory Redis cluster using Lua scripts prior to asynchronous database persistence.',
        impact: 'Eliminates DB connection starvation and lowers booking P99 latency to 38ms.',
        proposedBy: 'ArchitectureAgent',
        approvedAt: '2026-09-04T10:00:00Z'
      },
      {
        id: 'ADR-EVT-002',
        adrNumber: 2,
        title: 'NATS JetStream for Event Broadcast and Gate Sync',
        status: 'Accepted',
        context: 'Kafka overhead is disproportionate for lightweight sub-50ms gate check-in telemetry.',
        decision: 'Adopt NATS JetStream for pub/sub event distribution across mobile scanners and organizer dashboard.',
        impact: 'Reduces memory footprint by 70% and guarantees at-least-once message delivery.',
        proposedBy: 'ArchitectureAgent',
        approvedAt: '2026-09-04T10:15:00Z'
      }
    ],
    risks: [
      {
        id: 'RISK-EVT-1',
        title: 'Database Deadlocks During Flash Drop Traffic Spike',
        category: 'Technical',
        probability: 4,
        impact: 5,
        score: 20,
        level: 'Critical',
        mitigation: 'Decouple inventory hold using Redis Lua scripts; queue asynchronous order writes via NATS buffer.',
        owner: 'ArchitectureAgent',
        status: 'Mitigated'
      },
      {
        id: 'RISK-EVT-2',
        title: 'Venue Gate Internet Outage Preventing Attendee Check-In',
        category: 'Operational',
        probability: 3,
        impact: 4,
        score: 12,
        level: 'High',
        mitigation: 'Deploy Progressive Web App (PWA) on scanner devices with local IndexedDB cryptographic verification cache.',
        owner: 'SecurityAgent',
        status: 'Mitigated'
      },
      {
        id: 'RISK-EVT-3',
        title: 'PCI-DSS Compliance Breach from Third-Party Log Leakage',
        category: 'Security',
        probability: 2,
        impact: 5,
        score: 10,
        level: 'Medium',
        mitigation: 'Client-side Stripe Elements tokenization; enforce strict PII regex sanitization on all server logs.',
        owner: 'SecurityAgent',
        status: 'Open'
      },
      {
        id: 'RISK-EVT-4',
        title: 'Cloud Run-Rate Overrun under Sustained High RPS',
        category: 'Financial',
        probability: 3,
        impact: 3,
        score: 9,
        level: 'Medium',
        mitigation: 'Implement KEDA horizontal pod autoscaling and scale Redis replicas only during active drop windows.',
        owner: 'FinanceAgent',
        status: 'Open'
      }
    ],
    artifacts: [
      {
        id: 'ART-EVT-ADR',
        name: 'ADR-001: Distributed High-Concurrency Booking Engine',
        filename: 'ADR-001-architecture.md',
        category: 'Architecture',
        language: 'markdown',
        generatingAgent: 'ArchitectureAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `# ADR-001: Distributed High-Concurrency Booking Engine
**Status:** Accepted
**Driver:** High flash-sale traffic (5,000 RPS) causing database contention and race conditions.

## Architectural Decision
We adopt a hybrid in-memory transaction model:
1. **Reservation Tier:** Redis Cluster with Lua scripts implementing atomic compare-and-swap on ticket inventories.
2. **Message Broker:** NATS JetStream for buffering completed reservation tokens.
3. **Persistence Tier:** PostgreSQL 16 managed instance with partitioned order tables.
4. **Offline Gate Sync:** ECDSA asymmetric cryptography for PWA ticket scan validation.

## Consequences & Trade-offs
- **Positive:** Latency is <45ms; zero double-booking; resilient to network partitions.
- **Negative:** Requires Redis sentinel/cluster high-availability setup.`
      },
      {
        id: 'ART-EVT-BACKEND',
        name: 'High-Concurrency Reservation Controller',
        filename: 'server.ts',
        category: 'Backend',
        language: 'typescript',
        generatingAgent: 'BackendAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `import express, { Request, Response } from 'express';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Atomic Lua Script: Check stock > 0, decrement, and create user hold key
const RESERVE_LUA = \`
  local stock = redis.call('get', KEYS[1])
  if not stock or tonumber(stock) <= 0 then
    return 0
  end
  redis.call('decr', KEYS[1])
  redis.call('setex', KEYS[2], ARGV[1], ARGV[2])
  return 1
\`;

app.post('/api/tickets/reserve', async (req: Request, res: Response) => {
  const { eventId, tierId, userId } = req.body;
  const reservationId = uuidv4();
  const stockKey = \`event:\${eventId}:tier:\${tierId}:stock\`;
  const holdKey = \`hold:\${reservationId}\`;

  try {
    const result = await redis.eval(RESERVE_LUA, 2, stockKey, holdKey, 600, userId);
    if (result === 0) {
      return res.status(409).json({ error: 'Sold Out or Contested' });
    }
    return res.status(201).json({
      reservationId,
      status: 'Reserved',
      expiresInSeconds: 600,
      checkoutUrl: \`/checkout/\${reservationId}\`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Reservation Engine Failure' });
  }
});

app.listen(4000, () => console.log('EventPulse Booking Engine running on :4000'));`
      },
      {
        id: 'ART-EVT-SCHEMA',
        name: 'PostgreSQL Relational Schema',
        filename: 'schema.sql',
        category: 'Backend',
        language: 'sql',
        generatingAgent: 'BackendAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `-- PMPilot Generated Database Schema for EventPulse
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  total_capacity INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tier_name VARCHAR(100) NOT NULL,
  price_cents INT NOT NULL,
  available_inventory INT NOT NULL,
  lock_version INT DEFAULT 0
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES ticket_tiers(id),
  user_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'HELD',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_status ON reservations(status, expires_at);`
      },
      {
        id: 'ART-EVT-FRONTEND',
        name: 'Interactive Event Seat Map Component',
        filename: 'EventDashboard.tsx',
        category: 'Frontend',
        language: 'typescript',
        generatingAgent: 'FrontendAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `import React, { useState } from 'react';

interface Seat {
  id: string;
  row: string;
  number: number;
  tier: 'VIP' | 'Standard' | 'Balcony';
  price: number;
  status: 'available' | 'held' | 'booked';
}

export const EventDashboard: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (id: string) => {
    setSelectedSeats(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Select Your Seats (Live Synchronization)</h2>
      <div className="grid grid-cols-8 gap-3 max-w-lg mx-auto my-6">
        {Array.from({ length: 32 }).map((_, idx) => {
          const seatId = \`S-\${idx + 1}\`;
          const isSelected = selectedSeats.includes(seatId);
          return (
            <button
              key={seatId}
              onClick={() => toggleSeat(seatId)}
              className={\`h-10 rounded-lg font-mono text-xs font-bold transition-all \${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 scale-105 ring-2 ring-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }\`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center border-t border-slate-800 pt-4">
        <span>Selected: {selectedSeats.length} seats</span>
        <button className="bg-indigo-600 px-5 py-2 rounded-xl font-bold hover:bg-indigo-500">
          Reserve Tickets (600s Lock)
        </button>
      </div>
    </div>
  );
};`
      },
      {
        id: 'ART-EVT-DEVOPS',
        name: 'Production Multi-Stage Dockerfile',
        filename: 'Dockerfile',
        category: 'DevOps',
        language: 'dockerfile',
        generatingAgent: 'DevOpsAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `# Multi-stage High-Security Container Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 4000
CMD ["node", "dist/server.js"]`
      },
      {
        id: 'ART-EVT-SECURITY',
        name: 'STRIDE Threat Model & Compliance Audit',
        filename: 'stride_threat_model.json',
        category: 'Security',
        language: 'json',
        generatingAgent: 'SecurityAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: JSON.stringify({
          system: 'EventPulse SDLC',
          assessedBy: 'SecurityAgent',
          strideAnalysis: [
            { category: 'Spoofing', threat: 'QR Screenshot Replay', mitigation: 'Dynamic TOTP rotation with 15s expiration' },
            { category: 'Tampering', threat: 'Modifying ticket tier in transit', mitigation: 'HMAC-SHA256 digital signature on tickets' },
            { category: 'Repudiation', threat: 'Chargeback denial', mitigation: 'Stripe 3DS 2.0 biometric challenge logs' },
            { category: 'Information Disclosure', threat: 'Credit card PAN leak', mitigation: 'PCI-DSS iframe tokenization' },
            { category: 'Denial of Service', threat: 'Distributed 50,000 RPS ticket drop flood', mitigation: 'Cloudflare Rate Limiting + Redis Lua token bucket' },
            { category: 'Elevation of Privilege', threat: 'Gate scanner accessing admin API', mitigation: 'JWT scope boundary enforcement (gate:scan only)' }
          ],
          owaspTop10Score: '96% Compliant',
          pciDssLevel: 'Level 1 Ready'
        }, null, 2)
      },
      {
        id: 'ART-EVT-QA',
        name: 'End-to-End Vitest Concurrency Test Suite',
        filename: 'e2e.test.ts',
        category: 'QA',
        language: 'typescript',
        generatingAgent: 'QAAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `import { describe, it, expect } from 'vitest';

describe('EventPulse 5,000 RPS Atomic Reservation Suite', () => {
  it('should guarantee zero duplicate booking when 50 concurrent users target 1 final ticket', async () => {
    const totalRequests = 50;
    const results = await Promise.all(
      Array.from({ length: totalRequests }).map(async (_, idx) => {
        // Simulated reservation call
        const isWinner = idx === 0; // Exactly 1 succeeds in Lua atomic lock
        return isWinner ? 201 : 409;
      })
    );

    const successCount = results.filter(code => code === 201).length;
    const conflictCount = results.filter(code => code === 409).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(49);
  });
});`
      },
      {
        id: 'ART-EVT-OPENAPI',
        name: 'OpenAPI 3.0 API Specification',
        filename: 'openapi.json',
        category: 'Documentation',
        language: 'json',
        generatingAgent: 'DocumentationAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: JSON.stringify({
          openapi: '3.0.3',
          info: { title: 'EventPulse SDLC API', version: '2.4.0', description: 'Enterprise Ticketing & Gate Synchronization API' },
          paths: {
            '/api/tickets/reserve': {
              post: {
                summary: 'Reserve seat in memory',
                responses: { '201': { description: 'Reserved' }, '409': { description: 'Sold out' } }
              }
            }
          }
        }, null, 2)
      }
    ],
    milestones: [
      { id: 'M-1', title: 'Charter, Scope & Personas (ProductManager & RequirementAgent)', targetDay: 4, status: 'Completed', dependencies: [] },
      { id: 'M-2', title: 'Architecture Blueprint & ADR-001 Sign-off (ArchitectureAgent)', targetDay: 8, status: 'Completed', dependencies: ['M-1'] },
      { id: 'M-3', title: 'Backend Lua Engine & React Seating UI (Frontend & BackendAgent)', targetDay: 18, status: 'Pending', dependencies: ['M-2'] },
      { id: 'M-4', title: 'STRIDE Security Audit & E2E Vitest Suite (Security & QAAgent)', targetDay: 24, status: 'Pending', dependencies: ['M-3'] },
      { id: 'M-5', title: 'Cloud Infrastructure, Docker & Production Launch (DevOps & Stakeholder)', targetDay: 28, status: 'Pending', dependencies: ['M-4'] }
    ]
  },

  clinical_diagnostics: {
    key: 'clinical_diagnostics',
    name: 'MediPilot: AI Clinical Diagnostic & Patient Triage Portal',
    domain: 'Digital Health & Clinical Informatics',
    tagline: 'HIPAA & HL7/FHIR Compliant Medical Imaging Triage with Privacy-Preserving Federated Learning',
    description: 'An enterprise healthcare platform that ingests DICOM scans and patient vitals for automated clinical triage. Implements zero-trust role-based data enclaves, HL7 FHIR v4 interoperability, and differential privacy guarantees. (Demonstration software architecture only; not medical advice).',
    scaleConstraints: 'Ingest 1,200 concurrent DICOM studies/hour, <2s inference response, 100% HIPAA audit logging.',
    targetLaunch: 'Q1 2027 (34-day critical path)',
    financialParams: {
      teamSize: 5,
      blendedHourlyRate: 95,
      cloudTier: 'High-Concurrency',
      contingencyPercent: 20
    },
    requirements: [
      {
        id: 'REQ-MED-01',
        title: 'HL7 FHIR v4 Diagnostic Data Integration',
        type: 'Compliance',
        priority: 'Must Have',
        description: 'Synchronize patient EHR observations and lab orders across hospital systems using standard FHIR JSON resources.',
        metricValue: '100% FHIR v4',
        acceptance: [
          'RESTful FHIR Patient, Observation, and DiagnosticReport endpoints',
          'Automated validation against US Core Implementation Guide profiles',
          'Sub-300ms patient identity reconciliation'
        ],
        affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'DocumentationAgent']
      },
      {
        id: 'REQ-MED-02',
        title: 'HIPAA-Compliant Zero-Trust Cryptographic Enclave',
        type: 'Security',
        priority: 'Must Have',
        description: 'All Protected Health Information (PHI) encrypted in transit (TLS 1.3) and at rest (AES-256-GCM) with immutable audit trails.',
        metricValue: 'Zero PHI Leakage',
        acceptance: [
          'De-identification pipeline stripping HIPAA Safe Harbor 18 identifiers',
          'Hardware security module (HSM) key rotation every 90 days',
          'Read/write audit logs written to immutable WORM S3 storage'
        ],
        affectedAgents: ['SecurityAgent', 'DevOpsAgent', 'ArchitectureAgent']
      },
      {
        id: 'REQ-MED-03',
        title: 'Federated Diagnostic Model Inference Pipeline',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Run on-premise local model inference over DICOM images with zero central data aggregation.',
        metricValue: '<1.8s inference latency',
        acceptance: [
          'TensorRT inference server optimized for local GPU acceleration',
          'Differential privacy noise added to gradient updates (epsilon < 2.0)',
          'Clear physician confirmation checkpoint required before diagnostic logging'
        ],
        affectedAgents: ['ArchitectureAgent', 'FrontendAgent', 'QAAgent']
      }
    ],
    epics: [
      { id: 'EPIC-MED-1', title: 'FHIR Core & Interoperability', description: 'HL7 data pipelines and EHR synchronization', priority: 'Critical' },
      { id: 'EPIC-MED-2', title: 'HIPAA Security & Cryptography', description: 'Zero-trust PHI vaults and immutable auditing', priority: 'Critical' },
      { id: 'EPIC-MED-3', title: 'Clinician Triage Workstation', description: 'Interactive React DICOM viewer and priority triage dashboard', priority: 'High' }
    ],
    stories: [
      {
        id: 'STORY-MED-101',
        epicId: 'EPIC-MED-1',
        epic: 'FHIR Core & Interoperability',
        title: 'FHIR v4 Bundle Ingestion Pipeline',
        description: 'Implement secure endpoint to parse and validate FHIR DiagnosticReport bundles.',
        points: 8,
        priority: 'Critical',
        status: 'In_Progress',
        assignee: 'BackendAgent',
        acceptanceCriteria: ['Validates schemas against US Core', 'Rejects non-conforming resources with HTTP 422', 'Audit logged'],
        tasks: []
      },
      {
        id: 'STORY-MED-102',
        epicId: 'EPIC-MED-2',
        epic: 'HIPAA Security & Cryptography',
        title: 'Safe Harbor PHI De-identification Service',
        description: 'Build automated NLP redaction service to mask 18 HIPAA identifiers from clinical notes.',
        points: 8,
        priority: 'Critical',
        status: 'To_Do',
        assignee: 'SecurityAgent',
        acceptanceCriteria: ['F1 score > 0.98 on clinical names/dates', 'Reversible surrogate keys in HSM vault'],
        tasks: []
      }
    ],
    decisions: [
      {
        id: 'ADR-MED-001',
        adrNumber: 1,
        title: 'On-Premises Federated Inference over Cloud Transmission',
        status: 'Accepted',
        context: 'Hospital governance and HIPAA regulations strictly penalize transmission of raw patient imaging to third-party public cloud APIs.',
        decision: 'Deploy local containerized inference engines within hospital VPC perimeter; aggregate model weights via federated differential privacy.',
        impact: '100% compliance with HIPAA/GDPR health privacy standards with zero patient data egress.',
        proposedBy: 'ArchitectureAgent',
        approvedAt: '2026-09-04T11:00:00Z'
      }
    ],
    risks: [
      {
        id: 'RISK-MED-1',
        title: 'HIPAA Regulatory Violation due to Incomplete De-identification',
        category: 'Security',
        probability: 2,
        impact: 5,
        score: 10,
        level: 'Medium',
        mitigation: 'Dual-pass regex + BERT NER redaction pipeline with quarantine human review queue.',
        owner: 'SecurityAgent',
        status: 'Open'
      },
      {
        id: 'RISK-MED-2',
        title: 'Clinician Over-Reliance on AI Diagnostic Suggestions',
        category: 'Operational',
        probability: 3,
        impact: 4,
        score: 12,
        level: 'High',
        mitigation: 'Enforce explicit "Physician-in-the-Loop" approval modal with red banner disclaimers.',
        owner: 'UIUXAgent',
        status: 'Mitigated'
      }
    ],
    artifacts: [
      {
        id: 'ART-MED-ADR',
        name: 'ADR-001: HIPAA Zero-Trust Federated Health Architecture',
        filename: 'ADR-001-architecture.md',
        category: 'Architecture',
        language: 'markdown',
        generatingAgent: 'ArchitectureAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `# ADR-001: HIPAA Zero-Trust Federated Health Architecture
**Status:** Accepted
**Scope:** Clinical Triage Engine

## Architectural Decision
1. **FHIR Data Layer:** HAPI FHIR server with PostgreSQL storage.
2. **Security Enclave:** AWS Nitro Enclaves for running model inference in cryptographic isolation.
3. **Audit Trails:** Amazon QLDB (Quantum Ledger Database) for cryptographically verifiable HIPAA access logs.`
      },
      {
        id: 'ART-MED-BACKEND',
        name: 'FHIR v4 Observation Ingestion Controller',
        filename: 'server.ts',
        category: 'Backend',
        language: 'typescript',
        generatingAgent: 'BackendAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.post('/fhir/R4/Observation', (req: Request, res: Response) => {
  const resource = req.body;
  if (resource.resourceType !== 'Observation') {
    return res.status(422).json({ error: 'Invalid FHIR Resource: Expected Observation' });
  }

  // HIPAA Access Log Record
  console.log('[AUDIT] Observation ingested for subject:', resource.subject?.reference);

  return res.status(201).json({
    id: 'OBS-' + Date.now(),
    resourceType: 'Observation',
    status: 'final',
    timestamp: new Date().toISOString()
  });
});

app.listen(5000, () => console.log('MediPilot FHIR Server listening on :5000'));`
      },
      {
        id: 'ART-MED-SECURITY',
        name: 'HIPAA Security Safeguards Matrix',
        filename: 'stride_threat_model.json',
        category: 'Security',
        language: 'json',
        generatingAgent: 'SecurityAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: JSON.stringify({
          regulation: 'HIPAA Security Rule (45 CFR Part 160 & 164)',
          safeguards: {
            administrative: 'Role-based access controls, annual workforce training, emergency access procedures',
            physical: 'Facility access control, workstation security policies',
            technical: 'Unique user IDs, emergency logoff, automatic PHI encryption via AES-256'
          },
          auditStatus: '100% Compliant'
        }, null, 2)
      }
    ],
    milestones: [
      { id: 'M-1', title: 'FHIR Schemas & Clinical Workflow Elicitation', targetDay: 5, status: 'Completed', dependencies: [] },
      { id: 'M-2', title: 'Zero-Trust Enclave & Architecture Sign-Off', targetDay: 10, status: 'Completed', dependencies: ['M-1'] },
      { id: 'M-3', title: 'Local Inference Model Integration & Triage UI', targetDay: 22, status: 'Pending', dependencies: ['M-2'] },
      { id: 'M-4', title: 'HIPAA Penetration Testing & Clinical Validation', targetDay: 34, status: 'Pending', dependencies: ['M-3'] }
    ]
  },

  fintech_gateway: {
    key: 'fintech_gateway',
    name: 'NexusPay: High-Frequency FinTech Crypto & Fiat Payment Gateway',
    domain: 'Financial Technology & Capital Markets',
    tagline: 'Sub-Millisecond Settlement Engine with Hardware Security Module (HSM) & Real-Time AML Scoring',
    description: 'An institutional-grade payments infrastructure supporting hybrid fiat rails and stablecoin settlements. Features hardware-backed cryptographic key generation, millisecond fraud scoring, and automated ISO 20022 message formatting.',
    scaleConstraints: '10,000 transactions/sec, <5ms P99 settlement confirmation, zero unhedged liquidity exposure.',
    targetLaunch: 'Q4 2026 (30-day critical path)',
    financialParams: {
      teamSize: 6,
      blendedHourlyRate: 110,
      cloudTier: 'High-Concurrency',
      contingencyPercent: 20
    },
    requirements: [
      {
        id: 'REQ-FIN-01',
        title: 'Sub-5ms Atomic Ledger Settlement',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Double-entry cryptographic ledger processing 10,000 transactions/second with zero balance divergence.',
        metricValue: '<5ms P99',
        acceptance: [
          'TigerBeetle / RocksDB LSM-tree financial database architecture',
          'Strict double-entry accounting invariants enforced at database kernel level',
          'Deterministic crash-recovery replay in under 1 second'
        ],
        affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'QAAgent']
      },
      {
        id: 'REQ-FIN-02',
        title: 'Real-Time AML & Fraud Graph Traversal',
        type: 'Security',
        priority: 'Must Have',
        description: 'Score every incoming transaction against OFAC sanctions lists and high-velocity fraud patterns in <2ms.',
        metricValue: '<2ms Scoring',
        acceptance: [
          'In-memory graph database (Memgraph/Neo4j) tracking transaction topology',
          'Automatic transaction quarantine for risk scores > 85/100',
          'FinCEN Suspicious Activity Report (SAR) automated drafting'
        ],
        affectedAgents: ['SecurityAgent', 'BackendAgent', 'RiskAgent']
      }
    ],
    epics: [
      { id: 'EPIC-FIN-1', title: 'High-Speed Double-Entry Ledger', description: 'Core accounting and balance engine', priority: 'Critical' },
      { id: 'EPIC-FIN-2', title: 'HSM Vault & Custody', description: 'Hardware security module key management', priority: 'Critical' },
      { id: 'EPIC-FIN-3', title: 'Regulatory Compliance & AML', description: 'Sanctions screening and SAR generation', priority: 'High' }
    ],
    stories: [
      {
        id: 'STORY-FIN-101',
        epicId: 'EPIC-FIN-1',
        epic: 'High-Speed Double-Entry Ledger',
        title: 'Double-Entry Invariant Transfer Engine',
        description: 'Construct transactional debit/credit pipeline ensuring debits sum precisely to credits.',
        points: 8,
        priority: 'Critical',
        status: 'In_Progress',
        assignee: 'BackendAgent',
        acceptanceCriteria: ['Zero float drift', 'Deterministic state machine replication', 'Hardware CRC32 verification'],
        tasks: []
      }
    ],
    decisions: [
      {
        id: 'ADR-FIN-001',
        adrNumber: 1,
        title: 'LSM-Tree Accounting Ledger vs Conventional RDBMS',
        status: 'Accepted',
        context: 'Traditional relational locks produce intolerable tail latencies under 10k TPS concurrency.',
        decision: 'Implement TigerBeetle / RocksDB append-only log-structured merge-tree accounting engine.',
        impact: 'Delivers deterministic 1.8ms P99 ledger write latency with mathematically verified crash safety.',
        proposedBy: 'ArchitectureAgent',
        approvedAt: '2026-09-04T11:30:00Z'
      }
    ],
    risks: [
      {
        id: 'RISK-FIN-1',
        title: 'Unhedged Volatility or Liquidity Drain During Peak Run',
        category: 'Financial',
        probability: 3,
        impact: 5,
        score: 15,
        level: 'Critical',
        mitigation: 'Automated multi-venue liquidity rebalancing with circuit-breaker throttles.',
        owner: 'FinanceAgent',
        status: 'Open'
      }
    ],
    artifacts: [
      {
        id: 'ART-FIN-ADR',
        name: 'ADR-001: Double-Entry Immutable Settlement Architecture',
        filename: 'ADR-001-architecture.md',
        category: 'Architecture',
        language: 'markdown',
        generatingAgent: 'ArchitectureAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `# ADR-001: Double-Entry Immutable Settlement Architecture
**Status:** Accepted
**Target:** 10,000 TPS, Sub-5ms Settlement

## Key Components
1. **Ledger Kernel:** TigerBeetle financial ledger running Raft consensus.
2. **Security Vault:** AWS CloudHSM executing Ed25519 threshold transaction signing.
3. **AML Engine:** Real-time sanctions and topological graph traversal.`
      }
    ],
    milestones: [
      { id: 'M-1', title: 'Financial Charter & Accounting Invariants', targetDay: 5, status: 'Completed', dependencies: [] },
      { id: 'M-2', title: 'Ledger Engine Architecture & HSM Sign-off', targetDay: 12, status: 'Completed', dependencies: ['M-1'] },
      { id: 'M-3', title: 'AML Graph Traversal & Payment Rails Integration', targetDay: 22, status: 'Pending', dependencies: ['M-2'] },
      { id: 'M-4', title: 'PCI-DSS Penetration Audit & Production Cutover', targetDay: 30, status: 'Pending', dependencies: ['M-3'] }
    ]
  },

  iot_fleet: {
    key: 'iot_fleet',
    name: 'AeroTrack: Autonomous IoT Fleet Telemetry & Predictive Maintenance',
    domain: 'Industrial IoT & Connected Vehicles',
    tagline: 'High-Throughput MQTT Stream Ingestion with Edge Anomaly Detection & Digital Twin Analytics',
    description: 'An enterprise edge-to-cloud telemetry platform orchestrating 50,000 connected trucks, drones, and heavy equipment. Ingests high-frequency sensor readings via MQTT/Kafka, runs edge anomaly scoring, and automates maintenance ticket dispatch.',
    scaleConstraints: '50,000 devices streaming at 10Hz (500,000 msgs/sec), <100ms anomaly alert dispatch, ISO 27001 compliant.',
    targetLaunch: 'Q1 2027 (32-day critical path)',
    financialParams: {
      teamSize: 4,
      blendedHourlyRate: 80,
      cloudTier: 'High-Concurrency',
      contingencyPercent: 15
    },
    requirements: [
      {
        id: 'REQ-IOT-01',
        title: '500,000 Msg/sec MQTT Stream Ingestion',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Ingest continuous vehicle CAN-bus telemetry over mTLS authenticated MQTT topics.',
        metricValue: '500k msgs/sec',
        acceptance: [
          'EMQX / VerneMQ distributed broker clustering',
          'Direct stream ingestion into Apache Kafka partitioned by device UUID',
          'End-to-end P95 ingestion latency < 65ms'
        ],
        affectedAgents: ['ArchitectureAgent', 'DevOpsAgent', 'BackendAgent']
      },
      {
        id: 'REQ-IOT-02',
        title: 'Edge ML Predictive Maintenance Classifier',
        type: 'Functional',
        priority: 'Must Have',
        description: 'Detect mechanical vibration anomalies on vehicle edge gateways prior to catastrophic engine failure.',
        metricValue: '<50ms edge scoring',
        acceptance: [
          'Lightweight ONNX model running on embedded gateway runtime',
          'Automatic work order generation via maintenance REST API',
          'Over-the-Air (OTA) secure firmware delta updates'
        ],
        affectedAgents: ['ArchitectureAgent', 'FrontendAgent', 'QAAgent']
      }
    ],
    epics: [
      { id: 'EPIC-IOT-1', title: 'High-Throughput Ingestion Bus', description: 'MQTT and Kafka stream pipelines', priority: 'Critical' },
      { id: 'EPIC-IOT-2', title: 'Edge Telemetry & Anomaly AI', description: 'ONNX edge classifiers and CAN-bus decoders', priority: 'High' },
      { id: 'EPIC-IOT-3', title: 'Fleet Fleet Operations Command Center', description: 'Real-time GIS map and digital twin dashboards', priority: 'Medium' }
    ],
    stories: [
      {
        id: 'STORY-IOT-101',
        epicId: 'EPIC-IOT-1',
        epic: 'High-Throughput Ingestion Bus',
        title: 'EMQX MQTT to Kafka Bridge Connector',
        description: 'Configure distributed MQTT topic routing with protobuf payload serialization.',
        points: 8,
        priority: 'Critical',
        status: 'In_Progress',
        assignee: 'BackendAgent',
        acceptanceCriteria: ['Supports 50k concurrent TLS sessions', 'Zero data loss across broker restarts'],
        tasks: []
      }
    ],
    decisions: [
      {
        id: 'ADR-IOT-001',
        adrNumber: 1,
        title: 'Kafka + TimescaleDB for High-Velocity Telemetry Storage',
        status: 'Accepted',
        context: 'Writing 500,000 raw sensor records/sec exceeds conventional SQL row write capacity.',
        decision: 'Stream into Apache Kafka, compute 5-second tumbling window aggregations in Apache Flink, and persist into TimescaleDB hypertable.',
        impact: 'Reduces database storage footprint by 84% via time-series compression and sustains 500k writes/sec.',
        proposedBy: 'ArchitectureAgent',
        approvedAt: '2026-09-04T12:00:00Z'
      }
    ],
    risks: [
      {
        id: 'RISK-IOT-1',
        title: 'Device Rogue Certificate Compromise over Cellular Link',
        category: 'Security',
        probability: 2,
        impact: 5,
        score: 10,
        level: 'Medium',
        mitigation: 'Implement mutual TLS (mTLS) with EST (Enrollment over Secure Transport) and instant CRL revocation.',
        owner: 'SecurityAgent',
        status: 'Open'
      }
    ],
    artifacts: [
      {
        id: 'ART-IOT-ADR',
        name: 'ADR-001: Distributed MQTT & Kafka Stream Ingestion Pipeline',
        filename: 'ADR-001-architecture.md',
        category: 'Architecture',
        language: 'markdown',
        generatingAgent: 'ArchitectureAgent',
        version: 1,
        lastUpdated: new Date().toLocaleTimeString(),
        content: `# ADR-001: Distributed MQTT & Kafka Stream Ingestion Pipeline
**Status:** Accepted
**Scale:** 50,000 devices, 500,000 messages/sec

## Architecture
1. **Edge:** Devices connect over mTLS to an EMQX cluster.
2. **Buffer:** Ingestion messages forwarded directly into Kafka partitioned topics.
3. **Analytics:** Flink aggregates metrics and writes anomalies to TimescaleDB.
4. **Command Center:** Real-time WebSockets push alerts to Fleet Managers.`
      }
    ],
    milestones: [
      { id: 'M-1', title: 'Vehicle Telemetry Protocol & Scale Charter', targetDay: 4, status: 'Completed', dependencies: [] },
      { id: 'M-2', title: 'Kafka Ingestion Pipeline & Architecture Sign-off', targetDay: 10, status: 'Completed', dependencies: ['M-1'] },
      { id: 'M-3', title: 'Edge ONNX Classifier & GIS Fleet Dashboard', targetDay: 22, status: 'Pending', dependencies: ['M-2'] },
      { id: 'M-4', title: 'Field Stress Testing & ISO 27001 Certification', targetDay: 32, status: 'Pending', dependencies: ['M-3'] }
    ]
  }
};

/**
 * Synthesizes dynamic, fully-realized SDLC project definitions for ANY arbitrary custom user prompt
 */
export function generateCustomProjectFromPrompt(promptText: string): DomainPresetData {
  const cleanPrompt = promptText.trim() || 'Custom Software Application';
  const slug = cleanPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);

  // Deep keyword analysis
  const isStudentTask = /student|task|todo|assign|homework|study|school|deadline|reminder|priorit|curriculum/i.test(cleanPrompt);

  if (isStudentTask) {
    return {
      key: `custom_student_task_${Date.now()}`,
      name: 'Student Task & Study Workflow Hub',
      domain: 'EdTech & Productivity Management',
      tagline: 'Student task management web application with priority tiers, automated reminders, and progress analytics',
      description: `A specialized student productivity and task management platform engineered to satisfy the project directive: "${cleanPrompt}". Features secure authentication, full CRUD task lifecycle with color-coded priority levels (Urgent, High, Medium, Low), deadline reminder scheduling, dual-state dashboard (pending vs. completed), and a robust relational database backend.`,
      scaleConstraints: 'Engineered for 10,000+ active student sessions, sub-50ms task mutations, and zero-latency local caching.',
      targetLaunch: 'Q4 2026 (28-day critical path)',
      financialParams: {
        teamSize: 3,
        blendedHourlyRate: 70,
        cloudTier: 'Starter',
        contingencyPercent: 12
      },
      requirements: [
        {
          id: 'REQ-STU-01',
          title: 'Full Task CRUD with Priority Matrix & State Toggling',
          type: 'Functional',
          priority: 'Must Have',
          description: 'Students can create, view, edit, delete, and mark tasks as completed with immediate visual feedback.',
          metricValue: 'Sub-50ms UI update',
          acceptance: [
            'Create task with title, description, course/category, priority tier, and due date',
            'Edit existing task attributes and inline toggle completion status with instant check animation',
            'Delete tasks with confirmation modal and undo toast notification'
          ],
          affectedAgents: ['FrontendAgent', 'BackendAgent', 'UIUXAgent']
        },
        {
          id: 'REQ-STU-02',
          title: 'Deadline Tracking & Proactive Reminder Engine',
          type: 'Functional',
          priority: 'Must Have',
          description: 'Automated background notifications alerting students 24h and 1h prior to task deadlines.',
          metricValue: '100% On-Time Delivery',
          acceptance: [
            'Timezone-aware datetime scheduler with visual overdue tags (red badge)',
            'In-app notification bell and optional browser push notification',
            'Dynamic countdown badges: "Due in 3 hours", "Due Tomorrow", "Overdue"'
          ],
          affectedAgents: ['BackendAgent', 'DevOpsAgent', 'QAAgent']
        },
        {
          id: 'REQ-STU-03',
          title: 'Secure Student Authentication & Session Isolation',
          type: 'Security',
          priority: 'Must Have',
          description: 'User registration, login, session persistence, and strict row-level student data isolation.',
          metricValue: '100% OWASP Pass',
          acceptance: [
            'Bcrypt password hashing (cost factor 12) with salted digests',
            'Stateless JWT session tokens with HttpOnly secure cookie storage',
            'Row-level security ensuring students cannot view or modify other students\' tasks'
          ],
          affectedAgents: ['SecurityAgent', 'BackendAgent']
        },
        {
          id: 'REQ-STU-04',
          title: 'Dual-Pane Dashboard: Pending vs Completed Workflows',
          type: 'Functional',
          priority: 'Must Have',
          description: 'Visual productivity dashboard presenting real-time breakdown of pending tasks, completed tasks, and completion rate.',
          metricValue: 'Real-time counters',
          acceptance: [
            'Live summary statistics: Total Tasks, Pending Tasks, Completed Tasks, and Productivity %',
            'Filter tabs: "All Tasks", "Pending", "Completed Today", and "Overdue"',
            'Search input and sort dropdown (by Deadline, by Priority, by Title)'
          ],
          affectedAgents: ['FrontendAgent', 'UIUXAgent', 'AnalyticsAgent']
        },
        {
          id: 'REQ-STU-05',
          title: 'Relational Database Schema & Foreign Key Integrity',
          type: 'Non-Functional',
          priority: 'Must Have',
          description: 'Optimized relational persistence layer with normalized tables for users, tasks, and reminders.',
          metricValue: 'Sub-20ms queries',
          acceptance: [
            'Normalized tables (users, tasks, reminders, categories) with CASCADE constraints',
            'Composite database index on (user_id, status, deadline) for lightning-fast dashboard queries',
            'Automated schema migration scripts and transactional seed fixtures'
          ],
          affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'DevOpsAgent']
        }
      ],
      epics: [
        { id: 'EPIC-STU-1', title: 'Student Authentication & Account Security', description: 'Registration, login, password hashing, and session management', priority: 'Critical' },
        { id: 'EPIC-STU-2', title: 'Task Lifecycle & Priority Matrix Engine', description: 'Interactive creation, editing, deletion, priority tiers, and completion toggles', priority: 'Critical' },
        { id: 'EPIC-STU-3', title: 'Deadline Tracking & Notification Scheduler', description: 'Timezone-aware scheduling, reminder dispatch, and overdue detection', priority: 'High' },
        { id: 'EPIC-STU-4', title: 'Productivity Dashboard & Visual Analytics', description: 'Pending vs completed task counters, progress meters, and filter views', priority: 'High' },
        { id: 'EPIC-STU-5', title: 'Relational Database Persistence & REST API', description: 'PostgreSQL/SQLite schemas, foreign key constraints, and Express routes', priority: 'Critical' }
      ],
      stories: [
        {
          id: 'STORY-STU-101',
          epicId: 'EPIC-STU-1',
          epic: 'Student Authentication & Account Security',
          title: 'User Registration & JWT Login Endpoints',
          description: 'Implement /api/auth/register and /api/auth/login routes with bcrypt password hashing and token generation.',
          points: 5,
          priority: 'Critical',
          status: 'In_Progress',
          assignee: 'BackendAgent',
          acceptanceCriteria: ['Validates email and minimum 8-char password', 'Returns signed JWT token', 'Rejects duplicate emails'],
          tasks: []
        },
        {
          id: 'STORY-STU-102',
          epicId: 'EPIC-STU-2',
          epic: 'Task Lifecycle & Priority Matrix Engine',
          title: 'Task Creation Modal with Priority & Deadline Picker',
          description: 'Design accessible modal dialog with inputs for title, description, priority (Urgent, High, Medium, Low), and due datetime.',
          points: 5,
          priority: 'High',
          status: 'In_Progress',
          assignee: 'UIUXAgent',
          acceptanceCriteria: ['Dropdown for 4 priority tiers with distinct color tokens', 'Native datetime picker with validation', 'Form submission triggers optimistic list update'],
          tasks: []
        },
        {
          id: 'STORY-STU-103',
          epicId: 'EPIC-STU-5',
          epic: 'Relational Database Persistence & REST API',
          title: 'Relational SQL Database Schema & Migration Script',
          description: 'Create normalized users, tasks, and reminders tables with foreign keys and composite indexes.',
          points: 8,
          priority: 'Critical',
          status: 'Done',
          assignee: 'BackendAgent',
          acceptanceCriteria: ['Foreign key constraint on tasks.user_id -> users.id', 'Composite index on (user_id, status, deadline)', 'Migration runs cleanly with test seed data'],
          tasks: []
        },
        {
          id: 'STORY-STU-104',
          epicId: 'EPIC-STU-4',
          epic: 'Productivity Dashboard & Visual Analytics',
          title: 'Interactive Student Dashboard with Pending/Completed Tabs',
          description: 'Build main dashboard showing completion percentage, overdue alerts, and filterable task cards.',
          points: 8,
          priority: 'Critical',
          status: 'In_Progress',
          assignee: 'FrontendAgent',
          acceptanceCriteria: ['Tabs for All, Pending, and Completed', 'One-click checkmark toggle to complete task', 'Progress bar updating dynamically as tasks are checked'],
          tasks: []
        },
        {
          id: 'STORY-STU-105',
          epicId: 'EPIC-STU-3',
          epic: 'Deadline Tracking & Notification Scheduler',
          title: 'Automated Deadline Reminder Background Worker',
          description: 'Build cron scheduler checking for upcoming task deadlines and emitting notifications.',
          points: 5,
          priority: 'High',
          status: 'To_Do',
          assignee: 'BackendAgent',
          acceptanceCriteria: ['Scans for tasks due within 24 hours', 'Flags reminders as sent to prevent duplicate alerts', 'Emits in-app alert event'],
          tasks: []
        },
        {
          id: 'STORY-STU-106',
          epicId: 'EPIC-STU-1',
          epic: 'Student Authentication & Account Security',
          title: 'Row-Level Authorization & Input Sanitization',
          description: 'Enforce middleware ensuring students can only read and mutate their own personal tasks.',
          points: 5,
          priority: 'High',
          status: 'In_Progress',
          assignee: 'SecurityAgent',
          acceptanceCriteria: ['All /api/tasks routes filter by req.user.id', 'SQL injection prevention via parameterized queries', 'XSS sanitization on task titles and descriptions'],
          tasks: []
        },
        {
          id: 'STORY-STU-107',
          epicId: 'EPIC-STU-2',
          epic: 'Task Lifecycle & Priority Matrix Engine',
          title: 'Automated E2E Test Suite for Task Lifecycle',
          description: 'Write integration test suite validating create, edit, prioritize, complete, and delete flows.',
          points: 5,
          priority: 'Medium',
          status: 'To_Do',
          assignee: 'QAAgent',
          acceptanceCriteria: ['100% pass rate on task CRUD lifecycle', 'Validates priority sorting logic', 'Checks deadline formatting under various timezones'],
          tasks: []
        },
        {
          id: 'STORY-STU-108',
          epicId: 'EPIC-STU-5',
          epic: 'Relational Database Persistence & REST API',
          title: 'Docker Containerization & Dev Compose Environment',
          description: 'Synthesize multi-stage Dockerfile and docker-compose.yml with Node.js and PostgreSQL/SQLite.',
          points: 3,
          priority: 'Medium',
          status: 'To_Do',
          assignee: 'DevOpsAgent',
          acceptanceCriteria: ['Docker container builds under 45 seconds', 'Environment variables for DB_URL and JWT_SECRET', 'One-command startup with npm run dev'],
          tasks: []
        }
      ],
      decisions: [
        {
          id: 'ADR-STU-001',
          adrNumber: 1,
          title: 'Relational Database Architecture with SQLite/PostgreSQL',
          status: 'Accepted',
          context: 'Student task management requires strict relational integrity between student accounts, tasks, priorities, and notification logs.',
          decision: 'Adopt relational SQL storage with foreign keys, composite indexes on (user_id, status, deadline), and parameterized queries.',
          impact: 'Guarantees sub-20ms dashboard queries, absolute student data isolation, and easy local dev using SQLite or production deployment on PostgreSQL.',
          proposedBy: 'ArchitectureAgent',
          approvedAt: new Date().toISOString()
        },
        {
          id: 'ADR-STU-002',
          adrNumber: 2,
          title: 'Stateless JWT Authentication with Bcrypt Password Encryption',
          status: 'Accepted',
          context: 'Students need secure, frictionless login with persistent sessions across mobile and laptop devices without heavy server session memory.',
          decision: 'Use JSON Web Tokens (JWT) signed with HMAC-SHA256, alongside bcrypt salted password hashing (work factor 12).',
          impact: 'Decoupled auth verification, horizontal scalability, and zero plain-text credential vulnerability.',
          proposedBy: 'SecurityAgent',
          approvedAt: new Date().toISOString()
        },
        {
          id: 'ADR-STU-003',
          adrNumber: 3,
          title: 'Cron-Based Background Reminder Worker',
          status: 'Accepted',
          context: 'Students must receive notifications before deadlines occur (24h and 1h prior) without blocking main user request threads.',
          decision: 'Implement an asynchronous worker loop evaluating pending tasks with upcoming deadlines, dispatching idempotent alert records.',
          impact: 'Zero API latency impact, predictable reminder delivery, and resilience against server restarts.',
          proposedBy: 'BackendAgent',
          approvedAt: new Date().toISOString()
        },
        {
          id: 'ADR-STU-004',
          adrNumber: 4,
          title: 'Optimistic UI Updates for Task Status & Prioritization',
          status: 'Accepted',
          context: 'Students toggle tasks frequently and expect instant visual feedback without waiting for round-trip network latency.',
          decision: 'Implement optimistic client-side state transitions with rollback on API rejection.',
          impact: 'Instantaneous 0ms perceived response time, smooth micro-animations, and elevated user satisfaction.',
          proposedBy: 'FrontendAgent',
          approvedAt: new Date().toISOString()
        }
      ],
      risks: [
        {
          id: 'RISK-STU-1',
          title: 'Student Data Isolation Breach via Insecure Direct Object References (IDOR)',
          category: 'Security',
          probability: 2,
          impact: 5,
          score: 10,
          level: 'High',
          mitigation: 'Enforce strict req.user.id filtering at the ORM/SQL query layer on all task update and delete mutations.',
          owner: 'SecurityAgent',
          status: 'Mitigated'
        },
        {
          id: 'RISK-STU-2',
          title: 'Missed Reminder Alerts Due to Server Clock Skew or Process Restart',
          category: 'Technical',
          probability: 2,
          impact: 4,
          score: 8,
          level: 'Medium',
          mitigation: 'Store reminder sent flags in database; worker queries for unnotified tasks where deadline <= NOW() + 24h on boot.',
          owner: 'BackendAgent',
          status: 'Mitigated'
        },
        {
          id: 'RISK-STU-3',
          title: 'Database Query Degradation with High Task History Volumes',
          category: 'Technical',
          probability: 2,
          impact: 3,
          score: 6,
          level: 'Low',
          mitigation: 'Implement composite index on (user_id, status, deadline) and archive completed tasks older than 180 days.',
          owner: 'ArchitectureAgent',
          status: 'Open'
        }
      ],
      artifacts: [
        {
          id: 'ART-STU-SCHEMA',
          name: 'Relational Database Schema (SQL)',
          filename: 'schema.sql',
          category: 'Backend',
          language: 'sql',
          generatingAgent: 'BackendAgent',
          version: 1,
          lastUpdated: new Date().toLocaleTimeString(),
          content: `-- ==============================================================================
-- Student Task Management System - Relational Database Schema
-- Synthesized by PMPilot (BackendAgent & ArchitectureAgent)
-- ==============================================================================

-- 1. Users Table (Student Accounts)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  institution VARCHAR(150) DEFAULT 'University / College',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks Table (Core Student Tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  course_tag VARCHAR(50) DEFAULT 'General',
  priority VARCHAR(20) CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')) DEFAULT 'Medium',
  status VARCHAR(20) CHECK (status IN ('Pending', 'In_Progress', 'Completed')) DEFAULT 'Pending',
  deadline TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Reminders Table (Automated Alerts)
CREATE TABLE IF NOT EXISTS reminders (
  id VARCHAR(36) PRIMARY KEY,
  task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  remind_at TIMESTAMP NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  notification_type VARCHAR(20) DEFAULT 'In_App',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Composite Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(remind_at, is_sent);`
        },
        {
          id: 'ART-STU-BACKEND',
          name: 'Student Task REST API Controller',
          filename: 'server.ts',
          category: 'Backend',
          language: 'typescript',
          generatingAgent: 'BackendAgent',
          version: 1,
          lastUpdated: new Date().toLocaleTimeString(),
          content: `import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'pmpilot-student-secure-key';

// Mock DB Storage
const users: any[] = [];
const tasks: any[] = [];

// 1. User Registration & Login
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: 'usr_' + Date.now(), email, full_name, password_hash };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, full_name } });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
});

// 2. Task CRUD Endpoints
app.get('/api/tasks', (req: Request, res: Response) => {
  const { status, priority } = req.query;
  let filtered = tasks;
  if (status) filtered = filtered.filter(t => t.status === status);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  res.json({ tasks: filtered, count: filtered.length });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, priority = 'Medium', deadline, course_tag = 'General' } = req.body;
  const task = {
    id: 'tsk_' + Date.now(),
    title,
    description,
    priority,
    status: 'Pending',
    deadline: deadline || new Date(Date.now() + 86400000).toISOString(),
    course_tag,
    created_at: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id/toggle', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
  task.completed_at = task.status === 'Completed' ? new Date().toISOString() : null;
  res.json(task);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Student Dashboard Metrics
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = total - completed;
  const urgent = tasks.filter(t => t.priority === 'Urgent' && t.status === 'Pending').length;
  res.json({ total, completed, pending, urgent, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 });
});

app.listen(5000, () => console.log('Student Task API operational on port 5000'));`
        },
        {
          id: 'ART-STU-REACT',
          name: 'Student Task Dashboard (React)',
          filename: 'StudentTaskDashboard.tsx',
          category: 'Frontend',
          language: 'typescript',
          generatingAgent: 'FrontendAgent',
          version: 1,
          lastUpdated: new Date().toLocaleTimeString(),
          content: `import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Plus, Trash2, Calendar, Tag } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  course: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  deadline: string;
  completed: boolean;
}

export const StudentTaskDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'Calculus III Problem Set 4', course: 'MATH 301', priority: 'Urgent', deadline: 'Today, 11:59 PM', completed: false },
    { id: '2', title: 'Operating Systems Virtual Memory Lab', course: 'CS 420', priority: 'High', deadline: 'Tomorrow, 5:00 PM', completed: false },
    { id: '3', title: 'AI Ethics Literature Review', course: 'PHIL 210', priority: 'Medium', deadline: 'Friday, 12:00 PM', completed: true }
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 text-white">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black">Student Task Workspace</h2>
          <p className="text-xs text-slate-400">Track deadlines, prioritize coursework, and monitor completion rate.</p>
        </div>
        <div className="text-right font-mono text-xs">
          <span className="text-emerald-400 font-bold">{completedCount}/{tasks.length} Completed</span>
          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: \`\${progressPercent}%\` }} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={\`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all \${
              filter === tab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }\`}
          >
            {tab} ({tab === 'all' ? tasks.length : tab === 'pending' ? tasks.length - completedCount : completedCount})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={\`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between \${
              task.completed ? 'bg-slate-950/40 border-slate-800/80 opacity-60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }\`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className={\`w-5 h-5 \${task.completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-600'}\`} />
              <div>
                <h4 className={\`text-xs font-bold \${task.completed ? 'line-through text-slate-500' : 'text-white'}\`}>{task.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-indigo-400" /> {task.course}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-400" /> {task.deadline}</span>
                </div>
              </div>
            </div>
            <span className={\`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold \${
              task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
              task.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
            }\`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};`
        },
        {
          id: 'ART-STU-ADR',
          name: 'ADR-001: Architecture Specification',
          filename: 'ADR-001-architecture.md',
          category: 'Architecture',
          language: 'markdown',
          generatingAgent: 'ArchitectureAgent',
          version: 1,
          lastUpdated: new Date().toLocaleTimeString(),
          content: `# ADR-001: Student Task Management Architecture Specification

**Project Directive:** "${cleanPrompt}"
**Lead Agent:** ArchitectureAgent  
**Status:** Accepted

## 1. Architectural Strategy
- **Client Tier:** React 19 SPA with optimistic state updates and responsive priority matrix.
- **API Tier:** Node.js Express REST API providing authenticated CRUD and reminder scheduling.
- **Data Tier:** Relational SQL (PostgreSQL/SQLite) with strict foreign key constraints and user isolation.
- **Background Tier:** Timezone-aware cron worker scanning task deadlines and issuing proactive reminders.`
        }
      ],
      dbEntities: [
        {
          name: 'users',
          desc: 'Student accounts & authentication credentials',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'email', type: 'VARCHAR(150) UNIQUE' },
            { name: 'password_hash', type: 'VARCHAR(255) BCRYPT' },
            { name: 'full_name', type: 'VARCHAR(100)' },
            { name: 'institution', type: 'VARCHAR(150)' },
            { name: 'created_at', type: 'TIMESTAMP' }
          ]
        },
        {
          name: 'tasks',
          desc: 'Primary coursework tasks with priority & status',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'user_id', type: 'UUID (FK -> users.id)', key: true },
            { name: 'title', type: 'VARCHAR(200) NOT NULL' },
            { name: 'description', type: 'TEXT' },
            { name: 'priority', type: 'ENUM (Urgent, High, Med, Low)' },
            { name: 'status', type: 'ENUM (Pending, Completed)' },
            { name: 'deadline', type: 'TIMESTAMP (INDEXED)' },
            { name: 'completed_at', type: 'TIMESTAMP NULL' }
          ]
        },
        {
          name: 'reminders',
          desc: 'Automated notification alert triggers',
          fields: [
            { name: 'id', type: 'UUID (PK)', key: true },
            { name: 'task_id', type: 'UUID (FK -> tasks.id)', key: true },
            { name: 'user_id', type: 'UUID (FK -> users.id)', key: true },
            { name: 'remind_at', type: 'TIMESTAMP (INDEXED)' },
            { name: 'is_sent', type: 'BOOLEAN DEFAULT FALSE' }
          ]
        }
      ],
      testCases: [
        { id: 'TC-STU-101', name: 'Student Registration & Bcrypt Password Hashing', suite: 'Authentication Suite', status: 'Passed', duration: '32ms', agent: 'SecurityAgent' },
        { id: 'TC-STU-102', name: 'Task Creation & Priority Tag Validation', suite: 'Task CRUD Suite', status: 'Passed', duration: '18ms', agent: 'BackendAgent' },
        { id: 'TC-STU-103', name: 'Optimistic Inline Completion Toggling', suite: 'Client UI Suite', status: 'Passed', duration: '14ms', agent: 'FrontendAgent' },
        { id: 'TC-STU-104', name: 'Deadline Countdown & Alert Notification Trigger', suite: 'Reminder Service', status: 'Passed', duration: '45ms', agent: 'QAAgent' },
        { id: 'TC-STU-105', name: 'Row-Level Isolation (Prevent Insecure Direct Object Reference)', suite: 'Security Suite', status: 'Passed', duration: '28ms', agent: 'SecurityAgent' },
        { id: 'TC-STU-106', name: 'Database Query Index Verification (<20ms P95)', suite: 'Database Suite', status: 'Passed', duration: '12ms', agent: 'ArchitectureAgent' }
      ],
      approvals: [
        {
          id: 'APP-STU-ARCH',
          checkpointType: 'Architecture',
          agentId: 'ArchitectureAgent',
          summary: 'Authorize Student Task Relational Schema & JWT State Strategy (ADR-001)',
          recommendations: [
            'Confirm composite index on (user_id, status, deadline) for instantaneous task filtering',
            'Verify timezone offset serialization for international student submissions'
          ],
          identifiedRisks: [
            'Potential deadline misalignment if UTC conversions are not applied client-side'
          ],
          affectedArtifacts: ['ADR-001-architecture.md', 'schema.sql'],
          status: 'Pending'
        },
        {
          id: 'APP-STU-SEC',
          checkpointType: 'Security',
          agentId: 'SecurityAgent',
          summary: 'Verify Student Data Isolation & OWASP Input Sanitization',
          recommendations: [
            'Enforce parameterized SQL bindings to block SQL injection attacks',
            'Validate Bcrypt cost factor 12 on user registration'
          ],
          identifiedRisks: [
            'Cross-student data leakage without row-level req.user.id enforcement'
          ],
          affectedArtifacts: ['server.ts'],
          status: 'Pending'
        }
      ],
      milestones: [
        { id: 'M-1', title: 'Student Authentication & Security Baseline', targetDay: 4, status: 'Completed', dependencies: [] },
        { id: 'M-2', title: 'Relational Database Schema & CRUD Endpoints', targetDay: 9, status: 'Completed', dependencies: ['M-1'] },
        { id: 'M-3', title: 'Responsive Student Dashboard & Priority UI', targetDay: 17, status: 'Pending', dependencies: ['M-2'] },
        { id: 'M-4', title: 'Deadline Reminder Cron & Alert Triggers', targetDay: 23, status: 'Pending', dependencies: ['M-3'] },
        { id: 'M-5', title: 'E2E Testing, Security Audits & Launch', targetDay: 28, status: 'Pending', dependencies: ['M-4'] }
      ]
    };
  }

  // Domain categorization for arbitrary custom projects
  const isSynapse = /synapse|bci|brain|neuro|neural|eeg|signal|sensor|telemetry|cognitive|cortex/i.test(cleanPrompt);
  const isCommerce = /e-?commerce|shop|store|cart|checkout|product|merchant|seller|inventory|order|retail/i.test(cleanPrompt);
  const isHealth = /health|clinic|patient|doctor|medical|hospital|telehealth|rx|medicine|triage|ehr/i.test(cleanPrompt);
  const isFintech = /finance|payment|crypto|trading|bank|money|wallet|loan|stock|ledger|defi|escrow/i.test(cleanPrompt);
  const isSocial = /video|stream|audio|media|chat|social|message|post|feed|content|channel|community/i.test(cleanPrompt);
  const isLogistics = /iot|fleet|truck|device|delivery|logistics|tracking|warehouse|ride|uber|driver|trip/i.test(cleanPrompt);

  let domain = 'Autonomous Cloud Platform';
  let projectTitle = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 48) + '...' : cleanPrompt;
  let primaryEntity = 'Record';
  let primaryPlural = 'records';

  let dbEntities: DbEntity[] = [];
  let testCases: TestCase[] = [];
  let approvals: Approval[] = [];
  let artifacts: Artifact[] = [];
  let epics: Epic[] = [];
  let stories: UserStory[] = [];
  let requirements: Requirement[] = [];
  let decisions: Decision[] = [];
  let risks: Risk[] = [];

  if (isSynapse) {
    domain = 'Neurotechnology & AI Telemetry';
    projectTitle = 'Synapse: Cognitive AI & BCI Telemetry Platform';
    primaryEntity = 'Neural Stream';
    primaryPlural = 'telemetry streams';

    dbEntities = [
      {
        name: 'bci_devices',
        desc: 'Registered neural interface headsets and hardware endpoints',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'serial_number', type: 'VARCHAR(100) UNIQUE' },
          { name: 'firmware_version', type: 'VARCHAR(50)' },
          { name: 'channel_count', type: 'INT (8, 16, 32, 64)' },
          { name: 'sampling_rate_hz', type: 'INT (250Hz - 1000Hz)' },
          { name: 'status', type: 'ENUM (Connected, Calibrating, Streaming)' }
        ]
      },
      {
        name: 'neural_signals',
        desc: 'Time-series bandpower and raw microvolt telemetry streams',
        fields: [
          { name: 'id', type: 'BIGINT (PK)', key: true },
          { name: 'device_id', type: 'UUID (FK -> bci_devices.id)', key: true },
          { name: 'timestamp_epoch', type: 'TIMESTAMP (INDEXED)' },
          { name: 'alpha_power', type: 'FLOAT' },
          { name: 'beta_power', type: 'FLOAT' },
          { name: 'theta_power', type: 'FLOAT' },
          { name: 'gamma_power', type: 'FLOAT' },
          { name: 'signal_quality_snr', type: 'FLOAT' }
        ]
      },
      {
        name: 'cognitive_sessions',
        desc: 'Subject cognitive workload and attention classification sessions',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'subject_id', type: 'VARCHAR(100) (INDEXED)' },
          { name: 'session_state', type: 'ENUM (Active, Concluded, Analyzed)' },
          { name: 'focus_index', type: 'FLOAT (0.0 - 1.0)' },
          { name: 'fatigue_score', type: 'FLOAT (0.0 - 1.0)' },
          { name: 'recorded_at', type: 'TIMESTAMP' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-SYN-101', name: 'High-Frequency Telemetry Ingestion (10,000 samples/sec)', suite: 'Stream Suite', status: 'Passed', duration: '22ms', agent: 'BackendAgent' },
      { id: 'TC-SYN-102', name: 'FFT Bandpower Transformation (Alpha/Beta/Theta)', suite: 'Signal Processing', status: 'Passed', duration: '35ms', agent: 'ArchitectureAgent' },
      { id: 'TC-SYN-103', name: 'mTLS Hardware Authentication & Device Handshake', suite: 'Security Suite', status: 'Passed', duration: '18ms', agent: 'SecurityAgent' },
      { id: 'TC-SYN-104', name: 'Cognitive Workload Real-Time WebSocket Broadcast', suite: 'Telemetry UI', status: 'Passed', duration: '15ms', agent: 'FrontendAgent' },
      { id: 'TC-SYN-105', name: 'HIPAA & Pseudonymized Subject Data Encryption', suite: 'Compliance Suite', status: 'Passed', duration: '12ms', agent: 'SecurityAgent' }
    ];
  } else if (isHealth) {
    domain = 'Digital Health & Clinical Informatics';
    projectTitle = cleanPrompt.includes(':') ? cleanPrompt.split(':')[0] : 'MediCare: Clinical Diagnostic & Patient Portal';
    primaryEntity = 'Appointment';
    primaryPlural = 'appointments';

    dbEntities = [
      {
        name: 'patients',
        desc: 'Protected health information (PHI) patient registry',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'mrn', type: 'VARCHAR(50) UNIQUE (Medical Record No)' },
          { name: 'full_name', type: 'VARCHAR(150)' },
          { name: 'dob', type: 'DATE' },
          { name: 'emergency_contact', type: 'VARCHAR(100)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'appointments',
        desc: 'Consultation scheduling and triage queue',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'patient_id', type: 'UUID (FK -> patients.id)', key: true },
          { name: 'doctor_id', type: 'UUID (INDEXED)', key: true },
          { name: 'scheduled_time', type: 'TIMESTAMP (INDEXED)' },
          { name: 'status', type: 'ENUM (Pending, In_Consultation, Completed, Cancelled)' },
          { name: 'triage_priority', type: 'ENUM (Critical, High, Medium, Low)' },
          { name: 'clinical_notes', type: 'TEXT' }
        ]
      },
      {
        name: 'prescriptions',
        desc: 'Digital e-Prescriptions and medication dosage orders',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'appointment_id', type: 'UUID (FK -> appointments.id)', key: true },
          { name: 'medication_name', type: 'VARCHAR(200)' },
          { name: 'dosage', type: 'VARCHAR(100)' },
          { name: 'frequency', type: 'VARCHAR(100)' },
          { name: 'is_dispensed', type: 'BOOLEAN DEFAULT FALSE' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-MED-101', name: 'HIPAA Access Control & Audit Log Generation', suite: 'Compliance Suite', status: 'Passed', duration: '28ms', agent: 'SecurityAgent' },
      { id: 'TC-MED-102', name: 'Patient Triage Algorithm & Urgency Scoring', suite: 'Clinical Suite', status: 'Passed', duration: '19ms', agent: 'BackendAgent' },
      { id: 'TC-MED-103', name: 'Doctor Consultation Scheduling & Double-Booking Guard', suite: 'Booking Suite', status: 'Passed', duration: '14ms', agent: 'BackendAgent' },
      { id: 'TC-MED-104', name: 'Real-Time Vital Signs Telemetry Stream', suite: 'Frontend UI', status: 'Passed', duration: '16ms', agent: 'FrontendAgent' },
      { id: 'TC-MED-105', name: 'Database Encryption at Rest (AES-256 GCM)', suite: 'Database Security', status: 'Passed', duration: '24ms', agent: 'SecurityAgent' }
    ];
  } else if (isCommerce) {
    domain = 'E-Commerce & Digital Marketplace';
    projectTitle = cleanPrompt.includes(':') ? cleanPrompt.split(':')[0] : 'ShopMatrix: Next-Gen Digital Marketplace';
    primaryEntity = 'Order';
    primaryPlural = 'orders';

    dbEntities = [
      {
        name: 'users',
        desc: 'Buyer and merchant account entities',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'email', type: 'VARCHAR(150) UNIQUE' },
          { name: 'role', type: 'ENUM (Buyer, Merchant, Admin)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'products',
        desc: 'Catalog inventory with pricing and availability',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'seller_id', type: 'UUID (FK -> users.id)', key: true },
          { name: 'title', type: 'VARCHAR(250) NOT NULL' },
          { name: 'price_cents', type: 'INT NOT NULL' },
          { name: 'stock_count', type: 'INT (INDEXED)' },
          { name: 'category', type: 'VARCHAR(100)' }
        ]
      },
      {
        name: 'orders',
        desc: 'Customer purchases and fulfillment status',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'buyer_id', type: 'UUID (FK -> users.id)', key: true },
          { name: 'total_cents', type: 'INT' },
          { name: 'status', type: 'ENUM (Paid, Shipped, Delivered, Refunded)' },
          { name: 'created_at', type: 'TIMESTAMP (INDEXED)' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-COM-101', name: 'Atomic Stock Decrement on Flash Checkout', suite: 'Inventory Suite', status: 'Passed', duration: '12ms', agent: 'BackendAgent' },
      { id: 'TC-COM-102', name: 'Stripe Payment Webhook Idempotency Verification', suite: 'Payment Suite', status: 'Passed', duration: '25ms', agent: 'SecurityAgent' },
      { id: 'TC-COM-103', name: 'Sub-50ms Catalog Full-Text Search', suite: 'Search Engine', status: 'Passed', duration: '18ms', agent: 'ArchitectureAgent' },
      { id: 'TC-COM-104', name: 'Cart Item Quantity Synchronization Across Devices', suite: 'Client State', status: 'Passed', duration: '15ms', agent: 'FrontendAgent' },
      { id: 'TC-COM-105', name: 'PCI-DSS Zero Plain-Text PAN Storage Audit', suite: 'Security Suite', status: 'Passed', duration: '30ms', agent: 'SecurityAgent' }
    ];
  } else if (isFintech) {
    domain = 'Financial Technology & Capital Markets';
    projectTitle = cleanPrompt.includes(':') ? cleanPrompt.split(':')[0] : 'ApexPay: FinTech Settlement & Digital Ledger';
    primaryEntity = 'Transaction';
    primaryPlural = 'transactions';

    dbEntities = [
      {
        name: 'wallets',
        desc: 'Customer multi-currency digital balances',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'user_id', type: 'UUID (INDEXED)', key: true },
          { name: 'currency', type: 'VARCHAR(10)' },
          { name: 'balance_cents', type: 'BIGINT' },
          { name: 'status', type: 'ENUM (Active, Frozen, Closed)' }
        ]
      },
      {
        name: 'transactions',
        desc: 'Double-entry cryptographic ledger transaction journals',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'sender_wallet_id', type: 'UUID (FK -> wallets.id)', key: true },
          { name: 'recipient_wallet_id', type: 'UUID (FK -> wallets.id)', key: true },
          { name: 'amount_cents', type: 'BIGINT' },
          { name: 'status', type: 'ENUM (Pending, Settled, Rejected)' },
          { name: 'created_at', type: 'TIMESTAMP (INDEXED)' }
        ]
      },
      {
        name: 'aml_screenings',
        desc: 'Real-time anti-money laundering and risk fraud scoring',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'transaction_id', type: 'UUID (FK -> transactions.id)', key: true },
          { name: 'risk_score', type: 'FLOAT' },
          { name: 'flags', type: 'JSONB' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-FIN-101', name: 'Sub-Millisecond Atomic Ledger Double-Entry Verification', suite: 'Ledger Engine', status: 'Passed', duration: '9ms', agent: 'BackendAgent' },
      { id: 'TC-FIN-102', name: 'Real-Time AML Fraud Scoring Threshold Check', suite: 'Compliance Suite', status: 'Passed', duration: '18ms', agent: 'SecurityAgent' },
      { id: 'TC-FIN-103', name: 'Hardware Security Module (HSM) Key Signing', suite: 'Security Suite', status: 'Passed', duration: '14ms', agent: 'SecurityAgent' },
      { id: 'TC-FIN-104', name: 'Zero-Balance Race Condition Protection', suite: 'Transaction Suite', status: 'Passed', duration: '11ms', agent: 'ArchitectureAgent' }
    ];
  } else if (isLogistics) {
    domain = 'IoT & Supply Chain Logistics';
    projectTitle = cleanPrompt.includes(':') ? cleanPrompt.split(':')[0] : 'OmniTrack: Autonomous Fleet & IoT Telemetry';
    primaryEntity = 'Fleet Event';
    primaryPlural = 'fleet events';

    dbEntities = [
      {
        name: 'vehicles',
        desc: 'Active fleet vehicles and asset tracking devices',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'vin', type: 'VARCHAR(50) UNIQUE' },
          { name: 'status', type: 'ENUM (In_Transit, Idle, Maintenance)' },
          { name: 'fuel_level_percent', type: 'FLOAT' }
        ]
      },
      {
        name: 'telemetry_points',
        desc: 'High-frequency GPS and CAN-bus sensor telemetry logs',
        fields: [
          { name: 'id', type: 'BIGINT (PK)', key: true },
          { name: 'vehicle_id', type: 'UUID (FK -> vehicles.id)', key: true },
          { name: 'latitude', type: 'DECIMAL(9,6)' },
          { name: 'longitude', type: 'DECIMAL(9,6)' },
          { name: 'speed_kmh', type: 'FLOAT' },
          { name: 'recorded_at', type: 'TIMESTAMP (INDEXED)' }
        ]
      },
      {
        name: 'maintenance_alerts',
        desc: 'Predictive maintenance failure notifications',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'vehicle_id', type: 'UUID (FK -> vehicles.id)', key: true },
          { name: 'component', type: 'VARCHAR(100)' },
          { name: 'severity', type: 'ENUM (Critical, Warning, Info)' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-LOG-101', name: 'High-Throughput MQTT Ingestion (50,000 msg/sec)', suite: 'Ingestion Pipeline', status: 'Passed', duration: '14ms', agent: 'BackendAgent' },
      { id: 'TC-LOG-102', name: 'Geofence Boundary Violation Trigger Verification', suite: 'Spatial Engine', status: 'Passed', duration: '20ms', agent: 'ArchitectureAgent' },
      { id: 'TC-LOG-103', name: 'Edge Gateway mTLS Handshake Validation', suite: 'Security Suite', status: 'Passed', duration: '16ms', agent: 'SecurityAgent' }
    ];
  } else if (isSocial) {
    domain = 'Social Collaboration & Messaging';
    projectTitle = cleanPrompt.includes(':') ? cleanPrompt.split(':')[0] : 'NexusCollab: Real-Time Team Messaging';
    primaryEntity = 'Message';
    primaryPlural = 'messages';

    dbEntities = [
      {
        name: 'channels',
        desc: 'Collaboration workspaces and topic channels',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'is_private', type: 'BOOLEAN' }
        ]
      },
      {
        name: 'messages',
        desc: 'Threaded chat messages and broadcast payloads',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'channel_id', type: 'UUID (FK -> channels.id)', key: true },
          { name: 'sender_id', type: 'UUID (INDEXED)', key: true },
          { name: 'body', type: 'TEXT' },
          { name: 'created_at', type: 'TIMESTAMP (INDEXED)' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-SOC-101', name: 'WebSocket Message Fan-out Latency (<50ms)', suite: 'Real-Time Suite', status: 'Passed', duration: '12ms', agent: 'BackendAgent' },
      { id: 'TC-SOC-102', name: 'Message Content Sanitization & Link Preview Extraction', suite: 'Content Pipeline', status: 'Passed', duration: '18ms', agent: 'FrontendAgent' }
    ];
  } else {
    // Smart Universal Custom Generator
    domain = 'Enterprise Cloud Platform';
    projectTitle = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 48) + '...' : cleanPrompt;
    primaryEntity = 'Item';
    primaryPlural = 'workflow items';

    dbEntities = [
      {
        name: 'users',
        desc: 'Authenticated user accounts and authorization profiles',
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'email', type: 'VARCHAR(150) UNIQUE' },
          { name: 'full_name', type: 'VARCHAR(100)' },
          { name: 'role', type: 'VARCHAR(50)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'domain_records',
        desc: `Core business domain entities fulfilling: "${cleanPrompt.slice(0, 40)}"`,
        fields: [
          { name: 'id', type: 'UUID (PK)', key: true },
          { name: 'user_id', type: 'UUID (FK -> users.id)', key: true },
          { name: 'title', type: 'VARCHAR(250) NOT NULL' },
          { name: 'category', type: 'VARCHAR(100)' },
          { name: 'status', type: 'VARCHAR(50) (INDEXED)' },
          { name: 'priority', type: 'VARCHAR(50)' },
          { name: 'metadata_json', type: 'JSONB' },
          { name: 'updated_at', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'audit_logs',
        desc: 'Immutable compliance and state transition history',
        fields: [
          { name: 'id', type: 'BIGINT (PK)', key: true },
          { name: 'record_id', type: 'UUID (FK -> domain_records.id)', key: true },
          { name: 'action', type: 'VARCHAR(100)' },
          { name: 'actor_id', type: 'UUID' },
          { name: 'timestamp', type: 'TIMESTAMP (INDEXED)' }
        ]
      }
    ];

    testCases = [
      { id: 'TC-CUST-101', name: 'JWT Authentication & Password Hash Verification', suite: 'Authentication Suite', status: 'Passed', duration: '20ms', agent: 'SecurityAgent' },
      { id: 'TC-CUST-102', name: 'Core Entity Validation & State Transitions', suite: 'Business Logic', status: 'Passed', duration: '16ms', agent: 'BackendAgent' },
      { id: 'TC-CUST-103', name: 'Optimistic UI State Synchronizer', suite: 'Client Workspace', status: 'Passed', duration: '14ms', agent: 'FrontendAgent' },
      { id: 'TC-CUST-104', name: 'Database Query Indexing (<25ms latency target)', suite: 'Database Engine', status: 'Passed', duration: '18ms', agent: 'ArchitectureAgent' },
      { id: 'TC-CUST-105', name: 'Tenant Isolation & Authorization Boundary Checks', suite: 'Security Suite', status: 'Passed', duration: '22ms', agent: 'SecurityAgent' }
    ];
  }

  // Generate requirements matching the domain
  requirements = [
    {
      id: 'REQ-01',
      title: `Core Architectural Engine for ${domain}`,
      type: 'Functional',
      priority: 'Must Have',
      description: `Provide primary data pipeline, state machine, and processing workflows fulfilling: "${cleanPrompt}".`,
      metricValue: 'Sub-100ms API latency',
      acceptance: [
        'Structured RESTful API endpoints with JSON validation',
        'State machine validating all record transitions',
        'Transactional database operations with ACID isolation'
      ],
      affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'QAAgent']
    },
    {
      id: 'REQ-02',
      title: 'Authentication, RBAC & Data Isolation',
      type: 'Security',
      priority: 'Must Have',
      description: 'Enforce stateless authentication, encrypted credentials, and strict data isolation.',
      metricValue: '100% OWASP Compliance',
      acceptance: [
        'Bcrypt salted hashing on user passwords',
        'JWT tokens signed with HMAC-SHA256',
        'Row-level query filtering preventing unauthorized access'
      ],
      affectedAgents: ['SecurityAgent', 'BackendAgent']
    },
    {
      id: 'REQ-03',
      title: 'Real-Time Interactive Dashboard & Workstation',
      type: 'Functional',
      priority: 'Must Have',
      description: 'Deliver responsive single-page application with live updates, metric indicators, and action triggers.',
      metricValue: '60 FPS Smooth UI',
      acceptance: [
        'Responsive layout across mobile, tablet, and desktop viewports',
        'Optimistic updates with rollback on network failure',
        'Exportable metrics and filterable data tables'
      ],
      affectedAgents: ['FrontendAgent', 'UIUXAgent', 'AnalyticsAgent']
    },
    {
      id: 'REQ-04',
      title: 'High-Availability Database Persistence Layer',
      type: 'Non-Functional',
      priority: 'Must Have',
      description: 'Implement normalized schema with composite indexing for high-frequency queries.',
      metricValue: 'Sub-20ms DB Queries',
      acceptance: [
        'Normalized tables with foreign key constraints',
        'Composite B-Tree indexes on lookup attributes',
        'Automated migration scripts and backup protocol'
      ],
      affectedAgents: ['ArchitectureAgent', 'BackendAgent', 'DevOpsAgent']
    }
  ];

  epics = [
    { id: 'EPIC-01', title: 'System Architecture & Data Foundation', description: 'Database schema, core engine, and security boundaries', priority: 'Critical' },
    { id: 'EPIC-02', title: 'Interactive Client Workstation', description: 'User interface, state management, and real-time visualization', priority: 'High' },
    { id: 'EPIC-03', title: 'API Gateway & Business Logic Services', description: 'REST controllers, validation middleware, and notification services', priority: 'Critical' },
    { id: 'EPIC-04', title: 'Quality Assurance & Production Hardening', description: 'Automated test suites, security scans, and deployment automation', priority: 'High' }
  ];

  stories = [
    {
      id: 'STORY-101',
      epicId: 'EPIC-01',
      epic: 'System Architecture & Data Foundation',
      title: 'Relational Database Schema & Data Models',
      description: `Synthesize SQL schema with tables for ${dbEntities.map(e => e.name).join(', ')}.`,
      points: 8,
      priority: 'Critical',
      status: 'Done',
      assignee: 'BackendAgent',
      acceptanceCriteria: ['Foreign keys enforced', 'Composite indexes defined', 'Migration script verified'],
      tasks: []
    },
    {
      id: 'STORY-102',
      epicId: 'EPIC-01',
      epic: 'System Architecture & Data Foundation',
      title: 'Authentication & Session Token Security',
      description: 'Build user login, password hashing, and JWT middleware.',
      points: 5,
      priority: 'Critical',
      status: 'In_Progress',
      assignee: 'SecurityAgent',
      acceptanceCriteria: ['Bcrypt hashing with work factor 12', 'JWT sign and verify handlers', 'Protected route guards'],
      tasks: []
    },
    {
      id: 'STORY-103',
      epicId: 'EPIC-02',
      epic: 'Interactive Client Workstation',
      title: 'Interactive Dashboard with Live Metric Summaries',
      description: `Build responsive client view for managing ${primaryPlural} with filter tabs and real-time counters.`,
      points: 8,
      priority: 'Critical',
      status: 'In_Progress',
      assignee: 'FrontendAgent',
      acceptanceCriteria: ['Filter by status and priority', 'Interactive creation form', 'Dynamic completion metrics'],
      tasks: []
    },
    {
      id: 'STORY-104',
      epicId: 'EPIC-03',
      epic: 'API Gateway & Business Logic Services',
      title: 'RESTful API Controllers & CRUD Endpoints',
      description: `Synthesize Express endpoints for ${primaryPlural} management and stats.`,
      points: 8,
      priority: 'Critical',
      status: 'Done',
      assignee: 'BackendAgent',
      acceptanceCriteria: ['GET, POST, PUT, DELETE routes operational', 'JSON input validation', 'Error response formatting'],
      tasks: []
    },
    {
      id: 'STORY-105',
      epicId: 'EPIC-04',
      epic: 'Quality Assurance & Production Hardening',
      title: 'Automated Integration & Performance Test Suite',
      description: 'Implement automated tests verifying endpoints, token security, and sub-100ms response targets.',
      points: 5,
      priority: 'High',
      status: 'To_Do',
      assignee: 'QAAgent',
      acceptanceCriteria: ['100% test pass rate', 'Database load tests verified', 'Zero regression'],
      tasks: []
    }
  ];

  decisions = [
    {
      id: 'ADR-001',
      adrNumber: 1,
      title: `3-Tier Architecture Topology for ${domain}`,
      status: 'Accepted',
      context: `The project requires scalability, responsive UI, and robust data persistence to address: "${cleanPrompt}".`,
      decision: 'Adopt a modern 3-tier architecture with React 19 SPA, Express REST API, and Relational SQL data tier.',
      impact: 'Enables sub-100ms latency, independent scaling of services, and strict security boundaries.',
      proposedBy: 'ArchitectureAgent',
      approvedAt: new Date().toISOString()
    },
    {
      id: 'ADR-002',
      adrNumber: 2,
      title: 'Relational SQL Database Schema with Composite Indexes',
      status: 'Accepted',
      context: `High-frequency relational queries across ${dbEntities.map(e => e.name).join(', ')} require consistent ACID guarantees.`,
      decision: 'Implement normalized SQL tables with foreign keys and composite indexes for hot search and filter queries.',
      impact: 'Guarantees sub-20ms queries, referential integrity, and seamless horizontal read replication.',
      proposedBy: 'BackendAgent',
      approvedAt: new Date().toISOString()
    },
    {
      id: 'ADR-003',
      adrNumber: 3,
      title: 'Stateless JWT Authentication with Role-Based Access Control',
      status: 'Accepted',
      context: 'Secure access control required without maintaining expensive server-side session memory.',
      decision: 'Use signed JWT tokens with HttpOnly cookies and bcrypt salted password digests.',
      impact: 'Zero server session overhead, horizontal scaling, and protection against CSRF and token theft.',
      proposedBy: 'SecurityAgent',
      approvedAt: new Date().toISOString()
    },
    {
      id: 'ADR-004',
      adrNumber: 4,
      title: 'Optimistic State Updates with Rollback Resilience',
      status: 'Accepted',
      context: 'Users require instant visual feedback when modifying records and status flags.',
      decision: 'Implement optimistic client mutations that reconcile upon server response.',
      impact: '0ms perceived client latency, smooth animations, and high user satisfaction.',
      proposedBy: 'FrontendAgent',
      approvedAt: new Date().toISOString()
    }
  ];

  risks = [
    {
      id: 'RISK-01',
      title: 'Data Contention & Scale Bottlenecks',
      category: 'Technical',
      probability: 2,
      impact: 4,
      score: 8,
      level: 'Medium',
      mitigation: 'Implement composite database query indexing, connection pooling, and in-memory caching.',
      owner: 'ArchitectureAgent',
      status: 'Mitigated'
    },
    {
      id: 'RISK-02',
      title: 'Unauthorized Tenant Data Access (IDOR Vulnerability)',
      category: 'Security',
      probability: 2,
      impact: 5,
      score: 10,
      level: 'High',
      mitigation: 'Enforce strict row-level authorization middleware validating req.user.id on all database mutations.',
      owner: 'SecurityAgent',
      status: 'Open'
    },
    {
      id: 'RISK-03',
      title: 'Third-Party Integration Latency & Timeouts',
      category: 'Schedule',
      probability: 3,
      impact: 3,
      score: 9,
      level: 'Medium',
      mitigation: 'Implement circuit breakers, exponential backoff retries, and asynchronous background worker queues.',
      owner: 'BackendAgent',
      status: 'Open'
    }
  ];

  approvals = [
    {
      id: 'APP-ARCH-01',
      checkpointType: 'Architecture',
      agentId: 'ArchitectureAgent',
      summary: `Authorize ${domain} System Architecture & Relational Schema (ADR-001)`,
      recommendations: [
        `Confirm foreign key constraints between ${dbEntities.map(e => e.name).join(' and ')}`,
        'Validate composite indexing strategy for sub-20ms query performance'
      ],
      identifiedRisks: [
        'Query slowdown under high concurrency if composite indexes are omitted'
      ],
      affectedArtifacts: ['ADR-001-architecture.md', 'schema.sql'],
      status: 'Pending'
    },
    {
      id: 'APP-SEC-01',
      checkpointType: 'Security',
      agentId: 'SecurityAgent',
      summary: 'Authorize Security Controls, Bcrypt Encryption & Authorization Boundaries',
      recommendations: [
        'Enforce parameterized SQL queries across all endpoints',
        'Verify zero sensitive credentials in logs or responses'
      ],
      identifiedRisks: [
        'Potential IDOR vulnerability without row-level authorization filtering'
      ],
      affectedArtifacts: ['server.ts'],
      status: 'Pending'
    }
  ];

  // Dynamic code artifacts synthesized for the project
  const schemaSqlContent = `-- =======================================================
-- PMPilot Autonomous Database Architecture
-- Project: ${projectTitle}
-- Domain: ${domain}
-- Generated: ${new Date().toISOString()}
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

${dbEntities.map(entity => `
-- Table: ${entity.name} (${entity.desc})
CREATE TABLE IF NOT EXISTS ${entity.name} (
${entity.fields.map(f => `  ${f.name} ${f.type.replace(/ \(.+\)/, '')}${f.key && !f.type.includes('PK') ? ' NOT NULL' : ''}`).join(',\n')},
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_${entity.name}_lookup ON ${entity.name}(${entity.fields[0]?.name || 'id'});
`).join('\n')}
`;

  const serverTsContent = `import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'pmpilot-secure-secret-key';

// In-Memory Storage for ${projectTitle}
const store: Record<string, any[]> = {
${dbEntities.map(e => `  ${e.name}: []`).join(',\n')}
};

// 1. Authentication
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: 'usr_' + Date.now(), email, full_name, password_hash, created_at: new Date().toISOString() };
  store.users ? store.users.push(user) : store['users'] = [user];
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, full_name } });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = (store.users || []).find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
});

// 2. Resource CRUD Endpoints for ${dbEntities[1]?.name || 'records'}
app.get('/api/${dbEntities[1]?.name || 'records'}', (req: Request, res: Response) => {
  const items = store['${dbEntities[1]?.name || 'records'}'] || [];
  res.json({ items, count: items.length });
});

app.post('/api/${dbEntities[1]?.name || 'records'}', (req: Request, res: Response) => {
  const newItem = {
    id: 'rec_' + Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  if (!store['${dbEntities[1]?.name || 'records'}']) store['${dbEntities[1]?.name || 'records'}'] = [];
  store['${dbEntities[1]?.name || 'records'}'].push(newItem);
  res.status(201).json(newItem);
});

// 3. Operational Dashboard Stats
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  res.json({
    project: '${projectTitle}',
    domain: '${domain}',
    totalRecords: (store['${dbEntities[1]?.name || 'records'}'] || []).length,
    healthStatus: 'Optimal',
    timestamp: new Date().toISOString()
  });
});

app.listen(8080, () => console.log('${projectTitle} API listening on port 8080'));
`;

  const appViewTsxContent = `import React, { useState } from 'react';

export const ${projectTitle.replace(/[^a-zA-Z0-9]/g, '')}Dashboard: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', title: '${primaryEntity} Alpha 1', status: 'Active', category: 'Core', updated: 'Just now' },
    { id: '2', title: '${primaryEntity} Beta 2', status: 'Pending', category: 'Review', updated: '10m ago' }
  ]);
  const [filter, setFilter] = useState('All');

  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold">${projectTitle}</h2>
          <p className="text-xs text-slate-400">${domain}</p>
        </div>
        <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-mono">
          Live Operational View
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Total Items</span>
          <span className="text-xl font-bold text-white">{items.length}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Active Status</span>
          <span className="text-xl font-bold text-emerald-400">100%</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Health Index</span>
          <span className="text-xl font-bold text-indigo-400">98/100</span>
        </div>
      </div>
    </div>
  );
};
`;

  artifacts = [
    {
      id: 'ART-CUST-SCHEMA',
      name: 'Relational Database Schema (SQL DDL)',
      filename: 'schema.sql',
      category: 'Backend',
      language: 'sql',
      generatingAgent: 'BackendAgent',
      version: 1,
      lastUpdated: new Date().toLocaleTimeString(),
      content: schemaSqlContent
    },
    {
      id: 'ART-CUST-SERVER',
      name: 'RESTful API Server Controller',
      filename: 'server.ts',
      category: 'Backend',
      language: 'typescript',
      generatingAgent: 'BackendAgent',
      version: 1,
      lastUpdated: new Date().toLocaleTimeString(),
      content: serverTsContent
    },
    {
      id: 'ART-CUST-CLIENT',
      name: `${projectTitle} Dashboard UI`,
      filename: 'AppView.tsx',
      category: 'Frontend',
      language: 'typescript',
      generatingAgent: 'FrontendAgent',
      version: 1,
      lastUpdated: new Date().toLocaleTimeString(),
      content: appViewTsxContent
    },
    {
      id: 'ART-CUST-ADR',
      name: 'ADR-001: Architecture Specification',
      filename: 'ADR-001-architecture.md',
      category: 'Architecture',
      language: 'markdown',
      generatingAgent: 'ArchitectureAgent',
      version: 1,
      lastUpdated: new Date().toLocaleTimeString(),
      content: `# ADR-001: System Architecture Specification for ${projectTitle}

**Project Directive:** "${cleanPrompt}"  
**Domain:** ${domain}  
**Lead Agent:** ArchitectureAgent  
**Status:** Accepted  

## 1. Executive Strategy
This multi-agent architecture was autonomously synthesized by PMPilot to fulfill the user directive:
> "${cleanPrompt}"

## 2. 3-Tier Distributed Architecture
1. **Client Tier:** React 19 Single Page Application with optimistic state reconciliations, responsive grid layout, and real-time dashboard telemetry.
2. **API Services Tier:** Node.js Express REST API providing authenticated endpoints, input validation schemas, and rate-limiting middleware.
3. **Database Tier:** Normalized relational SQL schema (${dbEntities.map(e => e.name).join(', ')}) with primary keys, foreign keys, and composite indexes.
4. **Security & Governance Tier:** Stateless JWT authentication, salted Bcrypt password hashing, and row-level authorization boundaries.

## 3. Database Schema Overview
${dbEntities.map(e => `### Table: \`${e.name}\`
- **Purpose:** ${e.desc}
- **Fields:** ${e.fields.map(f => `\`${f.name}\` (${f.type})`).join(', ')}
`).join('\n')}
`
    }
  ];

  return {
    key: `custom_${slug}_${Date.now()}`,
    name: projectTitle,
    domain,
    tagline: `Autonomously synthesized SDLC architecture for "${cleanPrompt}"`,
    description: `Dynamic multi-agent project architecture tailored by PMPilot to address: "${cleanPrompt}". Features end-to-end scope decomposition, formal requirements specification, relational database schema, interactive client dashboard, Express REST API, automated QA test suites, and executive sign-off.`,
    scaleConstraints: 'Engineered for high concurrent throughput with decoupled microservices, sub-100ms API response times, and zero-trust security boundaries.',
    targetLaunch: 'Q4 2026 (28-day critical path)',
    financialParams: {
      teamSize: 4,
      blendedHourlyRate: 75,
      cloudTier: 'Growth',
      contingencyPercent: 15
    },
    requirements,
    epics,
    stories,
    decisions,
    risks,
    artifacts,
    milestones: [
      { id: 'M-1', title: 'Charter, Scope & Requirements Elicitation', targetDay: 4, status: 'Completed', dependencies: [] },
      { id: 'M-2', title: 'Relational Database Schema & Architecture Sign-Off', targetDay: 8, status: 'Completed', dependencies: ['M-1'] },
      { id: 'M-3', title: 'REST API & Interactive Client Synthesis', targetDay: 18, status: 'Pending', dependencies: ['M-2'] },
      { id: 'M-4', title: 'QA Test Verification & Security Audit', targetDay: 24, status: 'Pending', dependencies: ['M-3'] },
      { id: 'M-5', title: 'Cloud Deployment & Final Handover', targetDay: 28, status: 'Pending', dependencies: ['M-4'] }
    ],
    dbEntities,
    testCases,
    approvals
  };
}

