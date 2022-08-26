import { useEffect, useState } from 'react';
import './App.css';
import { resetGame } from './apis/resetGame';
import GameStatistics from './components/Game/GameStatistics/GameStatistics.js';
import config from './config';
import CurrentGameplay from './components/Game/CurrentGameplay/CurrentGameplay';
import { Goal, TeamID } from './constants/score.js';

function App() {
  const [blueScore, setBlueScore] = useState(0);
  const [whiteScore, setWhiteScore] = useState(0);
  const [isStatisticsDisplayed, setIsStatisticsDisplayed] = useState(false);
  const [finalScores, setFinalScores] = useState({ blue: 0, white: 0 });
  const goalsArray = new Array();
  useEffect(() => {
    const socket = new WebSocket(`${config.wsBaseUrl}/score`);

    socket.onopen = () => {
      // Send to server
      socket.send('Hello from client');
      socket.onmessage = (msg) => {
        msg = JSON.parse(msg.data);
        setBlueScore(msg.blueScore);
        setWhiteScore(msg.whiteScore);
      };
    };
  }, []);
  useEffect(() => {
    goalsArray.push(new Goal(TeamID.Team_blue, '10:30'));
  }, [blueScore]);
  useEffect(() => {
    goalsArray.push(new Goal(TeamID.Team_white, '12:30'));
  }, [whiteScore]);

  const handleStartGame = () => {
    handleResetGame();
  };

  const handleResetGame = () => {
    resetGame().then((data) => {
      if (data.error) alert(data.error);
    });
  };
  const handleEndGame = () => {
    console.log(goalsArray);
    setFinalScores({ blue: blueScore, white: whiteScore });
    setIsStatisticsDisplayed(!isStatisticsDisplayed);
  };
  return (
    <>
      <h1>Smart Kickers</h1>
      {isStatisticsDisplayed ? (
        <GameStatistics finalScores={finalScores} setIsStatisticsDisplayed={setIsStatisticsDisplayed} handleResetGame={handleResetGame} />
      ) : (
        <CurrentGameplay
          blueScore={blueScore}
          whiteScore={whiteScore}
          handleStartGame={handleStartGame}
          handleResetGame={handleResetGame}
          handleEndGame={handleEndGame}
        />
      )}
    </>
  );
}

export default App;
