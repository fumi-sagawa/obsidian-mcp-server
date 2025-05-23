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

### プロジェクト構造

```
src/
├── app/              # アプリケーション初期化
├── features/         # 機能モジュール
│   ├── get-alerts/   # 気象警報機能
│   └── get-forecast/ # 天気予報機能
├── entities/         # ドメインモデル
│   └── weather/      # 気象関連の型定義
├── shared/           # 共有リソース
│   └── api/          # 外部API統合
└── index.ts          # エントリーポイント
```

### FSD レイヤーの責務

- **app/** - アプリケーションのブートストラップ、MCPサーバー設定
- **features/** - ビジネス機能の実装（ハンドラー、フォーマット、検証）
- **entities/** - ドメインモデルと型定義
- **shared/** - 共通ユーティリティ、外部APIクライアント

## 開発

### 開発手法 - テスト駆動開発（TDD）

このプロジェクトはテスト駆動開発（TDD）を採用しています：

1. **要件整理** - 新機能の要件を明確に定義
2. **テスト作成** - 要件を満たすテストコードを先に作成
3. **実装** - テストが通る最小限のコードを実装
4. **リファクタリング** - コードの品質を向上

### ビルド

```bash
npm run build
```

TypeScriptをJavaScriptにコンパイルし、適切な実行権限を設定します。

### テスト

```bash
npm test              # 単体テストをカバレッジ付きで実行
npm run test:unit     # カバレッジなしで高速実行
npm run test:watch    # ファイル変更を監視して自動実行
```

テストカバレッジは97%以上を維持しています。すべてのテストは日本語で記述されています。

### 実行

サーバーはstdio経由で通信し、MCPクライアントから起動されるように設計されています。

## API統合

このサーバーは米国国立気象局の [weather.gov API](https://www.weather.gov/documentation/services-web-api) を使用しています。APIキーは不要です。

## 必要要件

- Node.js 16+
- TypeScript 5+

## ライセンス

MIT