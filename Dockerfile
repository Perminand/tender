FROM node:18 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. ./
RUN npm run build

# Сборка backend
FROM maven:3.8.5-openjdk-23 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src/ ./src/
RUN mvn clean package -DskipTests

# Финальный образ
FROM openjdk:23-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar ./app.jar
COPY --from=frontend-build /app/dist ./static

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]