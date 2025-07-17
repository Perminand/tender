FROM node:20 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN rm -rf node_modules package-lock.json && npm cache clean --force && npm install
COPY frontend/. ./
RUN npm run build

# Сборка backend
FROM maven:3.9.6-openjdk-21 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src/ ./src/
RUN mvn clean package -DskipTests

# Финальный образ
FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar ./app.jar
COPY --from=frontend-build /app/dist ./static

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"] 