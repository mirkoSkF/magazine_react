FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copia il jar generato (modifica il nome se diverso)
COPY target/*.jar app.jar
EXPOSE 8096
ENTRYPOINT ["java", "-jar", "app.jar"]