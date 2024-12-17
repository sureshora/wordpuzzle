import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import AddClueWord from './AddClueWord';

const App = () => {
    const [grid, setGrid] = useState([]); // Grid data
    const [clues, setClues] = useState([]); // Clue data
    const [selectedWord, setSelectedWord] = useState([]); // Selected positions in the grid
    const [derivedWord, setDerivedWord] = useState(''); // Selected word
    const [user, setUser] = useState('user1'); // Active user
    const [userScores, setUserScores] = useState({}); // User scores
    const [activeUser, setActiveUser] = useState(null);
    const [showCluesPopup, setShowCluesPopup] = useState(false);
    const [showAddClue, setShowAddClue] = useState(false);
    const [pickedWords, setPickedWords] = useState(new Set()); // Prevent duplicate submissions

    useEffect(() => {
        fetchPuzzle();
        fetchScores();
    }, []);

    // Fetch the puzzle grid and clues
    const fetchPuzzle = () => {
        axios.get('http://162.0.225.90:3078/api/puzzle')
            .then(response => {
                setGrid(response.data.grid);
                setClues(response.data.clues);
            })
            .catch(error => console.error('Error fetching puzzle grid:', error));
    };

    // Fetch user scores
    const fetchScores = () => {
        axios.get('http://162.0.225.90:3078/api/scores')
            .then(response => setUserScores(response.data))
            .catch(error => console.error('Error fetching scores:', error));
    };

    // Update derived word when grid selection changes
    useEffect(() => {
        const word = selectedWord
            .map(({ row, col }) => grid[row]?.[col] || '')
            .join('')
            .toUpperCase();
        setDerivedWord(word);
    }, [selectedWord, grid]);

    // Handle grid cell click
    const handleCellClick = (rowIndex, cellIndex) => {
        setSelectedWord(prev => [...prev, { row: rowIndex, col: cellIndex }]);
    };

    // Submit the selected word
    const handleSubmitWord = async () => {
        if (!derivedWord || derivedWord.trim() === '') {
            alert("No letters selected. Please pick letters from the grid.");
            return;
        }

        if (pickedWords.has(derivedWord)) {
            alert(`"${derivedWord}" has already been submitted. Try another word.`);
            return;
        }

        try {
            const response = await axios.get('http://162.0.225.90:3078/api/puzzle');
            const validWords = response.data.clues.map(item => item.word.toUpperCase());

            console.log("Valid Words:", validWords, "Submitted Word:", derivedWord);

            if (validWords.includes(derivedWord)) {
                const score = derivedWord.length * 10;

                // Update user score
                await axios.post('http://162.0.225.90:3078/api/score', { user, score });
                alert(`Correct! You found "${derivedWord}".`);
                setPickedWords(new Set([...pickedWords, derivedWord]));
                fetchScores();
            } else {
                alert(`"${derivedWord}" is not a valid word. Try again.`);
            }
        } catch (error) {
            alert("Error validating the word. Please try again.");
            console.error("Validation error:", error);
        }

        // Clear selection
        setSelectedWord([]);
        setDerivedWord('');
    };

    const resetSelection = () => {
        fetchPuzzle();
        setSelectedWord([]);
        setDerivedWord('');
    };

    const toggleCluesPopup = () => setShowCluesPopup(!showCluesPopup);
    const toggleAddClue = () => setShowAddClue(!showAddClue);

    const handleUserSelection = (selectedUser) => {
        setUser(selectedUser);
        setActiveUser(selectedUser);
    };

    return (
        <div className="app-container">
            <div className="app">
                {/* Refresh Button */}
       	        <button className="refresh-button" onClick={() => window.location.reload()}>
            	  ⟳ Refresh
       		</button>
                <h1 className="title">Word Puzzle Game</h1>

                {/* User Selection */}
                <div className="user-buttons">
                    {['User:A', 'User:B', 'User:C', 'User:D', 'User:E'].map(u => (
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
                    <button onClick={toggleCluesPopup}>
                        {showCluesPopup ? "Hide Clues" : "View Clues"}
                    </button>
                    <button onClick={toggleAddClue}>
                        {showAddClue ? "Hide Add Clue" : "Add Clue"}
                    </button>
                </div>

                {/* Scores */}
                <div className="scores-container">
                    <h2>Score Board</h2>
                    <div className="scores-grid">
                        {Object.entries(userScores).map(([user, score]) => (
                            <div key={user} className="score-item">
                                {user}: {score} points
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Word */}
                <h3>Selected Word: {derivedWord}</h3>

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

