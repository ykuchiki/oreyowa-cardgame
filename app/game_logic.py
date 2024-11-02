import random

class Player:
    """
    各プレイヤーの情報を管理します。HPやデッキ、手札の管理を行い、カードのドローやプレイも担当します。
    """
    def __init__(self, name, hp=20):
        self.name = name
        self.hp = hp
        self.hand = []
        self.deck = self.initialize_deck()
        self.draw_initial_hand()

    def initialize_deck(self):
        # カードの種類を設定。攻撃・防御・回復カードをデッキに追加
        return ["attack", "defense", "heal", "special"] * 5

    def draw_initial_hand(self):
        # 初期手札をランダムに3枚ドロー
        for _ in range(3):
            self.draw_card()

    def draw_card(self):
        if len(self.deck) > 0:
            card = random.choice(self.deck)
            self.hand.append(card)
            self.deck.remove(card)
            return card
        return None

    def play_card(self, card):
        if card in self.hand:
            self.hand.remove(card)
            return card
        return None

    def apply_damage(self, amount):
        self.hp -= amount
        if self.hp < 0:
            self.hp = 0

    def heal(self, amount):
        self.hp += amount


class Game:
    """
    ゲーム全体の進行を管理し、各ターンの切り替えやカード効果の適用を行います。
    """
    def __init__(self, player1_name, player2_name):
        self.player1 = Player(player1_name)
        self.player2 = Player(player2_name)
        self.current_player = self.player1
        self.other_player = self.player2

    def start_turn(self):
        # ターン開始時にカードを1枚引く
        self.current_player.draw_card()

    def switch_turn(self):
        # ターンを切り替え、次のプレイヤーがカードを引く
        self.current_player, self.other_player = self.other_player, self.current_player
        self.start_turn()

    def apply_card_effect(self, card):
        if card == "attack":
            self.other_player.apply_damage(5)
        elif card == "defense":
            pass  # 防御カードの効果は今回は単純化
        elif card == "heal":
            self.current_player.heal(3)
        elif card == "special":
            self.other_player.apply_damage(8)  # 特殊カードの効果（強力な攻撃）

    def play_turn(self, card):
        if card in self.current_player.hand:
            self.apply_card_effect(card)
            self.current_player.play_card(card)
            return True
        return False

    def is_game_over(self):
        return self.player1.hp <= 0 or self.player2.hp <= 0

    def get_game_state(self):
        """ゲームの現在の状態を辞書形式で返し、フロントエンドでの表示に使用できます"""
        return {
            "player1": {"name": self.player1.name, "hp": self.player1.hp, "hand": self.player1.hand},
            "player2": {"name": self.player2.name, "hp": self.player2.hp, "hand": self.player2.hand},
            "current_turn": self.current_player.name
        }
