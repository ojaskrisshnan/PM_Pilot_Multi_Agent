from typing import Optional
from backend.app.agents.definitions import ALL_17_AGENTS, AGENT_EXECUTION_ORDER, AgentDefinition

class AgentRegistry:
    def __init__(self):
        self._agents: dict[str, AgentDefinition] = ALL_17_AGENTS

    def get_agent(self, agent_id: str) -> Optional[AgentDefinition]:
        return self._agents.get(agent_id)

    def list_agents(self) -> list[AgentDefinition]:
        return [self._agents[aid] for aid in AGENT_EXECUTION_ORDER if aid in self._agents]

    def get_dependencies(self, agent_id: str) -> list[str]:
        agent = self.get_agent(agent_id)
        return agent.dependencies if agent else []

    def validate_dependency_graph(self) -> bool:
        """Verifies graph is acyclic and all dependencies exist."""
        visited = set()
        rec_stack = set()

        def dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            agent = self.get_agent(node)
            if agent:
                for dep in agent.dependencies:
                    if dep not in self._agents:
                        raise ValueError(f"Dependency {dep} for agent {node} not found in registry")
                    if dep not in visited:
                        if dfs(dep):
                            return True
                    elif dep in rec_stack:
                        return True
            rec_stack.remove(node)
            return False

        for aid in self._agents:
            if aid not in visited:
                if dfs(aid):
                    raise ValueError(f"Cycle detected in agent dependency graph at {aid}")
        return True

    def get_topological_order(self) -> list[str]:
        self.validate_dependency_graph()
        return AGENT_EXECUTION_ORDER

agent_registry = AgentRegistry()
