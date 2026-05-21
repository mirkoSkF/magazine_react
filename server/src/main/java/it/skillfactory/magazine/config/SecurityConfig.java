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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()

                // --- DASHBOARD E PROFILO (RICHIESTA AUTENTICAZIONE) ---
                .requestMatchers("/api/stats/**", "/api/statistiche/**").authenticated()
                .requestMatchers("/api/profilo/**").authenticated()
                .requestMatchers("/api/pagine/mie").authenticated()
                
                // Scrittura e gestione editoriale protette da autenticazione
                .requestMatchers(HttpMethod.POST, "/api/pagine").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/pagine/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/pagine/*").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/pagine/*/pubblica").authenticated()

                // --- GESTIONE CALENDARIO ED EVENTI (GET resa pubblica) ---
                .requestMatchers(HttpMethod.GET, "/api/eventi").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/eventi").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/eventi/*").authenticated()

                // --- GESTIONE INTERVISTE ---
                .requestMatchers(HttpMethod.POST, "/api/interviste/prenota").permitAll()
                .requestMatchers("/api/interviste/elenco").authenticated()
                .requestMatchers("/api/interviste/*").authenticated()

                // --- AGGIUNTO: ROTTA PUBBLICA PER CONDIVISIONE SOCIAL (CRAWLER) ---
                .requestMatchers(HttpMethod.GET, "/api/pagine/share/*").permitAll()

                // --- PUBBLICI ---
                .requestMatchers(HttpMethod.GET, "/api/pagine/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/pagine/*/view").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/pagine/*/vota").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/sponsors/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/api/sponsors/*/click").permitAll()

                .anyRequest().authenticated()
                )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:[*]", "http://127.0.0.1:[*]"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
