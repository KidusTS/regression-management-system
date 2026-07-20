package com.regression.auth.controller;

import com.regression.auth.dto.AuthResponse;
import com.regression.auth.dto.LoginRequest;
import com.regression.auth.dto.RegisterRequest;
import com.regression.auth.service.AuthService;
import com.regression.common.response.ApiResponse;
import com.regression.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.register(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(new Object() {
            public final String id = user.getId().toString();
            public final String email = user.getEmail();
            public final String firstName = user.getFirstName();
            public final String lastName = user.getLastName();
        }));
    }
}
