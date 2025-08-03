#!/bin/bash

# Cursor Testcase Manager - アイコン準備スクリプト
# 拡張機能用のアイコンを適切なサイズにリサイズします

echo "🧪 Cursor Testcase Manager - アイコン準備を開始します..."

# 必要なディレクトリを作成
mkdir -p icons

# 元のアイコンファイルを確認
if [ ! -f "resources/Testm8.png" ]; then
    echo "❌ resources/Testm8.png が見つかりません"
    exit 1
fi

echo "✅ 元のアイコンファイルを確認しました"

# ImageMagickがインストールされているかチェック
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagickがインストールされていません"
    echo "   手動でアイコンをリサイズしてください："
    echo "   - 128x128px: icons/icon-128.png"
    echo "   - 256x256px: icons/icon-256.png"
    echo "   - 512x512px: icons/icon-512.png"
    exit 1
fi

# アイコンをリサイズ
echo "🔄 アイコンをリサイズ中..."

# 128x128px (VS Code拡張機能用)
convert resources/Testm8.png -resize 128x128 resources/icon-128.png

# 256x256px (高解像度ディスプレイ用)
convert resources/Testm8.png -resize 256x256 resources/icon-256.png

# 512x512px (プレビュー用)
convert resources/Testm8.png -resize 512x512 resources/icon-512.png

echo "✅ アイコンのリサイズが完了しました"

# ファイルサイズを確認
echo "📊 生成されたアイコンファイル:"
ls -la resources/

echo ""
echo "🎉 アイコン準備が完了しました！"
echo ""
echo "次のステップ："
echo "1. package.jsonのiconパスを更新（必要に応じて）"
echo "2. 拡張機能をパッケージ化"
echo "3. マーケットプレイスに公開" 