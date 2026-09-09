package com.example.crawler.dto;

public class CrawlProgressResponse {

    private Long crawlId;
    private String status;
    private long pagesCrawled;
    private long pagesPending;
    private long pagesFailed;
    private int maxPages;
    private String currentUrl;

    public CrawlProgressResponse() {
    }

    public CrawlProgressResponse(Long crawlId, String status, long pagesCrawled, long pagesPending, long pagesFailed, int maxPages, String currentUrl) {
        this.crawlId = crawlId;
        this.status = status;
        this.pagesCrawled = pagesCrawled;
        this.pagesPending = pagesPending;
        this.pagesFailed = pagesFailed;
        this.maxPages = maxPages;
        this.currentUrl = currentUrl;
    }

    public Long getCrawlId() {
        return crawlId;
    }

    public void setCrawlId(Long crawlId) {
        this.crawlId = crawlId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getPagesCrawled() {
        return pagesCrawled;
    }

    public void setPagesCrawled(long pagesCrawled) {
        this.pagesCrawled = pagesCrawled;
    }

    public long getPagesPending() {
        return pagesPending;
    }

    public void setPagesPending(long pagesPending) {
        this.pagesPending = pagesPending;
    }

    public long getPagesFailed() {
        return pagesFailed;
    }

    public void setPagesFailed(long pagesFailed) {
        this.pagesFailed = pagesFailed;
    }

    public int getMaxPages() {
        return maxPages;
    }

    public void setMaxPages(int maxPages) {
        this.maxPages = maxPages;
    }

    public String getCurrentUrl() {
        return currentUrl;
    }

    public void setCurrentUrl(String currentUrl) {
        this.currentUrl = currentUrl;
    }
}
