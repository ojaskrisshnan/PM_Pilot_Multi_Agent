import pytest
from backend.app.orchestration.engine import OrchestrationEngine
from backend.app.metrics.calculator import MetricsCalculator
from backend.app.models.project import Project

@pytest.mark.asyncio
async def test_metrics_calculation(db_session):
    project = Project(name="Metrics Verification App", description="Metrics testing")
    db_session.add(project)
    db_session.commit()

    run = OrchestrationEngine.create_run(db=db_session, project_id=project.id, provider="mock", auto_approve=True)
    await OrchestrationEngine.execute_run(run.id, db=db_session)

    metrics = MetricsCalculator.get_run_metrics(db_session, run.id)
    assert metrics.total_agents == 17
    assert metrics.successful_agents == 17
    assert metrics.failed_agents == 0
    assert metrics.completion_rate == 100.0
    assert metrics.failure_rate == 0.0
    assert metrics.total_execution_time_ms >= 0
    assert metrics.output_completeness > 80.0
    assert len(metrics.agent_latencies) == 17
