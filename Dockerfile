FROM node:20 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. ./
RUN npm run build

# Сборка backend
FROM maven:latest AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src/ ./src/
# Копируем фронт в ресурсы backend
COPY --from=frontend-build /app/dist/. ./src/main/resources/static/
RUN ls -l ./src/main/resources/static/
RUN ls -l ./src/main/resources/static/assets
RUN mvn clean package -DskipTests

# Финальный образ
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar ./app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]