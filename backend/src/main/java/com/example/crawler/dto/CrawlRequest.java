package com.example.crawler.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

public class CrawlRequest {

    @NotBlank(message = "URL cannot be empty")
    @URL(message = "Please provide a valid URL with http or https")
    private String url;

    private Integer maxPages = 100;

    public CrawlRequest() {
    }

    public CrawlRequest(String url, Integer maxPages) {
        this.url = url;
        this.maxPages = maxPages;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getMaxPages() {
        return maxPages;
    }

    public void setMaxPages(Integer maxPages) {
        this.maxPages = maxPages;
    }
}
