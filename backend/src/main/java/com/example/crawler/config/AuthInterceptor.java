package com.example.crawler.config;

import com.example.crawler.entity.User;
import com.example.crawler.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String tokenHeader = request.getHeader("X-Auth-Token");
        String rawToken = authHeader != null ? authHeader : tokenHeader;

        if (rawToken == null || rawToken.trim().isEmpty()) {
            sendUnauthorizedResponse(response, "Authentication required. Please provide a valid token.");
            return false;
        }

        Optional<User> userOpt = authService.validateToken(rawToken);
        if (userOpt.isEmpty()) {
            sendUnauthorizedResponse(response, "Invalid or expired session. Please log in again.");
            return false;
        }

        request.setAttribute("authenticatedUser", userOpt.get());
        return true;
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":401,\"error\":\"" + message + "\"}");
    }
}
