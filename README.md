# Weather MCP Server

Model Context Protocol (MCP) を使用して、米国国立気象局 (NWS) API からリアルタイムの気象情報を提供するサーバーです。

## 機能

- **気象警報**: 米国の任意の州の現在の気象警報を取得
- **天気予報**: 特定の座標の詳細な予報を取得
- **MCP統合**: MCP互換のAIアシスタントとシームレスに統合

## インストール

```bash
npm install
npm run build
```

## 使用方法

このサーバーはMCPプロトコルを実装しており、MCP互換のクライアントで使用できます。

### 利用可能なツール

#### `get-alerts`
指定された米国の州の現在の気象警報を取得します。

**パラメータ:**
- `state` (string, 必須): 2文字の米国州コード (例: "CA", "NY")

**レスポンス例:**
```json
[
  {
    "title": "洪水警報",
    "description": "...洪水警報発令中...",
    "severity": "深刻",
    "certainty": "観測済み",
    "urgency": "即時",
    "areas": "ロサンゼルス郡"
  }
]
```

#### `get-forecast`
特定の座標の天気予報を取得します。

**パラメータ:**
- `latitude` (number, 必須): 緯度
- `longitude` (number, 必須): 経度

**レスポンス例:**
```json
[
  {
    "name": "今日",
    "temperature": 72,
    "temperatureUnit": "F",
    "windSpeed": "10 mph",
    "shortForecast": "晴れ時々曇り",
    "detailedForecast": "晴れ時々曇り、最高気温は72度..."
  }
]
```

## アーキテクチャ

このプロジェクトは、スケーラブルなアーキテクチャのために [Feature-Sliced Design (FSD)](https://feature-sliced.design/) の原則に従っています。

### 現在の構成

```
src/
├── app/              # アプリケーションの初期化、MCPサーバーのセットアップ
├── features/         # 気象関連の機能（警報、予報）
├── entities/         # 気象ドメインモデル（Alert、Forecast）
├── shared/           # 共通ユーティリティ、APIクライアント、型定義
└── index.ts          # エントリーポイント
```

### FSD レイヤー構造

- **app/** - アプリケーションのブートストラップと設定
- **features/** - ビジネス機能（気象警報、予報）
- **entities/** - ドメインモデル（Alert、Forecast）
- **shared/** - 共通ユーティリティとAPIクライアント

## 開発

### ビルド

```bash
npm run build
```

TypeScriptをJavaScriptにコンパイルし、適切な実行権限を設定します。

### 実行

サーバーはstdio経由で通信し、MCPクライアントから起動されるように設計されています。

## API統合

このサーバーは米国国立気象局の [weather.gov API](https://www.weather.gov/documentation/services-web-api) を使用しています。APIキーは不要です。

## 必要要件

- Node.js 16+
- TypeScript 5+

## ライセンス

MIT