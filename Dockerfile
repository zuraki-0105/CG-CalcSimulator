# ベースイメージとして公式のJava 17 (Eclipse Temurin) を使用
FROM eclipse-temurin:17-jdk-alpine AS build

# 作業ディレクトリを作成
WORKDIR /workspace/app

# プロジェクトのソースコードをコピー
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# mvnw に実行権限を付与し、パッケージをビルド (テストはスキップ)
RUN chmod +x ./mvnw
RUN ./mvnw install -DskipTests

# 実行用の軽量イメージを作成
FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp

# ポート8080を使用することを明示（Cloud Runやローカルでの標準ポート）
EXPOSE 8080

# ビルド用イメージから作成された jar ファイルをコピー
COPY --from=build /workspace/app/target/*.jar app.jar

# アプリケーションが「ポートを勝手に変えずに、指定されたポート（8080）で起動し続ける」ようにする
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app.jar"]
