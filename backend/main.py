from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import anthropic
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
    max_age=3600,
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
YOUR_EMAIL = os.getenv("YOUR_EMAIL")

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

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

@app.options("/chat")
async def options_chat():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.options("/contact")
async def options_contact():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.post("/chat")
async def chat(req: ChatRequest):
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": req.message}]
    )
    return JSONResponse(
        content={"reply": message.content[0].text},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.post("/contact")
async def contact(req: ContactRequest):
    # 1. Save to Supabase
    async with httpx.AsyncClient() as client_http:
        db_response = await client_http.post(
            f"{SUPABASE_URL}/rest/v1/contacts",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            json={
                "name": req.name,
                "email": req.email,
                "message": req.message
            }
        )

    # 2. Send email via Resend
    async with httpx.AsyncClient() as client_http:
        await client_http.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "Portfolio Contact <onboarding@resend.dev>",
                "to": [YOUR_EMAIL],
                "subject": f"New message from {req.name}",
                "html": f"""
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#030508;color:#e8edf5;border-radius:12px;">
                    <h2 style="color:#00f5c4;margin-bottom:8px;">New Portfolio Message</h2>
                    <p style="color:#5a6478;margin-bottom:24px;">Someone contacted you through your portfolio.</p>
                    <div style="background:#070b12;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin-bottom:16px;">
                        <p><strong style="color:#00f5c4;">Name:</strong> {req.name}</p>
                        <p><strong style="color:#00f5c4;">Email:</strong> {req.email}</p>
                        <p><strong style="color:#00f5c4;">Message:</strong></p>
                        <p style="color:#e8edf5;line-height:1.6;">{req.message}</p>
                    </div>
                    <a href="mailto:{req.email}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7b61ff,#00f5c4);color:#000;font-weight:700;border-radius:6px;text-decoration:none;">Reply to {req.name}</a>
                </div>
                """
            }
        )

    return JSONResponse(
        content={"status": "success", "message": "Message received!"},
        headers={"Access-Control-Allow-Origin": "*"}
    )