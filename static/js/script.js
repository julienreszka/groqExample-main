document.addEventListener('DOMContentLoaded', async () => {
  const recordingIndicator = document.getElementById('recordingIndicator');
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const interruptButton = document.querySelector('#interrupt');
  const loader = document.querySelector('#loader');
  const newMessageField = document.querySelector('#newMessageField');
  const resetConversationButton = document.querySelector('#resetConversationButton');
  interruptButton.style.display = 'none';
  loader.style.display = 'none';
  let mediaRecorder;
  let recordedChunks = [];
  let currentAudio;
  let conversationHistoryMessages = [
    {
      role: 'system',
      content: "Make your answers shorter than 1900 characters. You are a female voice assistant."
    }
  ];

  const appendMessage = (role, message) => {
    resetConversationButton.style.display = 'block';
    const messages = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.innerText = role + ': ' + message;
    messages.appendChild(messageElement);
    conversationHistoryMessages.push({
      role: role,
      content: message || 'hmmm'
    });
  }

  const resetConversation = () => {
    const messages = document.getElementById('messages');
    while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
    }
    conversationHistoryMessages = [];
    resetConversationButton.style.display = 'none';
  }

  resetConversationButton.addEventListener('click', () => {
    resetConversation();
  })

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      console.log('Recording stopped, sending data to server')
      // hide the start button while processing the audio
      startButton.style.display = 'none';
      loader.style.display = 'block';
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);

      try {

        const stt = await fetch('/stt', {
          method: 'POST',
          body: formData,
        });

        let responseBody
        if (stt.ok) {
          responseBody = await stt.text();
          console.log(
            'STT response: ',
            responseBody);
          appendMessage('user', responseBody || 'hmmm');
        }

        const answer = await fetch('/text-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: conversationHistoryMessages
          })
        });

        let responseAnswerBody
        if (answer.ok) {
          responseAnswerBody = await answer.text();
          console.log(
            'Answer response: ',
            responseAnswerBody);
          appendMessage('assistant', responseAnswerBody);
        }

        const responseFormData = new FormData();
        responseFormData.append('text', responseAnswerBody);
        const response = await fetch('/process-text', {
          method: 'POST',
          body: responseFormData
        });

        if (response.ok) {
          console.log('Audio Answer');
          // Optionally, handle the server response, such as playing back a modified audio file
          const returnedBlob = await response.blob();
          const returnedURL = URL.createObjectURL(returnedBlob);
          currentAudio = new Audio(returnedURL);
          startButton.style.display = 'none';
          interruptButton.style.display = 'block';
          currentAudio.play();
          currentAudio.onended = () => {
            interruptButton.style.display = 'none';
            startButton.style.display = 'block';
            loader.style.display = 'none';
          };
        } else {
          console.error('Server error:', response.statusText);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    };
  } catch (error) {
    console.error('Failed to get media:', error);
  }

  startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
    if (mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
      recordingIndicator.style.display = 'block';
      recordedChunks = []; // Clear the previous recording data
    }
  });

  stopButton.addEventListener('click', () => {
    stopButton.style.display = 'none';
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      recordingIndicator.style.display = 'none';
    }
  });

  interruptButton.addEventListener('click', () => {
    if (currentAudio) {
      currentAudio.pause();
      loader.style.display = 'none';
      interruptButton.style.display = 'none';
      startButton.style.display = 'block';
    }
  });

  newMessageField.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      const text = newMessageField.value;
      appendMessage('user', text);
      newMessageField.value = '';
      try {
        const answer = await fetch('/text-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: conversationHistoryMessages
          })
        });

        let responseAnswerBody = ''
        if (answer.ok) {
          responseAnswerBody = await answer.text();
          console.log(
            'Answer response: ',
            responseAnswerBody);
          appendMessage('assistant', responseAnswerBody);
        }

        const responseFormData = new FormData();
        responseFormData.append('text', responseAnswerBody);
        const response = await fetch('/process-text', {
          method: 'POST',
          body: responseFormData
        });

        if (response.ok) {
          console.log('Audio Answer');
          // Optionally, handle the server response, such as playing back a modified audio file
          const returnedBlob = await response.blob();
          const returnedURL = URL.createObjectURL(returnedBlob);
          currentAudio = new Audio(returnedURL);
          startButton.style.display = 'none';
          interruptButton.style.display = 'block';
          currentAudio.play();
          currentAudio.onended = () => {
            interruptButton.style.display = 'none';
            startButton.style.display = 'block';
            loader.style.display = 'none';
          };
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  })
});
