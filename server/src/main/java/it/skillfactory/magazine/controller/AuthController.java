package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.config.JwtUtils;
import it.skillfactory.magazine.model.JwtResponse;
import it.skillfactory.magazine.model.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public JwtResponse login(@RequestBody LoginRequest loginRequest) {
        // 1. Verifica le credenziali
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        // 2. Se corrette, genera il token
        String jwt = jwtUtils.generaToken(authentication.getName());
        
        // 3. Recupera il ruolo (il primo disponibile)
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        return new JwtResponse(jwt, authentication.getName(), role);
    }
}