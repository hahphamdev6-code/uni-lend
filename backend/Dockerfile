# Build with the same Maven release pinned by .mvn/wrapper/maven-wrapper.properties.
FROM maven:3.9.16-eclipse-temurin-25 AS build
WORKDIR /workspace

COPY pom.xml ./pom.xml
COPY src ./src
RUN mvn -B -ntp -DskipTests package

# curl is used only by the container healthcheck. The application runs as UID 10001.
FROM eclipse-temurin:25-jre-noble AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates passwd \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app \
    && mkdir -p /app/uploads \
    && chown 10001:10001 /app/uploads \
    && chmod 0750 /app/uploads

WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar
ENV UPLOAD_DIR=/app/uploads
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
