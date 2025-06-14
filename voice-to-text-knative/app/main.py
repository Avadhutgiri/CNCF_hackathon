import os
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
import io

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../vosk-model-small-en-us-0.15')
SAMPLE_RATE = 16000

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Vosk model not found at {MODEL_PATH}")

model = Model(MODEL_PATH)

app = FastAPI()

@app.post("/", response_class=JSONResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".wav", ".mp3")):
        raise HTTPException(status_code=400, detail="Only .wav or .mp3 files are supported.")
    try:
        audio_bytes = await file.read()
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(SAMPLE_RATE)
        recognizer = KaldiRecognizer(model, SAMPLE_RATE)
        chunk_size = 4000
        raw_data = audio.raw_data
        for i in range(0, len(raw_data), chunk_size):
            recognizer.AcceptWaveform(raw_data[i:i+chunk_size])
        result = json.loads(recognizer.FinalResult())
        return {"text": result.get("text", "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}") 