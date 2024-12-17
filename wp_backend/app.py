import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import os
import string

app = Flask(__name__)
CORS(app)

# File to store clues and words
CLUES_FILE = "clues.json"

# Load clues and words from a file or initialize defaults
def load_clues():
    if os.path.exists(CLUES_FILE):
        try:
            with open(CLUES_FILE, "r") as file:
                data = json.load(file)
                print("Loaded clues and words successfully.")
                return data.get("clues", []), data.get("words", [])
        except Exception as e:
            print("Error loading clues:", e)
            return [], []
    return [
        {"clue": "A popular programming language", "word": "PYTHON"},
        {"clue": "A frontend library by Facebook", "word": "REACT"},
        {"clue": "A lightweight Python framework", "word": "FLASK"},
        {"clue": "A type of game involving logic", "word": "PUZZLE"},
        {"clue": "A helpful hint for a puzzle", "word": "CLUE"},
    ], ["PYTHON", "REACT", "FLASK", "PUZZLE", "CLUE"]

def save_clues(clues, words):
    try:
        with open(CLUES_FILE, "w") as file:
            json.dump({"clues": clues, "words": words}, file, indent=4)
        print("Clues and words saved successfully.")
    except Exception as e:
        print("Error saving clues and words:", e)

# Global variables
default_clues, default_words = load_clues()
scores = {"User:A": 0, "User:B": 0, "User:C": 0, "User:D": 0, "User:E": 0}
submitted_words = set()  # Prevent duplicate submissions

# Function to generate a grid with words
def generate_grid(words, size=10):
    grid = [["."] * size for _ in range(size)]

    def can_place_word(word, row, col, direction):
        """Check if the word can be placed at the given position."""
        if direction == "horizontal" and col + len(word) > size:
            return False
        if direction == "vertical" and row + len(word) > size:
            return False

        for i in range(len(word)):
            r, c = (row, col + i) if direction == "horizontal" else (row + i, col)
            if grid[r][c] != "." and grid[r][c] != word[i]:
                return False
        return True

    def place_word(word):
        """Place the word in the grid."""
        placed = False
        attempts = 0
        while not placed and attempts < 100:
            row = random.randint(0, size - 1)
            col = random.randint(0, size - 1)
            direction = random.choice(["horizontal", "vertical"])
            if can_place_word(word, row, col, direction):
                for i in range(len(word)):
                    r, c = (row, col + i) if direction == "horizontal" else (row + i, col)
                    grid[r][c] = word[i]
                placed = True
            attempts += 1
        if not placed:
            print(f"Warning: Failed to place word: {word}")

    # Place words in the grid
    for word in words:
        place_word(word.upper())

    # Fill empty spaces with random letters
    for row in range(size):
        for col in range(size):
            if grid[row][col] == ".":
                grid[row][col] = random.choice(string.ascii_uppercase)

    print("Generated Grid:")
    for row in grid:
        print(" ".join(row))
    return grid

# API to fetch puzzle grid and clues
@app.route('/api/puzzle', methods=['GET'])
def get_puzzle():
    print("Fetching the puzzle grid and clues...")
    grid = generate_grid(default_words)
    return jsonify({"grid": grid, "clues": default_clues})

# API to get scores
@app.route('/api/scores', methods=['GET'])
def get_scores():
    print("Returning user scores.")
    return jsonify(scores)

# API to submit a word and update scores
@app.route('/api/score', methods=['POST'])
def update_score():
    try:
        data = request.get_json()
        print("Received Score Submission:", data)
        user = data.get("user")
        points = int(data.get("score", 0))

        if user in scores:
            scores[user] += points
            print(f"Updated score for {user}: {scores[user]}")
            return jsonify({"success": True, "scores": scores}), 200
        else:
            print(f"Invalid user: {user}")
            return jsonify({"error": "Invalid user"}), 400

    except Exception as e:
        print("Error processing score update:", e)
        return jsonify({"error": "Internal Server Error"}), 500

# API to add new clues and words
@app.route('/api/add-clue-word', methods=['POST'])
def add_clue_word():
    try:
        data = request.get_json()
        clue = data.get('clue')
        word = data.get('word', '').upper()

        if not clue or not word:
            return jsonify({"error": "Clue and word are required!"}), 400

        if word in default_words:
            return jsonify({"error": f"'{word}' already exists!"}), 400

        # Add the clue and word
        default_clues.append({"clue": clue, "word": word})
        default_words.append(word)
        save_clues(default_clues, default_words)

        print(f"Added new clue: {clue}, word: {word}")
        return jsonify({"success": True, "message": "Clue and word added successfully!"}), 200
    except Exception as e:
        print("Error adding new clue and word:", e)
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    print("Starting the Word Puzzle Backend Server...")
    app.run(host="0.0.0.0", port=3078, debug=True)

