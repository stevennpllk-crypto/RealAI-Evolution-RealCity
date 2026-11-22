import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
app=FastAPI(title="JASSIM Builder Gateway",version="0.2.0")
origins=[x.strip() for x in os.getenv("CORS_ORIGINS","http://localhost:8000").split(",") if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_methods=["GET","POST"],allow_headers=["Content-Type","Authorization"])
class Request(BaseModel):
 message:str=Field(min_length=1,max_length=8000)
 source:str="jassim-game-app-builder"
@app.get("/health")
async def health(): return {"status":"ok","upstream_configured":bool(os.getenv("JASSIM_UPSTREAM_URL"))}
@app.post("/api/ai/generate")
async def generate(body:Request):
 url=os.getenv("JASSIM_UPSTREAM_URL","").strip()
 if not url: raise HTTPException(503,"JASSIM upstream is not configured")
 headers={"Content-Type":"application/json"}
 token=os.getenv("JASSIM_API_TOKEN","").strip()
 if token: headers["Authorization"]="Bearer "+token
 try:
  async with httpx.AsyncClient(timeout=40) as client: r=await client.post(url,json=body.model_dump(),headers=headers)
 except httpx.TimeoutException: raise HTTPException(504,"JASSIM upstream timed out")
 except httpx.HTTPError: raise HTTPException(502,"Could not reach JASSIM upstream")
 if r.status_code>=400: raise HTTPException(502,"JASSIM upstream rejected request")
 try: data=r.json()
 except ValueError: raise HTTPException(502,"JASSIM upstream returned non-JSON")
 return {"ok":True,"upstream":data}
