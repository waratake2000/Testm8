# 🧪 Cursor Testcase Manager - 環境構築ガイド

![Testm8 Icon](resources/Testm8.png)

このドキュメントでは、Cursor Testcase Manager拡張機能の開発環境を構築する手順を説明します。

## 📋 前提条件

### 必要なソフトウェア
- **Node.js** (v16.0.0以上推奨)
- **npm** (Node.jsと一緒にインストールされます)
- **Cursor** または **VS Code** (拡張機能の実行環境)

### 確認方法
```bash
# Node.jsのバージョン確認
node --version

# npmのバージョン確認
npm --version
```

## 🚀 環境構築手順

### 1. プロジェクトのクローン
```bash
# リポジトリをクローン（既にクローン済みの場合はスキップ）
git clone <repository-url>
cd Testm8
```

### 2. 依存関係のインストール
```bash
# 必要なパッケージをインストール
npm install
```

**インストールされるパッケージ:**
- `@types/node` - Node.jsの型定義
- `@types/vscode` - VS Code APIの型定義
- `typescript` - TypeScriptコンパイラ
- `js-yaml` - YAMLパーサー
- `@types/js-yaml` - js-yamlの型定義

### 3. TypeScriptのコンパイル
```bash
# TypeScriptソースコードをコンパイル
npm run compile
```

**実行される処理:**
- `src/extension.ts` → `dist/extension.js` にコンパイル
- ソースマップファイルも生成

### 4. コンパイル結果の確認
```bash
# distディレクトリの内容を確認
ls -la dist/
```

**期待される出力:**
```
extension.js
extension.js.map
```

## 🔧 開発用コマンド

### 利用可能なnpmスクリプト
```bash
# TypeScriptをコンパイル
npm run compile

# ファイル変更を監視して自動コンパイル
npm run watch

# テスト実行（現在は未実装）
npm test
```

## 🎯 拡張機能の実行

### Cursor/VS Codeでの実行手順

1. **Cursorでプロジェクトを開く**
   ```bash
   cursor .
   ```

2. **デバッグ実行**
   - `F5`キーを押す
   - または `Ctrl+Shift+P` → "Debug: Start Debugging"
   - "Run Extension"構成を選択

3. **拡張機能のテスト**
   - 新しいCursorウィンドウが起動
   - `Ctrl+Shift+P` → "Open Testcase Manager"を実行
   - テストケース一覧が表示される

## 📁 プロジェクト構造

```
Testm8/
├── src/
│   └── extension.ts          # メインの拡張機能コード
├── dist/
│   ├── extension.js          # コンパイル済み拡張機能
│   └── extension.js.map      # ソースマップ
├── testcases/
│   └── example.yml           # サンプルテストケース
├── package.json              # プロジェクト設定
├── tsconfig.json             # TypeScript設定
└── README.md                 # プロジェクト説明
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. TypeScriptコンパイルエラー
```bash
# エラー例: Could not find a declaration file for module 'js-yaml'
npm install --save-dev @types/js-yaml
```

#### 2. Node.jsがインストールされていない場合
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# macOS (Homebrew)
brew install node

# Windows
# https://nodejs.org/ からダウンロード
```

#### 3. 権限エラーが発生する場合
```bash
# npmのキャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 4. 拡張機能が実行されない場合
- Cursor/VS Codeを再起動
- デバッグコンソールでエラーメッセージを確認
- `dist/extension.js`が存在することを確認

## 📝 開発メモ

### ファイル変更時の自動コンパイル
```bash
# ファイル変更を監視して自動コンパイル
npm run watch
```

### 新しいテストケースの追加
1. `testcases/`ディレクトリにYAMLファイルを作成
2. 以下の形式でテストケースを記述：

```yaml
- title: テストケース名
  input: 入力値
  expected: 期待値
  tags: [タグ1, タグ2]
```

### 拡張機能の再読み込み
- デバッグウィンドウで `Ctrl+R` を押す
- または拡張機能ウィンドウを閉じて再実行

## ✅ 環境構築完了の確認

以下のコマンドがすべて正常に実行されれば環境構築完了です：

```bash
# 1. 依存関係のインストール
npm install

# 2. TypeScriptコンパイル
npm run compile

# 3. 生成ファイルの確認
ls dist/

# 4. 拡張機能の実行テスト
# F5 → "Run Extension" → 新しいウィンドウで "Open Testcase Manager"
```

## 📚 参考リンク

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [js-yaml Documentation](https://github.com/nodeca/js-yaml)

---

**作成日:** 2024年12月
**バージョン:** 1.0.0 