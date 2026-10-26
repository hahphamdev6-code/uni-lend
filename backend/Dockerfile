FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 unilend \
    && useradd --system --uid 10001 --gid 10001 --home-dir /app unilend \
    && mkdir -p /app/uploads \
    && chown -R 10001:10001 /app
COPY --from=build --chown=10001:10001 /workspace/target/*.jar /app/app.jar
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=90s --retries=10 \
  CMD curl --fail --silent --show-error http://127.0.0.1:8080/categories > /dev/null || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
