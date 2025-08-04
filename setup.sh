#!/bin/bash

# Testm8 - 環境構築スクリプト
# 使用方法: ./setup.sh

set -e  # エラーが発生したら停止

echo "🚀 Testm8 - 環境構築を開始します..."

# 色付きの出力関数
print_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# Node.jsのバージョンチェック
print_info "Node.jsのバージョンを確認中..."
if ! command -v node &> /dev/null; then
    print_error "Node.jsがインストールされていません。"
    echo "以下のコマンドでインストールしてください："
    echo "Ubuntu/Debian: sudo apt install nodejs npm"
    echo "macOS: brew install node"
    echo "Windows: https://nodejs.org/ からダウンロード"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 16 ]; then
    print_warning "Node.js v16.0.0以上を推奨します。現在のバージョン: $NODE_VERSION"
else
    print_success "Node.js v$NODE_VERSION が確認されました"
fi

# npmのバージョンチェック
print_info "npmのバージョンを確認中..."
if ! command -v npm &> /dev/null; then
    print_error "npmがインストールされていません。"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm v$NPM_VERSION が確認されました"

# package.jsonの存在確認
if [ ! -f "package.json" ]; then
    print_error "package.jsonが見つかりません。正しいディレクトリで実行してください。"
    exit 1
fi

# 依存関係のインストール
print_info "依存関係をインストール中..."
npm install
print_success "依存関係のインストールが完了しました"

# js-yamlの型定義を追加インストール（必要に応じて）
if ! npm list @types/js-yaml &> /dev/null; then
    print_info "js-yamlの型定義をインストール中..."
    npm install --save-dev @types/js-yaml
    print_success "型定義のインストールが完了しました"
fi

# TypeScriptのコンパイル
print_info "TypeScriptをコンパイル中..."
npm run compile
print_success "TypeScriptのコンパイルが完了しました"

# 生成ファイルの確認
if [ -f "dist/extension.js" ]; then
    print_success "拡張機能ファイルが正常に生成されました"
else
    print_error "拡張機能ファイルの生成に失敗しました"
    exit 1
fi

# テストケースディレクトリの確認
if [ -d "testcases" ]; then
    TESTCASE_COUNT=$(find testcases -name "*.yml" | wc -l)
    print_success "テストケースディレクトリを確認しました ($TESTCASE_COUNT ファイル)"
else
    print_warning "testcasesディレクトリが見つかりません"
fi

echo ""
print_success "🎉 環境構築が完了しました！"
echo ""
echo "次のステップ："
echo "1. Cursorでこのプロジェクトを開く"
echo "2. F5キーを押してデバッグ実行"
echo "3. 'Run Extension'を選択"
echo "4. 新しいウィンドウで 'Open Testm8' を実行"
echo ""
echo "詳細は SETUP.md を参照してください。" 