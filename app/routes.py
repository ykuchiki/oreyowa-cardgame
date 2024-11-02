from flask import jsonify, request
from . import app
from .game_logic import Game
from flask import render_template

# グローバル変数としてゲームのインスタンスを保持
game = None

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/start_game', methods=['POST'])
def start_game():
    global game
    data = request.json
    player1_name = data.get("player1_name", "Player 1")
    player2_name = data.get("player2_name", "Player 2")
    game = Game(player1_name, player2_name)
    return jsonify({"message": "Game started", "state": game.get_game_state()})

@app.route('/draw_card', methods=['POST'])
def draw_card():
    global game
    if game:
        card = game.current_player.draw_card()
        return jsonify({"card": card, "state": game.get_game_state()})
    return jsonify({"error": "Game not started"}), 400

@app.route('/play_card', methods=['POST'])
def play_card():
    global game
    if game:
        data = request.json
        card = data.get("card")
        if card is None:
            return jsonify({"error": "No card specified"}), 400

        success = game.play_turn(card)
        if success:
            return jsonify({"message": f"{card} played", "state": game.get_game_state()})
        else:
            return jsonify({"error": "カードの名前も読めないの？"}), 400
    return jsonify({"error": "まずゲームを始めましょう"}), 400

@app.route('/game_state', methods=['GET'])
def game_state():
    global game
    if game:
        return jsonify(game.get_game_state())
    return jsonify({"error": "Game not started"}), 400

@app.route('/is_game_over', methods=['GET'])
def is_game_over():
    global game
    if game and game.is_game_over():
        winner = game.player1.name if game.player2.hp <= 0 else game.player2.name
        return jsonify({"game_over": True, "winner": winner})
    return jsonify({"game_over": False})

@app.route('/switch_turn', methods=['POST'])
def switch_turn():
    if game:
        game.switch_turn()
        return jsonify({"state": game.get_game_state()})
    return jsonify({"error": "Game not started"}), 400