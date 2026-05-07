package it.skillfactory.magazine.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disabilita CSRF (standard per API REST con JWT)
            .csrf(csrf -> csrf.disable())
            
            // 2. Configura CORS
            .cors(Customizer.withDefaults())
            
            // 3. FIX PER VIDEO YOUTUBE: Permette il caricamento di iframe dallo stesso dominio
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            
            // 4. Gestione sessione (Stateless per JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 5. Autorizzazioni rotte
            .authorizeHttpRequests(auth -> auth
                // Permetti le chiamate preflight OPTIONS (fondamentali per il CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                
                // Login e Registrazione aperti a tutti
                .requestMatchers("/api/auth/**").permitAll()
                
                // Lettura articoli aperta a tutti (anche non loggati)
                .requestMatchers(HttpMethod.GET, "/api/pagine/**").permitAll()
                
                // Permessi specifici per EDITORE (Salvataggio, Modifica, Eliminazione, Profilo)
                .requestMatchers("/api/pagine/**").hasRole("EDITORE")
                .requestMatchers("/api/profilo/**").hasRole("EDITORE")
                
                // Tutto il resto richiede autenticazione
                .anyRequest().authenticated()
            )
            
            // 6. Inserisci il filtro JWT prima di quello standard di Spring
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173") // Porta Vite
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}