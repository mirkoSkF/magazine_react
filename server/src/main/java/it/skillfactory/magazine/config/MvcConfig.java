package it.skillfactory.magazine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Definiamo il percorso assoluto della cartella dei file su Ubuntu
        String percorsoUbuntu = "/home/administrator/Scrivania/magazine/server/uploads/copertine/";
        
        Path uploadDir = Paths.get(percorsoUbuntu);
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        // Colleghiamo l'URL "https://magazine.skillfactory.it/files/nomefile.jpg" 
        // alla cartella fisica dentro Ubuntu
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}