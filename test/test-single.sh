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
    node -e "
    import { MockApiServer } from './test/tools/shared/mock-server.js';
    const mockServer = new MockApiServer();
    mockServer.start().then(() => {
      require('fs').writeFileSync('$PORT_FILE', String(mockServer.port));
      process.on('SIGTERM', () => process.exit(0));
    });
    " &
    MOCK_PID=$!
    
    # モックサーバーの起動を待つ（ポートファイルが作成されるまで）
    for i in {1..10}; do
        if [ -f "$PORT_FILE" ] && [ -s "$PORT_FILE" ]; then
            MOCK_PORT=$(cat "$PORT_FILE")
            break
        fi
        sleep 0.5
    done
    
    if [ -z "$MOCK_PORT" ]; then
        echo "エラー: モックサーバーの起動に失敗しました"
        kill $MOCK_PID 2>/dev/null
        rm -f "$PORT_FILE"
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
    rm -f "$PORT_FILE"
else
    # 実際のAPIを使用（危険）
    echo "⚠️  警告: 実際のObsidian APIを使用します。データが変更される可能性があります。"
    echo ""
    
    # リクエストを送信して結果を表示
    echo "$REQUEST" | node build/index.js | jq .
fi