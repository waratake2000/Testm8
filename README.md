# Cursor Testcase Manager

Cursor Testcase Manager は、ワークスペース内の `testcases/*.yml` を読み込み、テストケースを一覧表示する VS Code / Cursor 用の拡張機能です。タイトルや入出力、タグ情報をテーブル表示し、クリックでソートやフィルタリングができます。

## 特徴
- YAML 形式のテストケースを自動で読み込み
- クリックでテーブルのソートが可能
- タイトルでのフィルタリング機能
- 拡張機能コマンド `Open Testcase Manager` で WebView を表示

## セットアップ
1. リポジトリをクローンし、依存関係をインストールします。
   ```bash
   npm install
   ```
2. TypeScript をコンパイルして `dist` ディレクトリを生成します。
   ```bash
   npm run compile
   ```

## Cursor での実行手順
1. Cursor でこのフォルダを開きます。
2. `npm install` と `npm run compile` を実行します（上記参照）。
3. `F5` または `Debug: Start Debugging` を実行し、`Run Extension` 構成を選択すると、拡張機能が読み込まれた別ウィンドウが起動します。
4. コマンドパレット (`Ctrl+Shift+P`) から `Open Testcase Manager` を実行すると、テストケース一覧が表示されます。

## テストケースの書き方
`testcases` フォルダ内に YAML ファイルを作成します。複数のテストケースを配列として記述できます。
```yaml
- title: Sample Test
  input: 1 + 1
  expected: 2
  tags: [math, sample]
- title: Another Test
  input: 'hello'.toUpperCase()
  expected: 'HELLO'
  tags: [string]
```

## 開発メモ
- 主要なソースコードは `src/extension.ts` にあります。
- コンパイル済みファイルは `.gitignore` によりコミット対象外です。

## ライセンス
MIT License

