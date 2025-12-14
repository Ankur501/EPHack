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
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.api_key = api_key
    
    async def extract_audio_from_video(self, video_path: str) -> str:
        audio_path = video_path.replace(".mp4", ".wav").replace(".mov", ".wav").replace(".avi", ".wav")
        
        command = [
            '/usr/bin/ffmpeg', '-i', video_path,
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
        import openai
        client = openai.OpenAI(api_key=self.api_key)
        
        with open(audio_path, "rb") as audio_file:
            response = await asyncio.to_thread(
                client.audio.transcriptions.create,
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
                timestamp_granularities=["word", "segment"]
            )
        
        words_list = []
        if hasattr(response, 'words') and response.words:
            words_list = [{"word": w.word, "start": w.start, "end": w.end} for w in response.words]
        
        segments_list = []
        if hasattr(response, 'segments') and response.segments:
            segments_list = [{"text": s.text, "start": s.start, "end": s.end} for s in response.segments]
        
        duration = response.duration if hasattr(response, 'duration') else 180
        
        return {
            "text": response.text,
            "words": words_list,
            "segments": segments_list,
            "duration": duration
        }