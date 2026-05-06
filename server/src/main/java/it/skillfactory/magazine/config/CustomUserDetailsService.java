package it.skillfactory.magazine.config;

import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UtenteRepository repository;

    public CustomUserDetailsService(UtenteRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utente u = repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato"));

        return User.builder()
                .username(u.getUsername())
                .password(u.getPassword())
                .authorities(u.getRuolo()) // Carica ROLE_EDITORE
                .build();
    }
}