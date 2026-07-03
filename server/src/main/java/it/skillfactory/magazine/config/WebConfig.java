package it.skillfactory.magazine.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${magazine.upload.dir:./uploads}")
    private String uploadDir;

    @Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Puntiamo direttamente al percorso assoluto del volume montato nel container Linux
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:/app/uploads/")
            .setCacheControl(org.springframework.http.CacheControl.noCache())
            .resourceChain(false);
}

    @Override
public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
    registry.addMapping("/uploads/**")
            .allowedOriginPatterns("http://localhost:[*]", "http://127.0.0.1:[*]", "https://magazine.skillfactory.it")
            .allowedMethods("GET", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
}