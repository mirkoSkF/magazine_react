package it.skillfactory.magazine.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // Utilizza il bean corsConfigurationSource definito sotto
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Pre-flight OPTIONS permesse a tutti per il protocollo CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Rotte pubbliche di autenticazione
                .requestMatchers("/api/auth/**").permitAll()
                
                // Permessi lettura pubblica Articoli e Sondaggi
                .requestMatchers(HttpMethod.GET, "/api/pagine/**").permitAll() 
                .requestMatchers(HttpMethod.PUT, "/api/pagine/*/view").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/pagine/*/vota").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/pagine/*/stats").permitAll()
                
                // --- GESTIONE SPONSOR (PUBBLICI) ---
                .requestMatchers(HttpMethod.GET, "/api/sponsors/random").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/sponsors").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/api/sponsors/*/click").permitAll()
                
                // --- GESTIONE INTERVISTE ---
                .requestMatchers(HttpMethod.POST, "/api/interviste/prenota").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/interviste/elenco").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/interviste/*").authenticated()
                
                // Qualsiasi altra richiesta richiede login
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Risoluzione errore 403: allowedOriginPatterns permette l'uso di allowCredentials(true)
        // Accetta localhost su qualsiasi porta (es. 5173 di Vite o 3000 di React)
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:[*]",
                "http://127.0.0.1:[*]"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Specifichiamo gli header comuni per evitare blocchi
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Requested-With"));
        
        // Permette l'invio di Token JWT e Cookie
        configuration.setAllowCredentials(true);
        
        // Cache della risposta CORS (evita troppe richieste OPTIONS)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder(); 
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}