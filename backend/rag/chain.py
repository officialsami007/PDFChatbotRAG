from openai import OpenAI
from typing import List
import os

# Groq uses the same OpenAI SDK — just different base_url and model
_client = None

SYSTEM_PROMPT = """You are a helpful assistant that answers questions strictly based on the provided PDF document context.

Rules:
- Only answer using information from the provided context
- If the answer is not in the context, say: "I couldn't find that information in the document."
- Be clear, concise, and helpful
- If the user asks a follow-up, use the conversation history to understand what they mean
"""

# In-memory conversation store: { session_id: [messages] }
conversation_store: dict = {}


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )
    return _client


def get_answer(session_id: str, question: str, context_chunks: List[str]) -> str:
    """
    Generate an answer using retrieved document context and conversation history.
    """
    client = get_client()

    # Init conversation history for new sessions
    if session_id not in conversation_store:
        conversation_store[session_id] = []

    history = conversation_store[session_id]

    # Join retrieved chunks as context
    context = "\n\n---\n\n".join(context_chunks)

    # The user message includes the retrieved context for grounding
    user_message = f"""Here is the relevant context from the document:

{context}

---

Question: {question}"""

    # Build messages: system + last 6 history messages + new user message
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history[-6:])  # last 3 Q&A turns
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # free on Groq
        messages=messages,
        temperature=0.2,   # low = more factual, less hallucination
        max_tokens=1024
    )

    answer = response.choices[0].message.content

    # Store the clean question and answer in memory (not the context-padded version)
    history.append({"role": "user", "content": question})
    history.append({"role": "assistant", "content": answer})

    return answer


def clear_memory(session_id: str) -> None:
    if session_id in conversation_store:
        del conversation_store[session_id]
