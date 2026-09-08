package com.example.crawler.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "links", indexes = {
        @Index(name = "idx_link_crawl_id", columnList = "crawlId"),
        @Index(name = "idx_link_source_page", columnList = "sourcePageId")
})
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long crawlId;

    @Column(nullable = false)
    private Long sourcePageId;

    @Column(nullable = false, length = 2048)
    private String targetUrl;

    @Column(nullable = false)
    private Boolean internal = true;

    public Link() {
    }

    public Link(Long crawlId, Long sourcePageId, String targetUrl, Boolean internal) {
        this.crawlId = crawlId;
        this.sourcePageId = sourcePageId;
        this.targetUrl = targetUrl;
        this.internal = internal != null ? internal : true;
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

    public Long getSourcePageId() {
        return sourcePageId;
    }

    public void setSourcePageId(Long sourcePageId) {
        this.sourcePageId = sourcePageId;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public Boolean getInternal() {
        return internal;
    }

    public void setInternal(Boolean internal) {
        this.internal = internal;
    }
}
