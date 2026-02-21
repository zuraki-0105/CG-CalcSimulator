# CG 投影変換シミュレーター

コンピュータグラフィックスにおける **2D / 3D の投影変換（平行移動・回転・拡大縮小）** をブラウザ上でシミュレーションできる Web アプリケーションです。

> [!NOTE]
> プログラムの詳細な仕様については今後追記予定です。

---

## 技術スタック

| 区分 | 技術 |
|---|---|
| **バックエンド** | Java 17 / Spring Boot 4.0 |
| **ビルドツール** | Maven (Maven Wrapper 同梱) |
| **行列演算** | EJML (Efficient Java Matrix Library) |
| **フロントエンド** | HTML / CSS / JavaScript（静的ファイル配信） |
| **GUI (デスクトップ)** | JavaFX 17 ※任意 |

---

## プロジェクト構成

```
CG_CalcSimulator/
├── pom.xml                          # Maven 設定ファイル
├── mvnw / mvnw.cmd                  # Maven Wrapper
│
└── src/main/
    ├── java/.../CG_CalcSimulation/
    │   ├── CgCalcSimulationApplication.java   # Spring Boot エントリポイント
    │   ├── CgCalcService.java                 # 変換計算サービス
    │   ├── CgController.java                  # REST コントローラ
    │   ├── CorsConfig.java                    # CORS 設定
    │   ├── InputDataModel.java                # 入力データモデル
    │   ├── TransformCommand.java              # 変換コマンド
    │   ├── matrix3/                           # 行列演算ユーティリティ
    │   ├── shape/                             # 図形定義 (Circle, Rectangle 等)
    │   ├── gui/                               # JavaFX デスクトップ GUI
    │   └── util/                              # バリデーション等
    │
    └── resources/
        ├── application.properties             # Spring Boot 設定
        └── static/                            # フロントエンド静的ファイル
            ├── index.html                     # トップページ (次元選択)
            ├── 2D/html/                       # 2D 用ページ群
            ├── 2D/css/                        # 2D 用スタイルシート
            ├── 2D/js/                         # 2D 用 JavaScript
            └── common/js/                     # 共通ユーティリティ
```

---

## Web アプリの画面フロー

```
次元の選択 (2D / 3D)
    ↓
図形の選択 (三角形, 四角形, 円 など)
    ↓
変換行列パラメータの入力 (平行移動, 回転, 拡大縮小)
    ↓
変換結果の確認・描画
```

---

## ローカルでの実行方法

### 前提条件

- **Java 17 以上** がインストールされていること（`java -version` で確認できます）

> [!IMPORTANT]
> Java 8 では起動できません。Red Hat OpenJDK 17 以上、Eclipse Temurin 17 以上などをご利用ください。

### 方法 1: VS Code の「実行とデバッグ」から起動する（推奨）

1. VS Code でプロジェクトを開く
2. 左サイドバーの **「実行とデバッグ」**（`Ctrl + Shift + D`）を開く
3. 上部のドロップダウンから **`CgCalcSimulationApplication`** を選択
4. **▶ ボタン** または `F5` キーで実行

起動完了後、ブラウザが自動で開きます（`local` プロファイル設定時）。

### 方法 2: コマンドラインから起動する

```powershell
# ブラウザ自動オープンあり（ローカル開発用）
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=local"

# ブラウザ自動オープンなし（通常起動）
.\mvnw spring-boot:run
```

### アクセス

起動後、ブラウザで以下の URL にアクセスしてください。

```
http://localhost:8080/
```

### 停止方法

- **VS Code**: 上部の赤い **⏹ 停止ボタン** をクリック
- **ターミナル**: `Ctrl + C` を押し、「バッチ ジョブを終了しますか (Y/N)?」に `Y` と入力

---

## デスクトップ GUI (JavaFX) での実行

JavaFX を使用したデスクトップ版も利用可能です。  
VS Code の「実行とデバッグ」から **`MainApp`** を選択して実行してください。

> [!NOTE]
> JavaFX SDK のパスが `launch.json` の `vmArgs` に設定されている必要があります。
