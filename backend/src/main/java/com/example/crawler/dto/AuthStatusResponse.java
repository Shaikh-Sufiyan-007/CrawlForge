package com.example.crawler.dto;

public class AuthStatusResponse {

    private boolean authenticated;
    private Long id;
    private String username;
    private String email;
    private String role;

    public AuthStatusResponse() {
    }

    public AuthStatusResponse(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public AuthStatusResponse(boolean authenticated, Long id, String username, String email, String role) {
        this.authenticated = authenticated;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
