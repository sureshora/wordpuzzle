import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddClueWord from './AddClueWord';

const App = () => {
    const [grid, setGrid] = useState([]);               // Word grid
    const [clues, setClues] = useState([]);             // Clues
    const [selectedWord, setSelectedWord] = useState([]); // Selected cells
    const [user, setUser] = useState('user1');          // Active user
    const [userScores, setUserScores] = useState({});   // User scores
    const [activeUser, setActiveUser] = useState(null); // Highlighted user
    const [showCluesPopup, setShowCluesPopup] = useState(false); // Toggle clues popup
    const [showAddClue, setShowAddClue] = useState(false); // Toggle Add Clue form

    useEffect(() => {
        fetchPuzzle();
        fetchScores();
    }, []);

    // Fetch grid and clues
    const fetchPuzzle = () => {
        axios.get('http://162.0.225.90:3078/api/puzzle')
            .then(response => {
                setGrid(response.data.grid);
                setClues(response.data.clues);
            })
            .catch(error => console.error('Error fetching puzzle grid:', error));
    };

    // Fetch scores
    const fetchScores = () => {
        axios.get('http://162.0.225.90:3078/api/scores')
            .then(response => setUserScores(response.data))
            .catch(error => console.error('Error fetching scores:', error));
    };

    // Handle grid cell selection
    const handleCellClick = (rowIndex, cellIndex) => {
        const letter = grid[rowIndex][cellIndex];
        if (letter !== ".") { // Allow only non-empty cells
            setSelectedWord(prev => [...prev, { row: rowIndex, col: cellIndex }]);
        }
    };

    // Submit selected word
    const handleSubmitWord = () => {
        const word = selectedWord.map(({ row, col }) => grid[row][col]).join('');
        if (!word) {
            alert("Please select letters to form a word!");
            return;
        }

        axios.get('http://162.0.225.90:3078/api/puzzle')
            .then(response => {
                const validWords = response.data.clues.map(item => item.word.toUpperCase());
                if (validWords.includes(word)) {
                    const score = word.length * 10;
                    axios.post('http://162.0.225.90:3078/api/score', { user, score })
                        .then(() => {
                            alert(`Correct! You found "${word}".`);
                            fetchScores();
                        })
                        .catch(error => console.error('Error updating score:', error));
                } else {
                    alert(`"${word}" is not a valid word. Try again!`);
                }
            })
            .catch(error => console.error('Error validating word:', error));

        setSelectedWord([]); // Reset selected word
    };

    // Reset grid and selected word
    const resetSelection = () => {
        fetchPuzzle(); // Reload the grid
        setSelectedWord([]); // Clear selections
    };

    // Toggle Clues Popup
    const toggleCluesPopup = () => setShowCluesPopup(!showCluesPopup);

    // Toggle Add Clue form
    const toggleAddClue = () => setShowAddClue(!showAddClue);

    // Handle user selection
    const handleUserSelection = (selectedUser) => {
        setUser(selectedUser);
        setActiveUser(selectedUser);
    };

    return (
        <div className="app">
            <div className="centered-content">
                <h1 className="title">Word Puzzle Game</h1>

                {/* User Selection */}
                <div className="user-buttons">
                    {['user1', 'user2', 'user3', 'user4', 'user5'].map(u => (
                        <button
                            key={u}
                            onClick={() => handleUserSelection(u)}
                            style={{ backgroundColor: activeUser === u ? 'red' : '' }}
                        >
                            {u}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="controls">
                    <button onClick={handleSubmitWord}>Submit Word</button>
                    <button onClick={resetSelection}>Reset</button>
                    <button onClick={toggleCluesPopup}>View Clues</button>
                    <button onClick={toggleAddClue}>Add Clue</button>
                </div>

                {/* Scores */}
                <div className="scores-container">
                    <h2>Scores:</h2>
                    <div className="scores-grid">
                        {Object.entries(userScores).map(([user, score]) => (
                            <div key={user} className="score-item">
                                {user}: {score} points
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid-container">
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cell, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    className={`cell ${selectedWord.some(sel => sel.row === rowIndex && sel.col === cellIndex) ? 'selected' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                                >
                                    {cell}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Clues Popup */}
                {showCluesPopup && (
                    <div className="clues-popup">
                        <h2>Clues:</h2>
                        <ul>
                            {clues.map((item, index) => (
                                <li key={index}>{item.clue}</li>
                            ))}
                        </ul>
                        <button onClick={toggleCluesPopup}>Close</button>
                    </div>
                )}

                {/* Add Clue Component */}
                {showAddClue && (
                    <div className="add-clue-wrapper">
                        <AddClueWord />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;

