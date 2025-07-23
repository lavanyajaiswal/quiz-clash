import React, { useState, useEffect } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';

const socket = io("ws://localhost:5000");

function App() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [info, setInfo] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [scores, setScores] = useState([]);
  const [winner, setWinner] = useState();
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && room) {
      setInfo(true);
      socket.emit('joinRoom', room, name);
    }
  };

  useEffect(() => {
    if (seconds === 0) return;
    const timerInterval = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [seconds]);

  useEffect(() => {
    socket.on('message', (message) => {
      toast(`${message}`, {
        position: 'top-right', theme: 'dark', autoClose: 5000
      });
    });

    socket.on('newQuestion', (data) => {
      setQuestion(data.question);
      setOptions(data.answers);
      setAnswered(false);
      setSelectedAnswerIndex(null); // reset selection
      setSeconds(data.timer);
      setQuestionCount(data.questionCount);
      setTotalQuestions(data.totalQuestions);
    });

    socket.on('answerResult', (data) => {
      if (data.isCorrect && data.playerName === name) {
        toast(`Correct!`, {
          position: 'bottom-center', autoClose: 2000, theme: 'dark'
        });
      } else if (data.playerName === name) {
        toast(`Wrong!`, {
          position: 'bottom-center', autoClose: 2000, theme: 'dark'
        });
      }

      setScores(data.scores);
    });

    socket.on('gameOver', (data) => {
      setWinner(data.winner);
    });

    return () => {
      socket.off('message');
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
    };
  }, [name]);

  const handleAnswer = (answerIndex) => {
    if (!answered) {
      setSelectedAnswerIndex(answerIndex);
      setAnswered(true);
      socket.emit('submitAnswer', room, answerIndex);
    }
  };

  if (winner) return <h1>🎉 Winner is {winner} 🎉</h1>;

  return (
    <div className="App">
      {!info ? (
        <div className='join-div'>
          <h1>QuizClash💡</h1>
          <form onSubmit={handleSubmit}>
            <input required placeholder='Enter your name' value={name} onChange={(e) => setName(e.target.value)} />
            <input required placeholder='Enter room no' value={room} onChange={(e) => setRoom(e.target.value)} />
            <button type='submit' className='join-btn'>JOIN</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>QuizClash 💡</h1>
          <p className='room-id'>Room Id: {room}</p>
          <ToastContainer />
          {question ? (
            <div className='quiz-div'>
              <p>Remaining Time: {seconds}s</p>
              <div className='question'>
                <p className='question-text'>{question}</p>
              </div>
              <ul>
                {options.map((answer, index) => (
                  <li key={index}>
                    <button
                      className={`options ${selectedAnswerIndex === index ? 'selected' : ''}`}
                      onClick={() => handleAnswer(index)}
                      disabled={answered}
                    >
                      {answer}
                    </button>
                  </li>
                ))}
              </ul>
              <h3>Scores:</h3>
              {scores.map((player, index) => (
                <p key={index}>{player.name}: {player.score}</p>
              ))}
              <p>Question {questionCount} of {totalQuestions}</p>
            </div>
          ) : (
            <p>Waiting for question...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
