from groq import Groq
from typing import List, TypedDict


class Message(TypedDict):
    role: str
    content: str


client = Groq()


def execute(prompt: List[Message]):
    completion = client.chat.completions.create(
        # model="mixtral-8x7b-32768",
        model="llama3-8b-8192",
        messages=prompt,
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )

    response = ''
    for chunk in completion:
        response += chunk.choices[0].delta.content or ""

    return response


if __name__ == "__main__":
    print(execute([{"role": "user", "content": "Tell a joke"}]))
