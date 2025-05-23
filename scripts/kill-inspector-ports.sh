#!/bin/bash

# MCP Inspectorが使用するポートを解放するスクリプト

echo "MCP Inspectorのポートをチェックしています..."

# よく使用されるポート
PORTS=(6274 6277)

for PORT in "${PORTS[@]}"; do
  # ポートを使用しているプロセスを検索
  PID=$(lsof -ti :$PORT 2>/dev/null)
  
  if [ ! -z "$PID" ]; then
    echo "ポート $PORT を使用しているプロセス (PID: $PID) を終了します..."
    kill -9 $PID 2>/dev/null
    echo "✅ ポート $PORT を解放しました"
  else
    echo "ポート $PORT は使用されていません"
  fi
done

echo ""
echo "完了しました。MCP Inspectorを起動できます。"