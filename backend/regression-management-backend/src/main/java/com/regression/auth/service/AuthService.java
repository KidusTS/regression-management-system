package com.regression.auth.service;

import com.regression.auth.dto.AuthResponse;
import com.regression.auth.dto.LoginRequest;
import com.regression.auth.dto.RegisterRequest;
import com.regression.common.exception.ImportException;
import com.regression.security.JwtService;
import com.regression.user.entity.Role;
import com.regression.user.entity.User;
import com.regression.user.repository.RoleRepository;
import com.regression.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /** Optional: the account registering with this email is granted ADMIN (bootstraps the first admin). */
    @Value("${app.admin-email:}")
    private String adminEmail;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ImportException("Email already in use");
        }
        boolean isBootstrapAdmin = !adminEmail.isBlank() && adminEmail.equalsIgnoreCase(request.getEmail());
        String roleName = isBootstrapAdmin ? "ADMIN" : "QA_ENGINEER";
        Role defaultRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRoles(Set.of(defaultRole));
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    private AuthResponse toResponse(String token, User user) {
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), roles);
    }
}
