import os

from deepgram import (
    DeepgramClient,
    SpeakOptions,
)

filename = "output.wav"


def text2speech(text):
    try:
        SPEAK_OPTIONS = {"text": text}
        deepgram = DeepgramClient(api_key=os.getenv("DG_API_KEY"))

        # https://developers.deepgram.com/reference/text-to-speech-api

        # best female voices
        # aura-luna-en
        # aura-athena-en
        options = SpeakOptions(
            # model="aura-luna-en",
            model="aura-zeus-en",
            encoding="linear16",
            container="wav"
        )

        response = deepgram.speak.v("1").save(filename, SPEAK_OPTIONS, options)
        return filename

    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":
    text2speech("This is a test")
