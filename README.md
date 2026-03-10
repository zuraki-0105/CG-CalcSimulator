# CG_CalcSimulator (CG 投影変換シミュレーター)

🌐 **デプロイ済みのアプリはこちらからお試しいただけます:**
[https://cg-calc-simulator-971829079108.us-west1.run.app](https://cg-calc-simulator-971829079108.us-west1.run.app)

## 1. プロジェクト概要

コンピュータグラフィックスにおける **2D / 3D の幾何変換** を、ブラウザ上で直感的にシミュレーションする Web アプリケーションです。
平行移動・回転・拡大縮小・鏡映変換などの操作を組み合わせ、行列の計算プロセスと図形の変形を視覚的に結びつけて学ぶことができます。

---

## 2. 技術スタック

| 区分         | 技術                     | 概要                                                                |
| ------------ | ------------------------ | ------------------------------------------------------------------- |
| **Backend**  | Java 17, Spring Boot 4   | REST API サーバー。行列計算・座標変換ロジックを担当。               |
| **Frontend** | HTML, CSS, JavaScript    | Vanilla JS + Plotly.js によるグラフ描画。外部フレームワーク不使用。 |
| **行列演算** | EJML 0.43                | 同次座標の計算 (3×3 / 4×4 行列) に使用。                            |
| **ビルド**   | Maven                    | Maven Wrapper 同梱。                                                |
| **デプロイ** | Docker, Google Cloud Run | Docker Hub 経由で Cloud Run にデプロイ。                            |

---

## 3. 環境構築・実行方法

### 前提条件

- JDK 17 以上

### 手順

```powershell
# 1. クローン
git clone https://github.com/zuraki-0105/CG_CalcSimulator.git
cd CG_CalcSimulator

# 2. ビルド＆起動（ローカル開発: ブラウザ自動起動）
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=local"

# ※ ブラウザ自動起動なし
.\mvnw spring-boot:run
```

起動後 → `http://localhost:8080/`

---

## 4. 主な機能

- **次元切り替え:** トップページで 2D / 3D を選択。
- **図形選択:** 四角形・円/楕円 (2D)、直方体・球 (3D) から描画対象を選択し、パラメータを指定。
- **変換操作の追加:** 平行移動・回転・拡大縮小・任意行列入力、および **鏡映変換**（任意の直線/平面に対する反転）を組み合わせ可能。
- **複合変換シミュレーション:** 追加した操作の合成結果を描画し、変換前後の軌跡をリアルタイムで確認。
- **合成行列の可視化:** 内部で掛け合わされた同次座標合成行列 (3×3 / 4×4) を UI 上で確認。
- **鏡映変換のプレビュー:** 鏡映変換選択時に、元の図形と反射直線を重ねて表示するプレビュー機能。変換手順 (`T→R→Ref→R⁻¹→T⁻¹`) も表示。

---

## 5. 画面遷移フロー

```text
index.html         2D/3D 選択
    ↓
shape.html         図形選択・パラメータ入力（プレビュー付き）
    ↓
trans-matrix.html  変換操作の追加・行列リスト管理
    ↓
confirm.html       パラメータ確認・合成行列表示
    ↓
draw.html          Plotly による変換結果描画
```

※ 各ステップ間のデータ受け渡しには `sessionStorage` を使用しています。

---

## 6. ディレクトリ構成

```text
CG_CalcSimulator/
├── pom.xml                        # Maven 設定
├── mvnw / mvnw.cmd                # Maven Wrapper
├── Dockerfile                     # コンテナビルド定義
├── deploy.ps1                     # デプロイスクリプト
└── src/main/
    ├── java/.../CG_CalcSimulation/
    │   ├── CgCalcSimulationApplication.java  # エントリポイント
    │   ├── BrowserLauncher.java              # local プロファイル時ブラウザ自動起動
    │   ├── api/                              # REST API (Controller, Request/Response DTOs)
    │   ├── matrix3/                          # 2D 行列計算 (Point2D, Matrix3, Transform 等)
    │   ├── matrix4/                          # 3D 行列計算 (Point3D, Matrix4, Transform3D 等)
    │   ├── shape/                            # 2D 図形定義 (Rectangle, Ellipse 等)
    │   ├── shape3D/                          # 3D 図形定義 (Cuboid, Sphere 等)
    │   └── util/                             # バリデーションユーティリティ
    └── resources/
        ├── application.properties            # サーバー設定
        └── static/                           # フロントエンド
            ├── index.html                    # トップページ
            ├── common/                       # 共通 CSS / JS
            ├── 2D/                           # 2D 用 (html, css, js)
            └── 3D/                           # 3D 用 (html, css, js)
```

---

## 7. API エンドポイント

| メソッド | パス                        | 概要                                          |
| -------- | --------------------------- | --------------------------------------------- |
| POST     | `/api/2d/compose-matrix`    | 変換コマンド群 → 合成 3×3 行列を返却          |
| POST     | `/api/2d/draw`              | 図形 + 変換 → 変換前後の頂点座標を返却        |
| POST     | `/api/2d/reflection-matrix` | 鏡映変換パラメータ → 分解行列・合成行列を返却 |
| POST     | `/api/3d/compose-matrix`    | 変換コマンド群 → 合成 4×4 行列を返却          |
| POST     | `/api/3d/draw`              | 図形 + 変換 → 変換後の空間座標を返却          |

---



## 8. 注意事項

- **推奨環境:** PC ブラウザ（Chrome / Edge 等）。スマートフォンの場合は Safari 等のブラウザから開いてください。
- DB 連携は行っていません。設定はすべて `application.properties` で管理しています。
