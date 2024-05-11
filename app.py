import os
import time
from flask import Flask, request, send_file, render_template
import tempfile
from text2speech import text2speech
# from speech2text import speech2text
from speech2text import speech2text
from groq_service import execute
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stt", methods=["POST"])
def speech_to_text():
    audio_data = request.files["audio"].read()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        temp_audio.write(audio_data)
        temp_audio.flush()

    text = speech2text(temp_audio.name)
    if not os.path.exists('messages'):
        os.makedirs('messages')
    with open(f"messages/{os.path.basename('')}{str(time.time())}_question_.txt", "w") as f:
        f.write(text)
    return text


@app.route("/text-answer", methods=["POST"])
def text_answer():
    json_data = request.get_json()
    messages = request.json['messages']
    generated_answer = execute(
        messages
    )
    with open(f"messages/{os.path.basename('')}{str(time.time())}_answer_.txt", "w") as f:
        f.write(generated_answer)
    return generated_answer


@app.route("/process-text", methods=["POST"])
def process_answer():
    text = request.form.get("text")
    print(text)
    generated_answer = text[:2000]  # limit to 2000 characters
    generated_speech = text2speech(generated_answer)
    return send_file(generated_speech, mimetype='audio/mpeg')


if __name__ == '__main__':
    if not os.getenv("DG_API_KEY"):
        print("DG_API_KEY does not exist see .env.example for more information")
    if not os.getenv("GROQ_API_KEY"):

        print("GROQ_API_KEY does not exist see .env.example for more information")
    app.run(debug=True, port=8080)
