# Используем официальный образ OpenJDK
FROM openjdk:17-jdk-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем Maven wrapper и pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Делаем mvnw исполняемым
RUN chmod +x mvnw

# Скачиваем зависимости (этот слой будет кэшироваться)
RUN ./mvnw dependency:go-offline -B

# Копируем исходный код
COPY src src

# Собираем приложение
RUN ./mvnw clean package -DskipTests

# Переименовываем JAR файл для удобства
RUN mv target/*.jar app.jar

# Открываем порт
EXPOSE 8080

# Запускаем приложение
ENTRYPOINT ["java", "-jar", "app.jar"] 