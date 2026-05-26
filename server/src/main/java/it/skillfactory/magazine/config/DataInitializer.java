package it.skillfactory.magazine.config;

import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UtenteRepository repository, PasswordEncoder encoder) {
        return args -> {
            String[][] editori = {
                {"Mirko", "Onorato"},
                {"Gino", "Visciano"},
                {"Davide", "Grillo"},
                {"Antonella", "Visciano"},
                {"Amelia", "Milone"}
            };

            for (String[] ed : editori) {
                String username = (ed[0] + "." + ed[1]).toLowerCase();
                if (repository.findByUsername(username).isEmpty()) {
                    // Genera password random (8 caratteri)
                    String passwordRandom = UUID.randomUUID().toString().substring(0, 8);
                    
                    Utente u = new Utente();
                    u.setNome(ed[0]);
                    u.setCognome(ed[1]);
                    u.setUsername(username);
                    u.setPassword(encoder.encode(passwordRandom));
                    u.setRuolo("ROLE_EDITORE");
                    repository.save(u);
                    
                    System.out.println("**************************************************");
                    System.out.println("EDITORE: " + username + " | PWD: " + passwordRandom);
                    System.out.println("**************************************************");
                }
            }
        };
    }
}
