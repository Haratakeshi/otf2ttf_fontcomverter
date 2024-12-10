# Font Converter (OTF to TTF)

OTFフォントをTTFフォントに変換するWebアプリケーションです。

フォントデータを変換してくれる類似のサービスは世の中にあふれてますが、ローカル環境で動かしたい＆自分用のツールが欲しかったので Anthropic Claude & CLINE / Cursor を利用してどこまで半自動で生成できるか試してみました。

## 必要条件

- Node.js (v14以上)
- Python (v3.8以上)

## プロジェクトのセットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd otf2ttf_fontcomverter
```

2. ルートディレクトリの依存パッケージをインストール（重要）
```bash
npm install
```

3. クライアント側の依存パッケージをインストール
```bash
cd client
npm install
cd ..
```

4. サーバー側の依存パッケージをインストール
```bash
cd server
pip install -r requirements.txt
cd ..
```

## 開発サーバーの起動

### 方法1: 同時起動（推奨）
以下のコマンドで、フロントエンドとバックエンドの両方のサーバーを同時に起動できます：

```bash
npm run dev
```

### 方法2: 個別起動
もし同時起動でエラーが発生する場合は、2つの別々のターミナルで以下のコマンドを実行してください：

ターミナル1（バックエンド）:
```bash
cd server
python app.py
```

ターミナル2（フロントエンド）:
```bash
cd client
npm start
```

## 使用方法

1. ブラウザで http://localhost:3000 を開く
2. 「Select OTF Font File」ボタンをクリックしてOTFファイルを選択
3. 「Convert to TTF」ボタンをクリックして変換を実行
4. 変換されたTTFファイルが自動的にダウンロードされます

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Axios

### バックエンド
- Python
- Flask
- Flask-CORS
- FontTools

## ライセンス

MIT
