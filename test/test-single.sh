#!/bin/bash

# 単一のMCPツールコマンドを実行するヘルパースクリプト
# 
# 使用方法:
#   ./scripts/test-single.sh <tool-name> <json-arguments>
#
# 例:
#   ./scripts/test-single.sh get-alerts '{"state":"CA"}'
#   ./scripts/test-single.sh get-forecast '{"latitude":37.7749,"longitude":-122.4194}'

TOOL_NAME=$1
ARGUMENTS=$2

if [ -z "$TOOL_NAME" ] || [ -z "$ARGUMENTS" ]; then
    echo "使用方法: $0 <tool-name> <json-arguments>"
    echo "例: $0 get-alerts '{\"state\":\"CA\"}'"
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

# リクエストを送信して結果を表示
echo "$REQUEST" | node build/index.js | jq .