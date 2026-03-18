# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
ENV MAVEN_OPTS="-Xmx256m -Xms128m"
RUN mvn clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/secure-cloud-storage-1.0.0.jar app.jar
ENV PORT=10000
EXPOSE 10000
ENTRYPOINT ["java", "-Xmx256m", "-Dserver.port=${PORT}", "-jar", "app.jar"]
