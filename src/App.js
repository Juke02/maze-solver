import React, { useState } from 'react';
import MazeSolver from './MazeSolver';
import './App.css';

const App = () => {
  const [showMazeSolver, setShowMazeSolver] = useState(false);

  const handleStart = () => {
    setShowMazeSolver(true);
  };

  return (
    <div className="app-container">
      {showMazeSolver ? (
        <MazeSolver 
          maze={[
            [0, 0, 0, 1, 0],
            [1, 0, 1, 0, 0],
            [0, 0, 1, 0, 1],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0]
          ]}
          start={[0, 0]}
          end={[4, 4]}
        />
      ) : (
        <div className="landing-page">
          <h1>Welcome</h1>
          <p>If you want to ignore the explanation and just use the solver then click the button</p>
          <button onClick={handleStart}>Start Maze Solver</button>
          <p>My name is Dane Nail and this is my maze solver.</p>
          <p>Instead of directly using a maze-solving algorithm</p>
          <p>
            I decided to create an <a href="https://en.wikipedia.org/wiki/Evolutionary_algorithm" target="_blank" rel="noopener noreferrer"> Evolutionary AI</a> that would learn how to solve any maze it receives.
          </p>
          <p>I was inspired by <a href="https://www.youtube.com/watch?v=GOFws_hhZs8" target="_blank" rel="noopener noreferrer"> this video</a> by carykh. Please check him out he's awesome.</p> 
          <h2>How it works:</h2>
          <p>The program first starts by (bear with me here) using a <a href="https://en.wikipedia.org/wiki/Breadth-first_search" target="_blank" rel="noopener noreferrer">Breadth-First Search (BFS) algorithm</a> to find if there is a solution to the maze.</p>
          <p>Then, 100 random "directional arrays" are created, which are essentially a set of instructions for the solver.</p>
          <p>"r" = right, "l" = left, "u" = up, and "d" = down.</p>
          <p>The maze solver simulates all of these directional arrays in the maze.</p>
          <p>To determine the best one (i.e., the one that places the blue tile in a spot that minimizes the number of steps to the end), the BFS algorithm is run from where the directional arrays ended.</p>
          <p>The lower the number of steps it takes for the BFS algorithm to reach the end from its starting point, the better the directional array (better <a href="https://en.wikipedia.org/wiki/Fitness_function" target="_blank" rel="noopener noreferrer">fitness</a>).</p>
          <p>The top 10 best directional arrays are singled out, mutated, (each move has a default 10% to change, e.g., "l" becomes "r") and duplicated 10 times (to create a new set of 100 arrays).</p>
          <p>This allows certain directional arrays to potentially get closer to the end than others through random chance.</p>
          <p>Finally, the top 10 best directional arrays are chosen, and the cycle repeats until a directional array is able to reach the end.</p>


        </div>
      )}
    </div>
  );
};

export default App;
