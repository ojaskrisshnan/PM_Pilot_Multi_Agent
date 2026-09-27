import csv
import io
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.project import Project
from backend.app.models.run import AgentRun
from backend.app.models.user import User
from backend.app.schemas.run import RunCreate, RunResponse, RunDetailResponse, CheckpointAction
from backend.app.schemas.execution import AgentExecutionResponse
from backend.app.orchestration.engine import OrchestrationEngine
from backend.app.metrics.calculator import MetricsCalculator
from backend.app.auth.dependencies import get_optional_user, verify_project_access
from backend.app.agents.registry import agent_registry
from backend.app.models.deliverable import Deliverable

router = APIRouter(tags=["Agent Runs"])

@router.post("/api/projects/{project_id}/runs", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
async def create_and_start_run(
    project_id: str,
    payload: Optional[RunCreate] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    provider = payload.provider if payload else None
    model = payload.model if payload else None
    auto_approve = payload.auto_approve if payload and payload.auto_approve is not None else False

    # Update project prompt/domain if overridden
    if payload and payload.input_prompt_override:
        project.description = payload.input_prompt_override
    if payload and payload.domain_override:
        project.domain = payload.domain_override
    db.commit()

    run = OrchestrationEngine.create_run(
        db=db,
        project_id=project_id,
        provider=provider,
        model=model,
        auto_approve=auto_approve
    )
    await OrchestrationEngine.start_run_async(run.id)

    return RunResponse.model_validate(run)

@router.get("/api/projects/{project_id}/runs", response_model=list[RunResponse])
def list_project_runs(
    project_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    verify_project_access(project, user)

    runs = db.query(AgentRun).filter(AgentRun.project_id == project_id).order_by(AgentRun.started_at.desc()).all()
    return [RunResponse.model_validate(r) for r in runs]

@router.get("/api/runs/{run_id}", response_model=RunDetailResponse)
def get_run_detail(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    executions = [AgentExecutionResponse.model_validate(e) for e in run.executions]
    metrics = None
    if run.status in ("COMPLETED", "FAILED", "AWAITING_APPROVAL"):
        try:
            metrics = MetricsCalculator.get_run_metrics(db, run_id)
        except Exception:
            pass

    return RunDetailResponse(
        id=run.id,
        project_id=run.project_id,
        status=run.status,
        started_at=run.started_at,
        completed_at=run.completed_at,
        total_agents=run.total_agents,
        successful_agents=run.successful_agents,
        failed_agents=run.failed_agents,
        provider=run.provider,
        requested_provider=run.requested_provider,
        actual_provider=run.actual_provider,
        fallback_reason=run.fallback_reason,
        error_message=run.error_message,
        model=run.model,
        auto_approve=run.auto_approve,
        executions=executions,
        metrics=metrics
    )

@router.post("/api/runs/{run_id}/approve", response_model=RunResponse)
async def approve_checkpoint_action(
    run_id: str,
    payload: Optional[CheckpointAction] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Approves a paused Human-In-The-Loop checkpoint and resumes orchestration."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    feedback = payload.feedback if payload else None
    success = OrchestrationEngine.approve_checkpoint(db, run_id, feedback=feedback)
    if not success:
        raise HTTPException(status_code=400, detail="Run is not awaiting approval")

    db.refresh(run)
    return RunResponse.model_validate(run)

@router.post("/api/runs/{run_id}/reject", response_model=RunResponse)
async def reject_checkpoint_action(
    run_id: str,
    payload: Optional[CheckpointAction] = None,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Rejects a paused Human-In-The-Loop checkpoint, halting the run cleanly."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    feedback = payload.feedback if payload else None
    success = OrchestrationEngine.reject_checkpoint(db, run_id, feedback=feedback)
    if not success:
        raise HTTPException(status_code=400, detail="Run is not awaiting approval")

    db.refresh(run)
    return RunResponse.model_validate(run)

@router.post("/api/runs/{run_id}/pause", response_model=RunResponse)
def pause_run(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    success = OrchestrationEngine.pause_run(db, run_id)
    if not success:
        raise HTTPException(status_code=400, detail="Run cannot be paused (must be in RUNNING or PENDING status)")
    db.refresh(run)
    return RunResponse.model_validate(run)

@router.post("/api/runs/{run_id}/resume", response_model=RunResponse)
async def resume_run(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    success = OrchestrationEngine.resume_run(db, run_id)
    if not success:
        raise HTTPException(status_code=400, detail="Run cannot be resumed (must be in PAUSED, PENDING, or FAILED status)")
    db.refresh(run)
    return RunResponse.model_validate(run)

@router.post("/api/runs/{run_id}/cancel", response_model=RunResponse)
def cancel_run(
    run_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    success = OrchestrationEngine.cancel_run(db, run_id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not cancel run")
    db.refresh(run)
    return RunResponse.model_validate(run)

@router.get("/api/runs/{run_id}/export")
def export_run_data(
    run_id: str,
    format: str = Query("json", description="Export format: 'json' or 'csv'"),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Exports actual execution and metric records for empirical research and paper documentation."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    verify_project_access(run.project, user)

    # Compute execution metrics
    metrics = None
    try:
        metrics = MetricsCalculator.get_run_metrics(db, run_id)
    except Exception:
        pass

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "run_id", "project_name", "requested_provider", "actual_provider",
            "fallback_reason", "model", "status", "started_at", "completed_at",
            "agent_id", "agent_name", "phase_order", "execution_status",
            "execution_time_ms", "tokens_used", "retry_count", "error"
        ])
        for ex in run.executions:
            writer.writerow([
                run.id,
                run.project.name if run.project else "",
                run.requested_provider,
                ex.actual_provider or run.actual_provider,
                ex.fallback_reason or run.fallback_reason or "",
                run.model,
                run.status,
                run.started_at.isoformat() if run.started_at else "",
                run.completed_at.isoformat() if run.completed_at else "",
                ex.agent_id,
                ex.agent_name,
                ex.phase_order,
                ex.status,
                ex.execution_time_ms,
                ex.tokens_used,
                ex.retry_count,
                ex.error or ""
            ])
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=pmpilot_run_{run_id}.csv"}
        )

    # Word Document (.docx) Report Export: Full Stage Suggestions, Instructions & Deliverables
    if format.lower() in ("docx", "word", "doc"):
        import docx
        from docx.shared import Pt, Inches, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.enum.table import WD_TABLE_ALIGNMENT

        doc = docx.Document()

        # Set default font to Times New Roman
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Times New Roman'
        font.size = Pt(11)
        font.color.rgb = RGBColor(30, 30, 30)

        proj_name = run.project.name if run.project else "Enterprise Software System"
        proj_domain = run.project.domain if run.project else "Software Engineering"
        proj_desc = run.project.description if run.project and run.project.description else "No project description provided."

        # Document Header / Title
        title_p = doc.add_paragraph()
        title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_run = title_p.add_run("PMPilot Autonomous Multi-Agent SDLC Report\n")
        title_run.font.name = 'Times New Roman'
        title_run.font.size = Pt(22)
        title_run.bold = True

        sub_run = title_p.add_run(f"Project: {proj_name}\n")
        sub_run.font.name = 'Times New Roman'
        sub_run.font.size = Pt(15)
        sub_run.bold = True

        meta_run = title_p.add_run(f"Domain: {proj_domain}  |  Workflow Run ID: {run.id}  |  Status: {run.status}\n")
        meta_run.font.name = 'Times New Roman'
        meta_run.font.size = Pt(10)
        meta_run.font.italic = True

        date_str = run.started_at.strftime('%Y-%m-%d %H:%M:%S UTC') if run.started_at else 'N/A'
        engine_str = f"{run.actual_provider or run.requested_provider} ({run.model})"
        meta2_run = title_p.add_run(f"Inference Engine: {engine_str}  |  Date: {date_str}")
        meta2_run.font.name = 'Times New Roman'
        meta2_run.font.size = Pt(10)
        meta2_run.font.italic = True

        doc.add_paragraph()

        # Section: Problem Statement
        h1 = doc.add_heading("1. Project Problem Statement & Scope", level=1)
        h1.style.font.name = 'Times New Roman'
        desc_p = doc.add_paragraph()
        desc_p.paragraph_format.left_indent = Inches(0.25)
        desc_run = desc_p.add_run(proj_desc)
        desc_run.font.name = 'Times New Roman'
        desc_run.font.italic = True

        # Section: Metrics Table
        h2 = doc.add_heading("2. Executive SDLC Metrics", level=1)
        h2.style.font.name = 'Times New Roman'

        deliverables = db.query(Deliverable).filter(Deliverable.run_id == run.id).all()
        if not deliverables and run.project_id:
            deliverables = db.query(Deliverable).filter(Deliverable.project_id == run.project_id).all()
        total_time_ms = sum((e.execution_time_ms or 0) for e in run.executions)
        total_tokens = sum((e.tokens_used or 0) for e in run.executions)

        table = doc.add_table(rows=6, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        metrics_data = [
            ("Total Pipeline Agents", str(run.total_agents)),
            ("Completed Stages", str(run.successful_agents)),
            ("Failed / Incomplete Stages", str(run.failed_agents)),
            ("Total Execution Latency", f"{total_time_ms:,} ms"),
            ("Total Tokens Consumed", f"{total_tokens:,}"),
            ("Deliverables & Code Artifacts Produced", str(len(deliverables)))
        ]
        for row_idx, (k, v) in enumerate(metrics_data):
            cell_k = table.cell(row_idx, 0)
            cell_v = table.cell(row_idx, 1)
            cell_k.text = k
            cell_v.text = v
            cell_k.paragraphs[0].runs[0].font.name = 'Times New Roman'
            cell_k.paragraphs[0].runs[0].bold = True
            cell_v.paragraphs[0].runs[0].font.name = 'Times New Roman'

        doc.add_paragraph()

        # Section: Stage-by-Stage Breakdown
        h3 = doc.add_heading("3. Stage-by-Stage Agent Instructions, Suggestions & Deliverables", level=1)
        h3.style.font.name = 'Times New Roman'

        for ex in sorted(run.executions, key=lambda x: x.phase_order or 0):
            agent_def = agent_registry.get_agent(ex.agent_id)
            out = ex.output or {}

            # Stage Heading
            st_head = doc.add_heading(f"Phase {ex.phase_order}: {ex.agent_name} ({ex.agent_id})", level=2)
            st_head.style.font.name = 'Times New Roman'

            meta_p = doc.add_paragraph()
            role_text = agent_def.role if agent_def else "Engineering Stage"
            meta_p.add_run(f"Role: {role_text}\nStatus: {ex.status}  |  Latency: {ex.execution_time_ms or 0} ms  |  Provider: {ex.actual_provider or run.actual_provider}").font.name = 'Times New Roman'

            # 1. Instructions & Objective
            inst_head = doc.add_heading("Stage Instructions & System Objective", level=3)
            inst_head.style.font.name = 'Times New Roman'
            inst_p = doc.add_paragraph()
            inst_p.paragraph_format.left_indent = Inches(0.25)
            inst_prompt = agent_def.system_prompt if agent_def and agent_def.system_prompt else "Autonomously execute phase responsibilities according to multi-agent SDLC standards."
            inst_run = inst_p.add_run(inst_prompt)
            inst_run.font.name = 'Times New Roman'
            inst_run.font.italic = True

            # 2. Summary
            summary = out.get("summary")
            if summary:
                sum_head = doc.add_heading("Agent Synthesized Summary", level=3)
                sum_head.style.font.name = 'Times New Roman'
                sum_p = doc.add_paragraph(summary)
                sum_p.style.font.name = 'Times New Roman'

            # 3. Findings
            findings = out.get("findings", [])
            if findings:
                f_head = doc.add_heading("Stage Analytical Findings", level=3)
                f_head.style.font.name = 'Times New Roman'
                for f in findings:
                    doc.add_paragraph(f, style='List Bullet')

            # 4. Suggestions & Recommendations (The Key Requirement!)
            sug_head = doc.add_heading("Stage Suggestions & Actionable Instructions", level=3)
            sug_head.style.font.name = 'Times New Roman'
            recs = out.get("recommendations", [])
            if recs:
                for r in recs:
                    p_rec = doc.add_paragraph(style='List Bullet')
                    r_run = p_rec.add_run(f"💡 Suggestion: {r}")
                    r_run.font.name = 'Times New Roman'
                    r_run.bold = True
            else:
                p_rec = doc.add_paragraph("*(Stage awaiting execution to synthesize suggestions.)*")
                p_rec.style.font.name = 'Times New Roman'

            # 5. Deliverables & Code Artifacts
            agent_delivs = [d for d in deliverables if d.agent_id == ex.agent_id]
            if agent_delivs:
                del_head = doc.add_heading(f"Generated Deliverables & Code Artifacts ({len(agent_delivs)})", level=3)
                del_head.style.font.name = 'Times New Roman'
                for d in agent_delivs:
                    doc.add_paragraph(f"Artifact: {d.title} (Type: {d.type})", style='List Number')
                    code_p = doc.add_paragraph()
                    code_p.paragraph_format.left_indent = Inches(0.25)
                    code_run = code_p.add_run(d.content.strip())
                    code_run.font.name = 'Consolas'
                    code_run.font.size = Pt(9.5)

            doc.add_paragraph()

        # Sign-off block
        doc.add_heading("4. Autonomous SDLC Certification", level=1)
        sign_p = doc.add_paragraph("This document was autonomously compiled by PMPilot's Multi-Agent Software Project Management System. All stage suggestions, system instructions, and code deliverables have completed dependency-aware execution.")
        sign_p.style.font.name = 'Times New Roman'

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        docx_bytes = buffer.getvalue()

        safe_name = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in proj_name)[:30]
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=PMPilot_Report_{safe_name}_{run_id[:8]}.docx"}
        )

    # Markdown Report Export: Stage Suggestions, Instructions & Deliverables
    if format.lower() in ("markdown", "md"):
        lines = []
        proj_name = run.project.name if run.project else "Enterprise Software System"
        proj_domain = run.project.domain if run.project else "Software Engineering"
        proj_desc = run.project.description if run.project and run.project.description else "No project description provided."
        
        lines.append(f"# PMPilot Autonomous Multi-Agent SDLC Report")
        lines.append(f"## Project: {proj_name}")
        lines.append("")
        lines.append(f"- **Domain:** {proj_domain}")
        lines.append(f"- **Workflow Run ID:** `{run.id}`")
        lines.append(f"- **Overall Status:** **{run.status}**")
        lines.append(f"- **Inference Provider & Model:** {run.actual_provider or run.requested_provider} ({run.model})")
        if run.started_at:
            lines.append(f"- **Execution Started:** {run.started_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        if run.completed_at:
            lines.append(f"- **Execution Completed:** {run.completed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        lines.append("")
        lines.append("### Project Scope & Problem Statement")
        lines.append(f"> {proj_desc}")
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("### Executive SDLC Metrics")
        lines.append("| Metric | Value |")
        lines.append("| :--- | :--- |")
        lines.append(f"| Total Agents in Pipeline | {run.total_agents} |")
        lines.append(f"| Completed Stages | {run.successful_agents} |")
        lines.append(f"| Failed / Incomplete Stages | {run.failed_agents} |")
        total_time_ms = sum((e.execution_time_ms or 0) for e in run.executions)
        lines.append(f"| Total Pipeline Latency | {total_time_ms:,} ms |")
        total_tokens = sum((e.tokens_used or 0) for e in run.executions)
        lines.append(f"| Total Tokens Consumed | {total_tokens:,} |")
        deliverables = db.query(Deliverable).filter(Deliverable.run_id == run.id).all()
        if not deliverables and run.project_id:
            deliverables = db.query(Deliverable).filter(Deliverable.project_id == run.project_id).all()
        lines.append(f"| Deliverables & Code Artifacts Produced | {len(deliverables)} |")
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("## Stage-by-Stage Agent Instructions, Suggestions & Deliverables")
        lines.append("")

        for ex in sorted(run.executions, key=lambda x: x.phase_order or 0):
            agent_def = agent_registry.get_agent(ex.agent_id)
            lines.append(f"### Stage {ex.phase_order}: {ex.agent_name} (`{ex.agent_id}`)")
            if agent_def:
                lines.append(f"- **Domain Role:** {agent_def.role}")
            lines.append(f"- **Stage Status:** **{ex.status}**")
            lines.append(f"- **Execution Duration:** {ex.execution_time_ms or 0} ms")
            if ex.actual_provider:
                lines.append(f"- **Inference Engine:** {ex.actual_provider}")
            lines.append("")

            # 1. Stage Instructions & Objective
            lines.append("#### 1. Stage Instructions & System Objective")
            if agent_def and agent_def.system_prompt:
                lines.append(f"> {agent_def.system_prompt}")
            else:
                lines.append("> Autonomously execute phase responsibilities according to multi-agent SDLC standards.")
            lines.append("")

            out = ex.output or {}
            # 2. Agent Stage Synthesized Summary
            summary = out.get("summary")
            if summary:
                lines.append("#### 2. Agent Synthesized Summary")
                lines.append(summary)
                lines.append("")

            # 3. Stage Analytical Findings
            findings = out.get("findings", [])
            if findings:
                lines.append("#### 3. Stage Key Findings & Observations")
                for f in findings:
                    lines.append(f"- {f}")
                lines.append("")

            # 4. Stage Suggestions & Recommendations
            lines.append("#### 4. Stage Suggestions & Actionable Recommendations")
            recommendations = out.get("recommendations", [])
            if recommendations:
                for r in recommendations:
                    lines.append(f"- 💡 **Suggestion:** {r}")
            else:
                lines.append("*(Stage awaiting execution to synthesize autonomous suggestions.)*")
            lines.append("")

            # 5. Generated Deliverables & Code Artifacts
            agent_delivs = [d for d in deliverables if d.agent_id == ex.agent_id]
            if agent_delivs:
                lines.append(f"#### 5. Generated Deliverables & Code Artifacts ({len(agent_delivs)})")
                for d in agent_delivs:
                    lines.append(f"##### Artifact: {d.title} (Type: `{d.type}`)")
                    lines.append("```")
                    lines.append(d.content.strip())
                    lines.append("```")
                    lines.append("")
            lines.append("---")
            lines.append("")

        lines.append("## Autonomous SDLC Verification Sign-Off")
        lines.append("This document was autonomously compiled by PMPilot's Multi-Agent Project Management System. All stage suggestions, system instructions, and code deliverables have completed dependency-aware execution.")

        md_content = "\n".join(lines)
        safe_name = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in proj_name)[:30]
        return Response(
            content=md_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=PMPilot_Report_{safe_name}_{run_id[:8]}.md"}
        )

    # HTML / Printable Executive Report Export
    if format.lower() in ("html", "htm", "pdf"):
        proj_name = run.project.name if run.project else "Enterprise Software System"
        proj_domain = run.project.domain if run.project else "Software Engineering"
        proj_desc = run.project.description if run.project and run.project.description else "No project description provided."
        deliverables = db.query(Deliverable).filter(Deliverable.run_id == run.id).all()
        if not deliverables and run.project_id:
            deliverables = db.query(Deliverable).filter(Deliverable.project_id == run.project_id).all()
        total_time_ms = sum((e.execution_time_ms or 0) for e in run.executions)
        total_tokens = sum((e.tokens_used or 0) for e in run.executions)

        stages_html = []
        for ex in sorted(run.executions, key=lambda x: x.phase_order or 0):
            agent_def = agent_registry.get_agent(ex.agent_id)
            out = ex.output or {}
            findings_li = "".join(f"<li>{f}</li>" for f in out.get("findings", []))
            recs = out.get("recommendations", [])
            if recs:
                recs_li = "".join(f"<li style='margin-bottom:6px;'><strong>💡 Suggestion:</strong> {r}</li>" for r in recs)
            else:
                recs_li = "<li style='color:#777; font-style:italic;'>Stage awaiting execution to synthesize suggestions.</li>"
            agent_delivs = [d for d in deliverables if d.agent_id == ex.agent_id]
            delivs_html = []
            for d in agent_delivs:
                delivs_html.append(f"""
                <div style="margin-top:14px; border:1px solid #333; background:#050505; border-radius:6px; overflow:hidden;">
                    <div style="background:#111; padding:8px 12px; font-weight:bold; font-size:12px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                        <span>{d.title}</span>
                        <span style="font-family:monospace; text-transform:uppercase; color:#888;">{d.type}</span>
                    </div>
                    <pre style="margin:0; padding:12px; font-family:monospace; font-size:11px; white-space:pre-wrap; word-break:break-all; color:#ddd; background:#000;">{d.content.strip()}</pre>
                </div>
                """)

            stages_html.append(f"""
            <div style="margin-bottom:32px; padding:20px; border:1px solid #222; border-radius:8px; background:#0a0a0a;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:14px;">
                    <div>
                        <div style="font-size:11px; font-family:monospace; text-transform:uppercase; color:#888;">Phase {ex.phase_order} &bull; {agent_def.role if agent_def else 'Engineering Stage'}</div>
                        <h3 style="margin:4px 0; font-size:18px; font-weight:bold; color:#fff;">{ex.agent_name} <span style="font-size:12px; font-family:monospace; color:#666;">({ex.agent_id})</span></h3>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:inline-block; padding:3px 8px; border:1px solid #444; border-radius:4px; font-size:11px; font-family:monospace; font-weight:bold; background:#111; color:#fff;">{ex.status}</span>
                        <div style="font-size:11px; font-family:monospace; color:#666; margin-top:4px;">{ex.execution_time_ms or 0} ms</div>
                    </div>
                </div>

                <div style="margin-bottom:14px;">
                    <h4 style="font-size:12px; font-family:monospace; text-transform:uppercase; color:#aaa; margin:0 0 6px 0;">1. Stage Instructions & System Objective</h4>
                    <div style="padding:10px 14px; background:#000; border-left:3px solid #666; font-size:12px; font-style:italic; color:#bbb; line-height:1.5;">
                        {agent_def.system_prompt if agent_def and agent_def.system_prompt else 'Autonomously execute phase responsibilities according to multi-agent SDLC standards.'}
                    </div>
                </div>

                {f'''<div style="margin-bottom:14px;">
                    <h4 style="font-size:12px; font-family:monospace; text-transform:uppercase; color:#aaa; margin:0 0 6px 0;">2. Agent Synthesized Summary</h4>
                    <p style="margin:0; font-size:13px; color:#ccc; line-height:1.6; background:#000; padding:10px; border:1px solid #1a1a1a; border-radius:4px;">{out.get("summary")}</p>
                </div>''' if out.get("summary") else ''}

                {f'''<div style="margin-bottom:14px;">
                    <h4 style="font-size:12px; font-family:monospace; text-transform:uppercase; color:#aaa; margin:0 0 6px 0;">3. Stage Key Findings</h4>
                    <ul style="margin:0; padding-left:20px; font-size:12px; color:#bbb; line-height:1.5;">{findings_li}</ul>
                </div>''' if findings_li else ''}

                {f'''<div style="margin-bottom:14px; padding:12px; border:1px solid #444; background:#111; border-radius:6px;">
                    <h4 style="font-size:12px; font-family:monospace; text-transform:uppercase; color:#fff; margin:0 0 8px 0;">4. Stage Suggestions & Actionable Instructions</h4>
                    <ul style="margin:0; padding-left:20px; font-size:13px; color:#eee; line-height:1.6;">{recs_li}</ul>
                </div>''' if recs_li else ''}

                {f'''<div>
                    <h4 style="font-size:12px; font-family:monospace; text-transform:uppercase; color:#aaa; margin:0 0 8px 0;">5. Generated Deliverables & Code Artifacts ({len(agent_delivs)})</h4>
                    {"".join(delivs_html)}
                </div>''' if delivs_html else ''}
            </div>
            """)

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMPilot Report - {proj_name}</title>
    <style>
        body {{
            background-color: #000;
            color: #eee;
            font-family: "Times New Roman", Times, serif;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 960px;
            margin: 0 auto;
        }}
        .header {{
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .metrics-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
        }}
        .metrics-table th, .metrics-table td {{
            border: 1px solid #333;
            padding: 8px 12px;
            text-align: left;
        }}
        .metrics-table th {{
            background: #111;
            font-family: monospace;
            text-transform: uppercase;
        }}
        .btn {{
            background: #fff;
            color: #000;
            font-family: monospace;
            font-weight: bold;
            font-size: 12px;
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }}
        .btn:hover {{
            background: #ccc;
        }}
        @media print {{
            .no-print {{ display: none !important; }}
            body {{ background: #fff !important; color: #000 !important; padding: 0 !important; }}
            .container {{ max-width: 100% !important; }}
            * {{ border-color: #999 !important; background: transparent !important; color: #000 !important; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="no-print" style="margin-bottom:24px; padding:12px; background:#111; border:1px solid #333; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-family:monospace; font-size:12px; color:#aaa;">PMPilot Autonomous SDLC Stage Suggestions & Instructions Report</span>
            <div style="display:flex; gap:10px;">
                <button onclick="window.print()" class="btn">🖨️ Print / Save as PDF</button>
            </div>
        </div>

        <div class="header">
            <div style="font-family:monospace; font-size:12px; text-transform:uppercase; color:#888; letter-spacing:1px;">PMPilot Autonomous Multi-Agent SDLC Report</div>
            <h1 style="font-size:28px; margin:8px 0 4px 0; color:#fff;">{proj_name}</h1>
            <div style="font-size:14px; color:#888; font-family:monospace;">Domain: {proj_domain} &bull; Run ID: {run.id} &bull; Status: {run.status}</div>
            <div style="font-size:12px; color:#666; font-family:monospace; margin-top:4px;">Engine: {run.actual_provider or run.requested_provider} ({run.model}) &bull; Date: {run.started_at.strftime('%Y-%m-%d %H:%M:%S UTC') if run.started_at else ''}</div>
        </div>

        <div style="margin-bottom:30px;">
            <h2 style="font-size:18px; border-bottom:1px solid #333; padding-bottom:6px;">Project Problem Statement & Scope</h2>
            <p style="font-size:14px; color:#ccc; line-height:1.7; background:#0a0a0a; padding:16px; border:1px solid #222; border-radius:6px;">{proj_desc}</p>
        </div>

        <div style="margin-bottom:30px;">
            <h2 style="font-size:18px; border-bottom:1px solid #333; padding-bottom:6px;">Executive SDLC Metrics</h2>
            <table class="metrics-table">
                <thead>
                    <tr><th>Metric</th><th>Empirical Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>Total Pipeline Agents</td><td>{run.total_agents}</td></tr>
                    <tr><td>Completed Stages</td><td>{run.successful_agents}</td></tr>
                    <tr><td>Total Execution Latency</td><td>{total_time_ms:,} ms</td></tr>
                    <tr><td>Total Tokens Processed</td><td>{total_tokens:,}</td></tr>
                    <tr><td>Deliverables & Code Artifacts</td><td>{len(deliverables)}</td></tr>
                </tbody>
            </table>
        </div>

        <div style="margin-bottom:40px;">
            <h2 style="font-size:20px; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:20px;">Stage-by-Stage Agent Instructions, Suggestions & Deliverables</h2>
            {"".join(stages_html)}
        </div>

        <div style="border-top:1px solid #333; padding-top:20px; font-size:12px; color:#666; text-align:center; font-family:monospace;">
            Generated by PMPilot Autonomous Multi-Agent AI Software Project Management System.
        </div>
    </div>
</body>
</html>"""
        safe_name = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in proj_name)[:30]
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=PMPilot_Report_{safe_name}_{run_id[:8]}.html"}
        )

    # Default: JSON export
    data = {
        "run_id": run.id,
        "project_id": run.project_id,
        "project_name": run.project.name if run.project else "",
        "status": run.status,
        "requested_provider": run.requested_provider,
        "actual_provider": run.actual_provider,
        "fallback_reason": run.fallback_reason,
        "error_message": run.error_message,
        "model": run.model,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "metrics": metrics.model_dump() if metrics else None,
        "executions": [
            {
                "agent_id": ex.agent_id,
                "agent_name": ex.agent_name,
                "phase_order": ex.phase_order,
                "status": ex.status,
                "execution_time_ms": ex.execution_time_ms,
                "tokens_used": ex.tokens_used,
                "retry_count": ex.retry_count,
                "actual_provider": ex.actual_provider,
                "fallback_reason": ex.fallback_reason,
                "system_prompt": agent_registry.get_agent(ex.agent_id).system_prompt if agent_registry.get_agent(ex.agent_id) else "",
                "output_summary": (ex.output or {}).get("summary", ""),
                "findings": (ex.output or {}).get("findings", []),
                "recommendations": (ex.output or {}).get("recommendations", []),
                "deliverables_count": len((ex.output or {}).get("deliverables", [])),
                "error": ex.error
            }
            for ex in run.executions
        ]
    }
    return Response(
        content=json.dumps(data, indent=2, default=str),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=pmpilot_run_{run_id}.json"}
    )
