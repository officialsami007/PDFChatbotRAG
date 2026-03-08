import os
from typing import Dict
from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from rag.vectorstore import get_vectorstore

# In-memory store: { session_id: ConversationalRetrievalChain }
_chains: Dict[str, ConversationalRetrievalChain] = {}

SYSTEM_PROMPT = """You are a helpful assistant that answers questions strictly based on the provided PDF document context.
Rules:
- Only answer using information from the provided context.
- If the answer is not in the context, say: "I couldn't find that information in the document."
- Be clear, concise, and helpful.
- Use conversation history to understand follow-up questions.
"""


def _build_chain(session_id: str) -> ConversationalRetrievalChain:
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=1024,
    )

    vectorstore = get_vectorstore(session_id)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer",
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=True,
        verbose=False,
    )

    return chain


def get_answer(session_id: str, question: str) -> tuple[str, int]:
    """
    Get an answer for a question using the session's vectorstore and conversation memory.
    Returns (answer, chunks_used).
    """
    if session_id not in _chains:
        _chains[session_id] = _build_chain(session_id)

    chain = _chains[session_id]
    result = chain.invoke({"question": question})

    answer = result["answer"]
    chunks_used = len(result.get("source_documents", []))

    return answer, chunks_used


def clear_memory(session_id: str) -> None:
    if session_id in _chains:
        del _chains[session_id]