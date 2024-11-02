async function startGame() {
    const response = await fetch('/start_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1_name: 'プレイヤー1', player2_name: 'プレイヤー2' })
    });
    const data = await response.json();
    updateGameState(data.state);
}

async function drawCard() {
    const response = await fetch('/draw_card', { method: 'POST' });
    const data = await response.json();
    updateGameState(data.state);
}

async function playCard(card) {
    if (!card) return;

    const response = await fetch('/play_card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card: card })
    });
    const data = await response.json();

    if (!data.error) {
        const isSelfAction = (card === "heal" || card === "defense"); // 回復や防御なら自分向き
        showActionArrow(isSelfAction, data.state); // 矢印を表示

        setTimeout(async () => {
            updateGameState(data.state);
            await checkGameOver(); // ゲームオーバーの確認
            if (!data.state.is_game_over) {
                await switchTurn(); // ゲームが続行中ならターンを切り替え
            }
            removeActionArrow(); // ターンが切り替わったら矢印を消去
        }, 1000);
    }
}


async function switchTurn() {
    // removeArrowEffect(); // 矢印を消去

    const response = await fetch('/switch_turn', { method: 'POST' });
    const data = await response.json();
    updateGameState(data.state);
}

let game_over = false; // ゲーム終了フラグを追加

async function checkGameOver() {
    const response = await fetch('/is_game_over', { method: 'GET' });
    const data = await response.json();
    if (data.game_over) {
        game_over = true; // ゲーム終了フラグを設定
        alert(`${data.winner}の勝利！`);
        resetGame(); // ゲーム終了後に画面をリセット
    }
}

function resetGame() {
    location.reload();
}

function updateGameState(state) {
    // ゲーム終了後の更新を防止
    if (game_over) return;

    // プレイヤー情報を更新
    const player1Hp = document.getElementById('player1-hp');
    const player2Hp = document.getElementById('player2-hp');
    if (player1Hp && player2Hp) {
        player1Hp.textContent = state.player1.hp;
        player2Hp.textContent = state.player2.hp;
    } else {
        console.error("Player HP elements not found.");
        return;  // エラーがあれば処理を終了
    }

    // 現在のプレイヤーアイコンを設定
    const currentTurnIcon = document.getElementById('current-turn-icon');
    const currentTurnText = document.getElementById('current-turn'); // 名前を表示する要素
    if (currentTurnIcon) {
        if (state.current_turn === "プレイヤー1") {
            currentTurnIcon.src = "/static/images/player1.jpg";
            currentTurnIcon.alt = "プレイヤー1";
        } else if (state.current_turn === "プレイヤー2") {
            currentTurnIcon.src = "/static/images/player2.jpg";
            currentTurnIcon.alt = "プレイヤー2";
        }
    } else {
        console.error("Current turn icon element not found.");
    }

    // 手札を表示
    const player1Hand = document.getElementById('player1-hand');
    const player2Hand = document.getElementById('player2-hand');
    if (!player1Hand || !player2Hand) {
        console.error("Player hand elements not found.");
        return;  // エラーがあれば処理を終了
    }

    player1Hand.innerHTML = "";
    player2Hand.innerHTML = "";

    // 現在のプレイヤーがどちらかを判定
    const isPlayer1Turn = state.current_turn === "プレイヤー1";

    // プレイヤー1の手札
    state.player1.hand.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("hand-card");
        cardElement.innerHTML = `<img src="/static/images/${card}.jpg" alt="${card}"><span>${card}</span>`;
        if (isPlayer1Turn) {
            cardElement.onclick = () => playCard(card);  // プレイヤー1のターンのみクリックイベントを追加
        }
        player1Hand.appendChild(cardElement);
    });

    // プレイヤー2の手札
    state.player2.hand.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("hand-card");
        cardElement.innerHTML = `<img src="/static/images/${card}.jpg" alt="${card}"><span>${card}</span>`;
        if (!isPlayer1Turn) {
            cardElement.onclick = () => playCard(card);  // プレイヤー2のターンのみクリックイベントを追加
        }
        player2Hand.appendChild(cardElement);
    });

    // カレントプレイヤーの強調表示
    const player1Info = document.getElementById('player1-info');
    const player2Info = document.getElementById('player2-info');
    if (player1Info && player2Info) {
        player1Info.classList.toggle("current-turn", state.current_turn === "プレイヤー1");
        player2Info.classList.toggle("current-turn", state.current_turn === "プレイヤー2");
    } else {
        console.error("Player info elements not found.");
    }
}

function showActionArrow(isSelfAction, state) {
    const arrow = document.getElementById("action-arrow");

    // 現在のプレイヤーが誰かに応じて矢印の向きを決定
    const isPlayer1Turn = state.current_turn === "プレイヤー1";

    // 矢印の向きを設定
    if (isSelfAction) {
        arrow.classList.remove("arrow-to-target");
        arrow.classList.add("arrow-to-self");
    } else {
        arrow.classList.remove("arrow-to-self");
        arrow.classList.add("arrow-to-target");
    }

    // クソみたいやけど挙動を無理やり合わせるよう
    if (isPlayer1Turn) {
        if (isSelfAction){
            arrow.classList.remove("arrow-to-self");
            arrow.classList.add("arrow-to-target");
        } else {
            arrow.classList.remove("arrow-to-target");
            arrow.classList.add("arrow-to-self");
        }
    }


    // 矢印を表示
    arrow.style.visibility = "visible";
}

function removeActionArrow() {
    const arrow = document.getElementById("action-arrow");
    if (arrow) {
        arrow.style.visibility = "hidden";
    }
}
