package com.example.crawler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crawls")
public class Crawl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048)
    private String startUrl;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(nullable = false)
    private Integer maxPages = 100;

    @Column(nullable = false)
    private Integer pagesCrawled = 0;

    @Column(nullable = false)
    private Integer pagesFailed = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public Crawl() {
    }

    public Crawl(String startUrl, Integer maxPages) {
        this.startUrl = startUrl;
        this.maxPages = maxPages != null && maxPages > 0 ? maxPages : 100;
        this.status = "STARTED";
        this.pagesCrawled = 0;
        this.pagesFailed = 0;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "STARTED";
        }
        if (this.pagesCrawled == null) {
            this.pagesCrawled = 0;
        }
        if (this.pagesFailed == null) {
            this.pagesFailed = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStartUrl() {
        return startUrl;
    }

    public void setStartUrl(String startUrl) {
        this.startUrl = startUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getMaxPages() {
        return maxPages;
    }

    public void setMaxPages(Integer maxPages) {
        this.maxPages = maxPages;
    }

    public Integer getPagesCrawled() {
        return pagesCrawled;
    }

    public void setPagesCrawled(Integer pagesCrawled) {
        this.pagesCrawled = pagesCrawled;
    }

    public Integer getPagesFailed() {
        return pagesFailed;
    }

    public void setPagesFailed(Integer pagesFailed) {
        this.pagesFailed = pagesFailed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
