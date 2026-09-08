package com.example.crawler.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pages", indexes = {
        @Index(name = "idx_page_crawl_id", columnList = "crawlId"),
        @Index(name = "idx_page_crawl_url", columnList = "crawlId, url")
})
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long crawlId;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(length = 1024)
    private String title;

    private Integer statusCode;

    @Column(nullable = false)
    private Integer depth = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Page() {
    }

    public Page(Long crawlId, String url, String title, Integer statusCode, Integer depth) {
        this.crawlId = crawlId;
        this.url = url;
        this.title = title;
        this.statusCode = statusCode;
        this.depth = depth != null ? depth : 0;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.depth == null) {
            this.depth = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCrawlId() {
        return crawlId;
    }

    public void setCrawlId(Long crawlId) {
        this.crawlId = crawlId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
        this.depth = depth;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
