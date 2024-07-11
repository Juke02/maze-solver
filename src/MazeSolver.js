import React, { useState, useEffect } from 'react';
import './MazeSolver.css';

const MazeSolver = ({ maze, start, end }) => {
  const [grid, setGrid] = useState(maze.map(row => row.slice()));
  const [currentPosition, setCurrentPosition] = useState(start);
  const [animationSpeed, setAnimationSpeed] = useState(200); // Adjust animation speed here (milliseconds)
  const [directionArrayNumber, setDirectionArrayNumber] = useState(0); // Counter for direction array number
  const [generations, setGenerations] = useState(1); // Counter for generations, starting at 1
  const [directionArrays, setDirectionArrays] = useState([]); // Store all direction arrays
  const [topDirectionArrays, setTopDirectionArrays] = useState([]); // Store top 10 direction arrays
  const [step, setStep] = useState(0); // Track the button press step
  const [isAnimating, setIsAnimating] = useState(false); // Track if animation is running
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // Track if the end has been reached

  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const directionMap = {
    d: [1, 0],  // Down
    u: [-1, 0], // Up
    r: [0, 1],  // Right
    l: [0, -1]  // Left
  };

  useEffect(() => {
    findPath();
  }, [grid]); // Recalculate the path if the grid changes

  const findPath = async () => {
    // Step 1: Calculate minimum steps using BFS
    const minSteps = await calculateMinSteps(startRow, startCol, grid);

    // Step 2: Generate 100 random direction arrays
    const newDirectionArrays = generateRandomDirectionArrays(minSteps);
    setDirectionArrays(newDirectionArrays.map(array => ({ array, stepsAway: null })));

    setStep(0); // Reset to initial step
  };

  const calculateMinSteps = async (startRow, startCol, grid) => {
    const queue = [[startRow, startCol, 0]];
    const visited = new Set();
    visited.add(`${startRow},${startCol}`);
    const directions = Object.values(directionMap); // Get all direction values

    while (queue.length > 0) {
      const [currentRow, currentCol, steps] = queue.shift();

      if (currentRow === endRow && currentCol === endCol) {
        return steps;
      }

      for (let [dx, dy] of directions) {
        const newRow = currentRow + dx;
        const newCol = currentCol + dy;

        if (
          newRow >= 0 &&
          newCol >= 0 &&
          newRow < grid.length &&
          newCol < grid[0].length &&
          grid[newRow][newCol] === 0 &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          visited.add(`${newRow},${newCol}`);
          queue.push([newRow, newCol, steps + 1]);
        }
      }
    }

    return -1; // Return -1 if no solution is found
  };

  const generateRandomDirectionArrays = (length) => {
    const directions = ['d', 'u', 'r', 'l']; // Down, Up, Right, Left
    const directionArrays = [];

    for (let i = 0; i < 100; i++) {
      const array = [];
      for (let j = 0; j < length; j++) {
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        array.push(randomDirection);
      }
      directionArrays.push(array);
    }

    return directionArrays;
  };

  const solveMazeFromEndOfPath = async (directions, grid) => {
    let [currentRow, currentCol] = start;

    for (let direction of directions) {
      const [dx, dy] = directionMap[direction];
      const newRow = currentRow + dx;
      const newCol = currentCol + dy;

      if (
        newRow >= 0 &&
        newCol >= 0 &&
        newRow < grid.length &&
        newCol < grid[0].length &&
        grid[newRow][newCol] === 0
      ) {
        currentRow = newRow;
        currentCol = newCol;
      } else {
        break;
      }
    }

    if (currentRow === endRow && currentCol === endCol) {
      return 0; // Already at the end
    }

    const remainingSteps = await calculateMinSteps(currentRow, currentCol, grid);
    return remainingSteps; // Return steps away from the end
  };

  const getTopDirectionArrays = async (directionArrays, topCount, grid) => {
    const results = await Promise.all(
      directionArrays.map(async item => ({
        array: item.array,
        stepsAway: await solveMazeFromEndOfPath(item.array, grid)
      }))
    );

    const validResults = results.filter(result => result.stepsAway !== -1).sort((a, b) => a.stepsAway - b.stepsAway).slice(0, topCount);
    return validResults.map(result => ({ array: result.array, stepsAway: result.stepsAway }));
  };

  const mutateDirections = (directions) => {
    const directionsCopy = [...directions];
    for (let i = 0; i < directionsCopy.length; i++) {
      if (Math.random() < 0.1) { // 10% chance to mutate each direction
        const newDirection = Object.keys(directionMap)[Math.floor(Math.random() * Object.keys(directionMap).length)];
        directionsCopy[i] = newDirection;
      }
    }
    return directionsCopy;
  };

  const handleButtonClick = async () => {
    if (isAnimating) return; // Prevent button press during animation

    if (step === 0) {
      // Display all 100 direction arrays and their steps away from the end
      const allArraysWithStepsAway = await Promise.all(
        directionArrays.map(async item => ({
          array: item.array,
          stepsAway: await solveMazeFromEndOfPath(item.array, grid)
        }))
      );

      setDirectionArrays(allArraysWithStepsAway);
    } else if (step === 1) {
      // Display top 10 direction arrays
      const topArrays = await getTopDirectionArrays(directionArrays, 10, grid);
      setTopDirectionArrays(topArrays);
    } else if (step === 2) {
      // Animate the best direction array
      const bestArray = topDirectionArrays[0].array;
      setIsAnimating(true); // Set animation flag to true
      await animateDirections(bestArray, 1);
      setIsAnimating(false); // Reset animation flag to false
    } else if (step === 3) {
      // Mutate and generate new 100 direction arrays
      let newDirectionArrays = [];
      for (let item of topDirectionArrays) {
        newDirectionArrays.push([...item.array]); // Copy the top arrays
        for (let i = 0; i < 9; i++) { // 9 more mutations for each of the top 10
          let mutatedDirections = mutateDirections([...item.array]);
          newDirectionArrays.push(mutatedDirections);
        }
      }
      setDirectionArrays(newDirectionArrays.map(array => ({ array, stepsAway: null })));
      setGenerations(prevGenerations => prevGenerations + 1); // Increment generations counter
      setStep(0); // Reset to initial step
      return;
    }

    setStep(prevStep => prevStep + 1);
  };

  const animateDirections = async (directions, arrayNumber) => {
    let [currentRow, currentCol] = start;

    for (let direction of directions) {
      setDirectionArrayNumber(arrayNumber);
      const [dx, dy] = directionMap[direction];
      const newRow = currentRow + dx;
      const newCol = currentCol + dy;

      if (
        newRow >= 0 &&
        newCol >= 0 &&
        newRow < grid.length &&
        newCol < grid[0].length &&
        grid[newRow][newCol] === 0
      ) {
        currentRow = newRow;
        currentCol = newCol;

        setCurrentPosition([currentRow, currentCol]);

        await delay(animationSpeed); // Delay for visualization
      } else {
        break;
      }

      if (currentRow === endRow && currentCol === endCol) {
        setHasReachedEnd(true);
        break;
      }
    }
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (isAnimating) return; // Prevent editing during animation

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.slice());
      newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === 1 ? 0 : 1; // Toggle wall
      return newGrid;
    });
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="maze-container">
      <div className="maze-info">
        <div>
          <strong>Generations:</strong> {generations}
        </div>
      </div>
      <button onClick={handleButtonClick} disabled={isAnimating}>Next Step</button>
      {step === 0 && (
        <div className="arrays-container">
          <h2>All Direction Arrays</h2>
          {directionArrays.map((item, index) => (
            <div key={index}>
              <strong>Array {index + 1}:</strong> {item.array.join(', ')}
            </div>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="arrays-container">
          <h2>Top 10 Direction Arrays:</h2>
          {topDirectionArrays.sort((a, b) => a.stepsAway - b.stepsAway).map((item, index) => (
            <div key={index}>
              <strong>Array {index + 1}:</strong> {item.array.join(', ')} <strong>Steps Away:</strong> {item.stepsAway}
            </div>
          ))}
        </div>
      )}
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`cell ${
                cell === 1 ? 'wall' :
                (rowIndex === startRow && colIndex === startCol) ? 'start' :
                (rowIndex === endRow && colIndex === endCol && !hasReachedEnd) ? 'end' :
                (rowIndex === endRow && colIndex === endCol && hasReachedEnd) ? 'reached-end' :
                (rowIndex === currentPosition[0] && colIndex === currentPosition[1]) ? 'current' :
                ''
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MazeSolver;
