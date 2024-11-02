async function startGame() {
    const response = await fetch('/start_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1_name: 'プレイヤー1', player2_name: 'プレイヤー2' })
    });
    const data = await response.json();
    displayGameState(data.state);
}

async function drawCard() {
    const response = await fetch('/draw_card', { method: 'POST' });
    const data = await response.json();
    displayGameState(data.state);
}

async function playCard() {
    const card = prompt("プレイするカードを入力してください:");
    if (!card) {
        alert("カードを入力してください。");
        return;
    }

    const response = await fetch('/play_card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card: card })
    });
    const data = await response.json();
    if (data.error) {
        alert(data.error);
    } else {
        displayGameState(data.state);
    }
}

function displayGameState(state) {
    document.getElementById('game_state').innerHTML = JSON.stringify(state, null, 2);
}
