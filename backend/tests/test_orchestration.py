import pytest
from backend.app.agents.registry import agent_registry
from backend.app.orchestration.engine import OrchestrationEngine
from backend.app.models.run import AgentRun
from backend.app.models.execution import AgentExecution
from backend.app.models.deliverable import Deliverable
from backend.app.models.project import Project

def test_registry_has_exact_17_agents():
    agents = agent_registry.list_agents()
    assert len(agents) == 17
    # Verify graph is acyclic
    assert agent_registry.validate_dependency_graph() is True

def test_run_creation_initializes_17_executions(db_session):
    project = Project(name="Test Project", description="Testing multi-agent run")
    db_session.add(project)
    db_session.commit()

    run = OrchestrationEngine.create_run(db=db_session, project_id=project.id, provider="mock")
    assert run.id is not None
    assert run.total_agents == 17
    assert run.status == "PENDING"

    executions = db_session.query(AgentExecution).filter(AgentExecution.run_id == run.id).all()
    assert len(executions) == 17

@pytest.mark.asyncio
async def test_full_17_agent_execution_and_deliverables(db_session):
    project = Project(name="Autonomous Healthcare EMR", description="HIPAA compliant patient portal")
    db_session.add(project)
    db_session.commit()

    run = OrchestrationEngine.create_run(db=db_session, project_id=project.id, provider="mock", auto_approve=True)
    run_id = run.id

    # Execute synchronous test run
    await OrchestrationEngine.execute_run(run_id, db=db_session)

    db_session.expire_all()
    updated_run = db_session.query(AgentRun).filter(AgentRun.id == run_id).first()
    assert updated_run.status == "COMPLETED"
    assert updated_run.successful_agents == 17
    assert updated_run.failed_agents == 0

    # Verify all 17 executions have completed status and structured outputs
    executions = db_session.query(AgentExecution).filter(AgentExecution.run_id == run_id).all()
    for ex in executions:
        assert ex.status == "COMPLETED"
        assert ex.execution_time_ms >= 0
        assert "summary" in ex.output

    # Verify deliverables created in database
    deliverables = db_session.query(Deliverable).filter(Deliverable.run_id == run_id).all()
    assert len(deliverables) >= 17

@pytest.mark.asyncio
async def test_hitl_approval_and_resumption(db_session):
    # Verify Phase 12: Run pauses at ArchitectureAgent when auto_approve=False
    project = Project(name="HITL Verification System", description="Testing approval gate")
    db_session.add(project)
    db_session.commit()

    run = OrchestrationEngine.create_run(db=db_session, project_id=project.id, provider="mock", auto_approve=False)
    run_id = run.id

    # Execute run; should pause at ArchitectureAgent
    await OrchestrationEngine.execute_run(run_id, db=db_session)

    db_session.expire_all()
    paused_run = db_session.query(AgentRun).filter(AgentRun.id == run_id).first()
    assert paused_run.status == "AWAITING_APPROVAL"

    arch_exec = db_session.query(AgentExecution).filter(
        AgentExecution.run_id == run_id,
        AgentExecution.agent_id == "ArchitectureAgent"
    ).first()
    assert arch_exec.status == "AWAITING_APPROVAL"

    # Human reviews and approves
    approved = OrchestrationEngine.approve_checkpoint(db=db_session, run_id=run_id, feedback="Approved by Lead Architect")
    assert approved is True

    # Continue execution through remaining agents (auto-approve remaining or approve Security)
    paused_run.auto_approve = True
    db_session.commit()
    await OrchestrationEngine.execute_run(run_id, db=db_session)

    db_session.expire_all()
    completed_run = db_session.query(AgentRun).filter(AgentRun.id == run_id).first()
    assert completed_run.status == "COMPLETED"

def test_run_export_csv_and_json(client, db_session):
    # Verify Phase 17: CSV and JSON export for paper benchmark data
    project = Project(name="Academic Export Project", description="Testing CSV/JSON exports")
    db_session.add(project)
    db_session.commit()

    run = OrchestrationEngine.create_run(db=db_session, project_id=project.id, provider="mock", auto_approve=True)

    # Test JSON export
    res_json = client.get(f"/api/runs/{run.id}/export?format=json")
    assert res_json.status_code == 200
    assert "executions" in res_json.json()
    assert len(res_json.json()["executions"]) == 17

    # Test CSV export
    res_csv = client.get(f"/api/runs/{run.id}/export?format=csv")
    assert res_csv.status_code == 200
    assert "run_id,project_name,requested_provider" in res_csv.text
    assert "ArchitectureAgent" in res_csv.text

    # Test Markdown Stage Suggestions & Instructions Report export
    res_md = client.get(f"/api/runs/{run.id}/export?format=markdown")
    assert res_md.status_code == 200
    assert "# PMPilot Autonomous Multi-Agent SDLC Report" in res_md.text
    assert "Stage Instructions & System Objective" in res_md.text
    assert "Stage Suggestions & Actionable Recommendations" in res_md.text
    assert "ProductManagerAgent" in res_md.text

    # Test HTML / Printable Executive Report export
    res_html = client.get(f"/api/runs/{run.id}/export?format=html")
    assert res_html.status_code == 200
    assert "<!DOCTYPE html>" in res_html.text
    assert "PMPilot Autonomous Multi-Agent SDLC Report" in res_html.text
    assert "Stage Suggestions & Actionable Instructions" in res_html.text
