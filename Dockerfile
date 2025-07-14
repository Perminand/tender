# Сборка фронтенда
FROM node:18 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production
COPY frontend/ ./frontend/
RUN npm run build

# Сборка backend
FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src/ ./src/
RUN mvn clean package -DskipTests

# Финальный образ
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar ./app.jar
COPY --from=frontend-build /app/frontend/dist ./static

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]