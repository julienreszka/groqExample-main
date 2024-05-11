import os
import whisper


def speech2text(audio_file):
    try:

        model = whisper.load_model("base")
        result = model.transcribe(audio_file)

        return (result['text'])

    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":
    # print(speech2text("pizza.wav"))
    # print(speech2text("Elon-Musk-Five-Step-Improvement-Process.mp3"))
    # print(speech2text("Brian-Chesky-how-Airbnb-was-started.mp3"))
    # print(speech2text("Jeff-Bezos-speaks-on-customers-and-the-things-that-don-t-change.mp3"))
    # print(speech2text("Dara-Khosrowshahi-on-being-decisive.mp3"))
    # print(speech2text("Larry-Page.mp3"))
    # print(speech2text("Mark-Zuckerberg.mp3"))
    print(speech2text("Patrick-Collison-The-Case-For-Big-Business.mp3"))
