FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine AS extractor
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:17-jre-alpine AS runtime

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

COPY --from=extractor /app/dependencies/ ./
COPY --from=extractor /app/spring-boot-loader/ ./
COPY --from=extractor /app/snapshot-dependencies/ ./
COPY --from=extractor /app/application/ ./

EXPOSE 8080

# Production-tuned JVM flags for containerized environments:
# -XX:+UseContainerSupport: Detects container cgroups memory/CPU limits
# -XX:MaxRAMPercentage=75: Restricts heap to 75% of container RAM to avoid OOM killer
# -XX:+UseSerialGC: Drastically reduces heap/thread overhead on small container tiers (<2GB)
# -XX:TieredStopAtLevel=1: Speeds up container startup time by using C1 compiler without C2 profiling
# -Xshare:auto: Uses class data sharing archives if available
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xshare:auto"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]