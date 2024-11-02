from flask import Flask

app = Flask(__name__)

# ルートやエンドポイントをインポート
from . import routes