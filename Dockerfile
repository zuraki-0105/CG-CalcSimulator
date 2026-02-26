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

# ビルド用イメージから作成された jar ファイルをコピー
COPY --from=build /workspace/app/target/*.jar app.jar

# エントリーポイントの指定 (jar の実行)
ENTRYPOINT ["java","-jar","/app.jar"]
