import os
import tempfile
import asyncio
from emergentintegrations.llm.openai import OpenAISpeechToText
from dotenv import load_dotenv
from pydub import AudioSegment
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class TranscriptionService:
    def __init__(self):
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
        self.stt = OpenAISpeechToText(api_key=api_key)
    
    async def extract_audio_from_video(self, video_path: str) -> str:
        audio_path = video_path.replace(".mp4", ".wav").replace(".mov", ".wav").replace(".avi", ".wav")
        
        command = [
            'ffmpeg', '-i', video_path,
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            audio_path
        ]
        
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        await process.communicate()
        return audio_path
    
    async def transcribe_audio(self, audio_path: str) -> dict:
        with open(audio_path, "rb") as audio_file:
            response = await self.stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
                timestamp_granularities=["word", "segment"]
            )
        
        return {
            "text": response.text,
            "words": response.words if hasattr(response, 'words') else [],
            "segments": response.segments if hasattr(response, 'segments') else [],
            "duration": response.duration if hasattr(response, 'duration') else 0
        }