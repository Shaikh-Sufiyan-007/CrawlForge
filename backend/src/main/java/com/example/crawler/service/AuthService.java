package com.example.crawler.service;

import com.example.crawler.dto.AuthResponse;
import com.example.crawler.dto.LoginRequest;
import com.example.crawler.dto.SignupRequest;
import com.example.crawler.entity.User;
import com.example.crawler.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String REDIS_TOKEN_PREFIX = "auth:token:";
    private static final Duration SESSION_TTL = Duration.ofHours(24);
    private static final int ITERATIONS = 10000;
    private static final int KEY_LENGTH = 256;

    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    // In-memory fallback token cache to ensure high availability
    private final Map<String, TokenSession> localTokenCache = new ConcurrentHashMap<>();

    public static class TokenSession {
        private final Long userId;
        private final String username;
        private final String role;
        private final long expiresAt;

        public TokenSession(Long userId, String username, String role, long expiresAt) {
            this.userId = userId;
            this.username = username;
            this.role = role;
            this.expiresAt = expiresAt;
        }

        public Long getUserId() {
            return userId;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    public AuthService(UserRepository userRepository, StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void initDefaultUser() {
        try {
            if (userRepository.count() == 0) {
                log.info("No users found in database. Initializing default admin user...");
                User defaultAdmin = new User();
                defaultAdmin.setUsername("admin");
                defaultAdmin.setEmail("admin@crawlforge.dev");
                defaultAdmin.setPassword(hashPassword("admin123"));
                defaultAdmin.setRole("ROLE_ADMIN");
                userRepository.save(defaultAdmin);
                log.info("Default admin user created successfully (username: admin)");
            }
        } catch (Exception e) {
            log.warn("Could not seed default user into database: {}", e.getMessage());
        }
    }

    
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        String password = request.getPassword();

        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!verifyPassword(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = "cf_" + UUID.randomUUID().toString().replace("-", "") + "_" + System.currentTimeMillis();

        try {
            if (redisTemplate != null) {
                String tokenKey = REDIS_TOKEN_PREFIX + token;
                String sessionData = user.getId() + ":" + user.getUsername() + ":" + user.getRole();
                redisTemplate.opsForValue().set(tokenKey, sessionData, SESSION_TTL);
            }
        } catch (Exception e) {
            log.warn("Failed to write token to Redis, falling back to in-memory store: {}", e.getMessage());
        }

        long expiresAt = System.currentTimeMillis() + SESSION_TTL.toMillis();
        localTokenCache.put(token, new TokenSession(user.getId(), user.getUsername(), user.getRole(), expiresAt));

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Login successful"
        );
    }


    public AuthResponse signup(SignupRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(hashPassword(request.getPassword()));
        newUser.setRole("ROLE_USER");
        userRepository.save(newUser);

        log.info("New user registered successfully: {}", username);

        String token = "cf_" + UUID.randomUUID().toString().replace("-", "") + "_" + System.currentTimeMillis();

        try {
            if (redisTemplate != null) {
                String tokenKey = REDIS_TOKEN_PREFIX + token;
                String sessionData = newUser.getId() + ":" + newUser.getUsername() + ":" + newUser.getRole();
                redisTemplate.opsForValue().set(tokenKey, sessionData, SESSION_TTL);
            }
        } catch (Exception e) {
            log.warn("Failed to write token to Redis for new user, falling back to in-memory store: {}", e.getMessage());
        }

        long expiresAt = System.currentTimeMillis() + SESSION_TTL.toMillis();
        localTokenCache.put(token, new TokenSession(newUser.getId(), newUser.getUsername(), newUser.getRole(), expiresAt));

        return new AuthResponse(
                token,
                newUser.getId(),
                newUser.getUsername(),
                newUser.getEmail(),
                newUser.getRole(),
                "Registration successful"
        );
    }


    public void logout(String rawToken) {
        String token = extractToken(rawToken);
        if (token == null || token.isEmpty()) {
            return;
        }

        try {
            if (redisTemplate != null) {
                redisTemplate.delete(REDIS_TOKEN_PREFIX + token);
            }
        } catch (Exception e) {
            log.warn("Failed to delete token from Redis: {}", e.getMessage());
        }

        localTokenCache.remove(token);
    }


    public Optional<User> validateToken(String rawToken) {
        String token = extractToken(rawToken);
        if (token == null || token.isEmpty()) {
            return Optional.empty();
        }

        String username = null;

        try {
            if (redisTemplate != null) {
                String sessionData = redisTemplate.opsForValue().get(REDIS_TOKEN_PREFIX + token);
                if (sessionData != null && !sessionData.isEmpty()) {
                    String[] parts = sessionData.split(":");
                    if (parts.length >= 2) {
                        username = parts[1];
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Redis token lookup failed, falling back to local cache: {}", e.getMessage());
        }

        if (username == null) {
            TokenSession session = localTokenCache.get(token);
            if (session != null) {
                if (session.isExpired()) {
                    localTokenCache.remove(token);
                    return Optional.empty();
                }
                username = session.getUsername();
            }
        }

        if (username != null) {
            return userRepository.findByUsername(username);
        }

        return Optional.empty();
    }

    private String extractToken(String rawToken) {
        if (rawToken == null) {
            return null;
        }
        String clean = rawToken.trim();
        if (clean.toLowerCase().startsWith("bearer ")) {
            clean = clean.substring(7).trim();
        }
        return clean;
    }

    public String hashPassword(String password) {
        try {
            byte[] salt = new byte[16];
            SecureRandom.getInstanceStrong().nextBytes(salt);

            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();

            HexFormat hex = HexFormat.of();
            return hex.formatHex(salt) + ":" + hex.formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public boolean verifyPassword(String candidatePassword, String storedHash) {
        if (storedHash == null || !storedHash.contains(":")) {
            return false;
        }
        try {
            String[] parts = storedHash.split(":");
            if (parts.length != 2) {
                return false;
            }
            HexFormat hex = HexFormat.of();
            byte[] salt = hex.parseHex(parts[0]);
            byte[] expectedHash = hex.parseHex(parts[1]);

            PBEKeySpec spec = new PBEKeySpec(candidatePassword.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] actualHash = skf.generateSecret(spec).getEncoded();

            int diff = expectedHash.length ^ actualHash.length;
            for (int i = 0; i < expectedHash.length && i < actualHash.length; i++) {
                diff |= expectedHash[i] ^ actualHash[i];
            }
            return diff == 0;
        } catch (Exception e) {
            return false;
        }
    }
}
