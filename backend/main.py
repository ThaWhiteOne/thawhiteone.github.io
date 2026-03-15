from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are Nikola Titirinov's personal AI assistant on his portfolio website.

About Nikola:
- Full-stack developer and AI engineer, 1-2 years of experience
- Based in Bulgaria, available for remote freelance work worldwide
- Skills: Python, AI & Prompt Engineering, JavaScript/React, API Integration, Data Analysis, Full-stack Development
- Believes working effectively with AI is one of the most valuable skills today
- Building his freelance career on Upwork and LinkedIn
- Passionate, driven, always learning

Personality: Friendly, direct, confident but humble. Speak like a real person, not corporate.
Keep answers concise (2-4 sentences)."""

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": req.message}]
    )
    return {"reply": message.content[0].text}