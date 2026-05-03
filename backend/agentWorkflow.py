from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. Define the State
class AgentState(TypedDict):
    input_data: str
    data_type: str
    result: str

# 2. Define the "Agents" (Just simple functions for now)
def nlp_agent(state: AgentState):
    # In reality, this calls Groq. Here, it just updates state.
    return {"result": f"Processed text symptoms: {state['input_data']}"}

def image_agent(state: AgentState):
    return {"result": f"Processed medical image data."}

# 3. Define the Orchestrator (The Router)
def route_data(state: AgentState):
    if state["data_type"] == "text":
        return "nlp_agent"
    return "image_agent"

# 4. Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("nlp_agent", nlp_agent)
workflow.add_node("image_agent", image_agent)

# Add conditional routing
workflow.set_conditional_entry_point(
    route_data,
    {
        "nlp_agent": "nlp_agent",
        "image_agent": "image_agent"
    }
)

workflow.add_edge("nlp_agent", END)
workflow.add_edge("image_agent", END)

# Compile the graph
app = workflow.compile()

# Example of how it runs:
# output = app.invoke({"input_data": "Patient has a fever", "data_type": "text"})
# print(output)