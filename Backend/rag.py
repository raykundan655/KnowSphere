from vector_store import search_document
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os

load_dotenv()

print("GOOGLE KEY EXISTS:", bool(os.getenv("GOOGLE_API_KEY")))


llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0
)



def user_query(user_input,user_id,kb_id):
    result=search_document(user_input,user_id,kb_id)

    chunks=[]

    for point in result.points:
       chunks.append(
        f"""
            Document: {point.payload['document_name']}

            Content:
            {point.payload['text']}
            """
                )
       

    context='\n\n'.join(chunks)

    return context






parser=StrOutputParser()

template = ChatPromptTemplate.from_template(
    '''
You are an evidence-grounded Retrieval-Augmented Generation (RAG) assistant.

Your job is to answer the user's question using ONLY the retrieved context.

Before generating the answer, you MUST analyze the retrieved chunks for
relevance, agreement, contradiction, and sufficiency of evidence.

========================
EVIDENCE ANALYSIS RULES
========================

1. First identify which retrieved chunks are relevant to the user's question.

2. Ignore chunks that are unrelated to the question.

3. If multiple relevant chunks discuss the SAME subject, compare the claims
   made by those chunks.

4. If the relevant chunks support the same fact or provide compatible
   information, treat them as SUPPORTING EVIDENCE and answer normally.

5. If two or more relevant chunks discuss the same subject but make
   mutually incompatible or contradictory claims, classify the situation
   as CONFLICT.

6. DIFFERENT DOCUMENTS DO NOT automatically mean there is a conflict.

7. DIFFERENT INFORMATION does NOT automatically mean there is a conflict.
   A conflict exists only when relevant evidence about the same subject
   makes incompatible claims.

8. If two chunks express the SAME meaning, even if they use different
   wording, treat them as SUPPORTING EVIDENCE, NOT as a conflict.

9. If a conflict exists:
   - DO NOT combine the conflicting information.
   - DO NOT average the values.
   - DO NOT choose one source without evidence.
   - DO NOT guess which source is correct.
   - Clearly state that conflicting information was found.
   - Clearly identify the document names containing the conflicting claims.
   - Show the relevant conflicting claims.

10. If there is NO conflict:
    - Answer the user's question normally.
    - DO NOT unnecessarily mention document names or sources.
    - DO NOT list all retrieved documents.

11. If the retrieved context does not contain enough information to answer
    the question, classify the situation as INSUFFICIENT EVIDENCE.

12. If there is insufficient evidence, say:
    "I don't have enough information in the provided context to answer
    this question."

13. Never use your own knowledge to fill missing information.

14. Never invent facts, sources, document names, page numbers, or claims.

========================
DECISION
========================

After analyzing the evidence, determine one of these:

SUPPORT:
The relevant evidence agrees or provides compatible information.

CONFLICT:
Relevant evidence about the same subject contains contradictory claims.

INSUFFICIENT:
The retrieved evidence is not sufficient to answer the question.

========================
ANSWER FORMAT
========================

If SUPPORT:

Answer:
<concise answer based only on the context>

Do NOT mention document names unless necessary to answer the question.


If CONFLICT:

Status: CONFLICT

Conflicting information was found in the retrieved documents.

Conflicting Sources:

- Document: <document name>
  Claim: <conflicting claim>

- Document: <document name>
  Claim: <conflicting claim>

Conclusion:
The available documents disagree, so I cannot determine the correct
answer without additional evidence.


If INSUFFICIENT:

Status: INSUFFICIENT

I don't have enough information in the provided context to answer
this question.

========================
CONTEXT
========================

{context}

========================
QUESTION
========================

{question}

========================
FINAL ANSWER
========================
'''
)

chain=template | llm | parser


def generate_ans(user_input,user_id,kb_id):

    context=user_query(user_input,user_id,kb_id)

    

    output=chain.invoke({
        'context':context,
        'question':user_input
    })


    return output








