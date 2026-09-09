package com.example.crawler.dto;

import com.example.crawler.entity.Crawl;

import java.time.LocalDateTime;

public class CrawlResponse {

    private Long crawlId;
    private Long id;
    private String startUrl;
    private String status;
    private Integer maxPages;
    private Integer pagesCrawled;
    private Integer pagesFailed;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public CrawlResponse() {
    }

    public CrawlResponse(Long crawlId, String status) {
        this.crawlId = crawlId;
        this.id = crawlId;
        this.status = status;
    }

    public static CrawlResponse fromEntity(Crawl crawl) {
        CrawlResponse response = new CrawlResponse();
        response.setCrawlId(crawl.getId());
        response.setId(crawl.getId());
        response.setStartUrl(crawl.getStartUrl());
        response.setStatus(crawl.getStatus());
        response.setMaxPages(crawl.getMaxPages());
        response.setPagesCrawled(crawl.getPagesCrawled());
        response.setPagesFailed(crawl.getPagesFailed());
        response.setCreatedAt(crawl.getCreatedAt());
        response.setCompletedAt(crawl.getCompletedAt());
        
        return response;
    }

    public Long getCrawlId() {
        return crawlId;
    }

    public void setCrawlId(Long crawlId) {
        this.crawlId = crawlId;
        this.id = crawlId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
        this.crawlId = id;
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
