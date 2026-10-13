package com.example.crawler.controller;

import com.example.crawler.dto.AuthResponse;
import com.example.crawler.dto.AuthStatusResponse;
import com.example.crawler.dto.LoginRequest;
import com.example.crawler.dto.SignupRequest;
import com.example.crawler.entity.User;
import com.example.crawler.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Auth-Token", required = false) String tokenHeader) {
        String token = authHeader != null ? authHeader : tokenHeader;
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }


    @GetMapping("/me")
    public ResponseEntity<AuthStatusResponse> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Auth-Token", required = false) String tokenHeader) {
        String token = authHeader != null ? authHeader : tokenHeader;
        Optional<User> userOpt = authService.validateToken(token);

        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized or session expired");
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new AuthStatusResponse(true, user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    @GetMapping("/status")
    public ResponseEntity<AuthStatusResponse> checkStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Auth-Token", required = false) String tokenHeader) {
        String token = authHeader != null ? authHeader : tokenHeader;
        Optional<User> userOpt = authService.validateToken(token);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(new AuthStatusResponse(true, user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
        }

        return ResponseEntity.ok(new AuthStatusResponse(false));
    }
}
