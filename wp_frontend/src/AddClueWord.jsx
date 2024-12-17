import React, { useState } from 'react';
import axios from 'axios';

const AddClueWord = () => {
    const [clue, setClue] = useState('');
    const [word, setWord] = useState('');
    const [message, setMessage] = useState('');

    const handleAddClueWord = (e) => {
        e.preventDefault();
        if (!clue || !word) {
            setMessage("Both clue and word are required.");
            return;
        }

        axios.post('http://162.0.225.90:3078/api/add-clue-word', { clue, word })
            .then(response => {
                setMessage(response.data.message);
                setClue('');
                setWord('');
            })
            .catch(error => {
                setMessage("Failed to add clue and word.");
                console.error(error);
            });
    };

    return (
        <div className="add-clue-word-container">
            <h2>Add Clue and Word</h2>
            <form onSubmit={handleAddClueWord}>
                <div className="form-group">
                    <label htmlFor="clue">Clue:</label>
                    <input
                        type="text"
                        id="clue"
                        value={clue}
                        onChange={(e) => setClue(e.target.value)}
                        placeholder="Enter the clue"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="word">Word:</label>
                    <input
                        type="text"
                        id="word"
                        value={word}
                        onChange={(e) => setWord(e.target.value.toUpperCase())}
                        placeholder="Enter the word"
                        required
                    />
                </div>
                <button type="submit">Add Clue and Word</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AddClueWord;

