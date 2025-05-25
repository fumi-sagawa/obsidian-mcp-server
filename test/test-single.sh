#!/bin/bash

# 単一のMCPツールコマンドを実行するヘルパースクリプト
# 
# 使用方法:
#   ./test/test-single.sh [mock] <tool-name> <json-arguments>
#
# 例:
#   ./test/test-single.sh mock get-server-status '{}'
#   ./test/test-single.sh get-file '{"filename":"test.md"}'
#   ./test/test-single.sh dangerous get-alerts '{"state":"CA"}'

# mockパラメータのチェック
if [ "$1" = "mock" ]; then
    USE_MOCK=true
    shift
elif [ "$1" = "dangerous" ]; then
    USE_MOCK=false
    shift
else
    # デフォルトはmock
    USE_MOCK=true
fi

TOOL_NAME=$1
ARGUMENTS=$2

if [ -z "$TOOL_NAME" ] || [ -z "$ARGUMENTS" ]; then
    echo "使用方法: $0 [mock|dangerous] <tool-name> <json-arguments>"
    echo ""
    echo "例:"
    echo "  $0 mock get-server-status '{}' # モックサーバーを使用（デフォルト）"
    echo "  $0 get-file '{\"filename\":\"test.md\"}' # モックサーバーを使用"
    echo "  $0 dangerous get-alerts '{\"state\":\"CA\"}' # 実際のAPIを使用（危険）"
    exit 1
fi

# ビルドが必要な場合
if [ ! -f "build/index.js" ]; then
    npm run build
fi

# MCPリクエストを構築
REQUEST=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "$TOOL_NAME",
    "arguments": $ARGUMENTS
  },
  "id": $(date +%s)
}
EOF
)

# モックサーバーを使用する場合
if [ "$USE_MOCK" = true ]; then
    # 一時ファイルを作成してポート番号を共有
    PORT_FILE=$(mktemp)
    
    # モックサーバーを起動（バックグラウンド）
    node test/tools/shared/mock-server-runner.js > "$PORT_FILE.log" 2>&1 &
    MOCK_PID=$!
    
    # ポート番号を取得（ログから抽出）
    sleep 1
    
    # モックサーバーの起動を待つ（ログファイルからポート番号を抽出）
    for i in {1..10}; do
        if [ -f "$PORT_FILE.log" ] && grep -q "モックサーバーが起動しました" "$PORT_FILE.log"; then
            MOCK_PORT=$(grep "http://localhost:" "$PORT_FILE.log" | sed -E 's/.*:([0-9]+).*/\1/')
            if [ -n "$MOCK_PORT" ]; then
                break
            fi
        fi
        sleep 0.5
    done
    
    if [ -z "$MOCK_PORT" ]; then
        echo "エラー: モックサーバーの起動に失敗しました"
        cat "$PORT_FILE.log" 2>/dev/null
        kill $MOCK_PID 2>/dev/null
        rm -f "$PORT_FILE" "$PORT_FILE.log"
        exit 1
    fi
    
    # 環境変数を設定してモックサーバーを使用
    export OBSIDIAN_API_URL="http://localhost:$MOCK_PORT"
    echo "モックサーバーを使用します: $OBSIDIAN_API_URL"
    echo ""
    
    # リクエストを送信して結果を表示
    echo "$REQUEST" | node build/index.js | jq .
    
    # モックサーバーを停止
    kill $MOCK_PID 2>/dev/null
    rm -f "$PORT_FILE" "$PORT_FILE.log"
else
    # 実際のAPIを使用（危険）
    echo "⚠️  警告: 実際のObsidian APIを使用します。データが変更される可能性があります。"
    echo ""
    
    # リクエストを送信して結果を表示
    echo "$REQUEST" | node build/index.js | jq .
fi