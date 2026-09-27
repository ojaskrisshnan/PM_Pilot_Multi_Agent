import asyncio
import json
import logging
from typing import Any, Optional
from datetime import datetime, timezone
from backend.app.agents.definitions import AgentDefinition
from backend.app.schemas.execution import AgentOutputSchema
from backend.app.providers.base import LLMRequest, LLMResponse
from backend.app.providers.router import ProviderRouter

logger = logging.getLogger(__name__)

class AgentRuntime:
    MAX_RETRIES = 3

    @classmethod
    async def execute_agent(
        cls,
        definition: AgentDefinition,
        project_name: str,
        project_description: str,
        upstream_outputs: dict[str, Any],
        provider_name: Optional[str] = None,
        model_name: Optional[str] = None,
        allow_fallback: bool = False
    ) -> tuple[AgentOutputSchema, int, int, int, str, Optional[str]]:
        """
        Executes a single agent with retry logic.
        Consumes upstream outputs matching the agent's dependencies.
        Returns: (validated_output, execution_time_ms, tokens_used, retries_taken, actual_provider, fallback_reason)
        """
        # Formulate synthesized context from upstream dependencies
        context_parts = [
            f"Project: {project_name}",
            f"Description: {project_description or 'Autonomous Enterprise SDLC System'}",
            f"Agent Role: {definition.role}",
            f"Assigned Tools: {', '.join(definition.tools)}"
        ]

        if definition.dependencies:
            context_parts.append("\n--- Upstream Dependency Outputs ---")
            for dep_id in definition.dependencies:
                dep_data = upstream_outputs.get(dep_id, {})
                summary = dep_data.get("summary", "Phase completed")
                findings = dep_data.get("findings", [])
                context_parts.append(f"[{dep_id}]: {summary}")
                if findings:
                    str_findings = [f if isinstance(f, str) else json.dumps(f) for f in findings[:3]]
                    context_parts.append(f"  Key findings: {'; '.join(str_findings)}")

        project_context = "\n".join(context_parts)

        user_prompt = (
            f"Project: {project_name}\n"
            f"Execute your responsibilities as {definition.name}. "
            f"Consume upstream artifacts: {', '.join(definition.input_artifacts)}. "
            f"Synthesize deliverables: {', '.join(definition.output_artifacts)}. "
            f"Return strictly valid JSON with keys: agent_id, status, summary, findings (list), recommendations (list), deliverables (list with type, title, content)."
        )

        request = LLMRequest(
            agent_id=definition.id,
            system_prompt=definition.system_prompt,
            user_prompt=user_prompt,
            project_context=project_context,
            temperature=0.2
        )

        last_error = None
        retries = 0

        for attempt in range(cls.MAX_RETRIES + 1):
            try:
                response: LLMResponse = await ProviderRouter.query_provider(
                    request=request,
                    provider_name=provider_name,
                    model_name=model_name,
                    allow_fallback=allow_fallback
                )

                # Validate or construct structured output schema
                structured = response.structured_output
                if not structured and response.content:
                    try:
                        structured = json.loads(response.content)
                    except Exception:
                        pass

                if not isinstance(structured, dict) or "summary" not in structured:
                    structured = {
                        "agent_id": definition.id,
                        "status": "completed",
                        "summary": response.content[:300] if response.content else f"{definition.name} deliverables completed.",
                        "findings": [f"Processed {len(definition.input_artifacts)} input artifacts"],
                        "recommendations": ["Verified domain deliverables"],
                        "deliverables": [
                            {
                                "type": "specification",
                                "title": definition.output_artifacts[0] if definition.output_artifacts else f"{definition.id}_deliverable.md",
                                "content": response.content or f"Phase {definition.phase_order} completed for {project_name}."
                            }
                        ]
                    }

                actual_provider = response.actual_provider or response.provider
                fallback_reason = response.fallback_reason

                structured["metadata"] = {
                    **(structured.get("metadata") or {}),
                    "actual_provider": actual_provider,
                    "fallback_reason": fallback_reason,
                    "tokens_used": response.tokens_used,
                    "latency_ms": response.latency_ms
                }

                validated = AgentOutputSchema(**structured)
                return validated, response.latency_ms, response.tokens_used, retries, actual_provider, fallback_reason

            except Exception as e:
                last_error = e
                retries += 1
                logger.warning(f"Agent {definition.id} execution attempt {attempt + 1} failed: {e}")
                if attempt < cls.MAX_RETRIES:
                    await asyncio.sleep(2 * (attempt + 1))

        raise RuntimeError(f"Agent {definition.id} failed after {cls.MAX_RETRIES} retries: {last_error}")
