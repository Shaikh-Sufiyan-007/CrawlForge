package com.example.crawler.service;

import com.example.crawler.dto.CrawlProgressResponse;
import com.example.crawler.dto.CrawlRequest;
import com.example.crawler.dto.CrawlResponse;
import com.example.crawler.entity.Crawl;
import com.example.crawler.repository.CrawlRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CrawlService {

    private static final Logger log = LoggerFactory.getLogger(CrawlService.class);

    private final CrawlRepository crawlRepository;
    private final CrawlerService crawlerService;
    private final StringRedisTemplate redisTemplate;

    public CrawlService(CrawlRepository crawlRepository,
                        CrawlerService crawlerService,
                        StringRedisTemplate redisTemplate) {
        this.crawlRepository = crawlRepository;
        this.crawlerService = crawlerService;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Creates a new crawl job and triggers background asynchronous crawling.
     * Does NOT block the main HTTP request thread.
     */
    public CrawlResponse startCrawl(CrawlRequest request) {
        String normalizedUrl = CrawlerService.normalizeUrl(request.getUrl());
        if (normalizedUrl == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid URL format. Please provide an http or https URL.");
        }

        int maxPages = request.getMaxPages() != null && request.getMaxPages() > 0 ? request.getMaxPages() : 100;

        Crawl crawl = new Crawl(normalizedUrl, maxPages);
        crawl = crawlRepository.save(crawl);

        // Trigger background crawling asynchronously
        crawlerService.executeCrawl(crawl.getId(), normalizedUrl, maxPages);

        log.info("Crawl job created with id: {} for url: {}", crawl.getId(), normalizedUrl);
        return new CrawlResponse(crawl.getId(), "STARTED");
    }

    /**
     * Retrieves a single crawl by its ID.
     */
    public CrawlResponse getCrawl(Long id) {
        Crawl crawl = crawlRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crawl not found with id: " + id));
        return CrawlResponse.fromEntity(crawl);
    }

    /**
     * Retrieves all crawls ordered by creation date descending.
     */
    public List<CrawlResponse> getAllCrawls() {
        return crawlRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CrawlResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets real-time crawl progress from Redis (falling back to database when completed).
     */
    public CrawlProgressResponse getProgress(Long id) {
        Crawl crawl = crawlRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crawl not found with id: " + id));

        String stateKey = "crawl:" + id + ":state";
        String crawledKey = "crawl:" + id + ":crawled";
        String failedKey = "crawl:" + id + ":failed";
        String queueKey = "crawl:" + id + ":queue";
        String currentUrlKey = "crawl:" + id + ":current_url";

        String redisState = redisTemplate.opsForValue().get(stateKey);
        String status = redisState != null ? redisState : crawl.getStatus();

        long pagesCrawled;
        long pagesFailed;
        long pagesPending = 0;
        String currentUrl = redisTemplate.opsForValue().get(currentUrlKey);

        if (redisState != null) {
            String crawledStr = redisTemplate.opsForValue().get(crawledKey);
            String failedStr = redisTemplate.opsForValue().get(failedKey);
            Long queueSize = redisTemplate.opsForList().size(queueKey);

            pagesCrawled = crawledStr != null ? Long.parseLong(crawledStr) : crawl.getPagesCrawled();
            pagesFailed = failedStr != null ? Long.parseLong(failedStr) : crawl.getPagesFailed();
            pagesPending = queueSize != null ? queueSize : 0;
        } else {
            // Redis keys expired or crawl completed; read from DB
            pagesCrawled = crawl.getPagesCrawled();
            pagesFailed = crawl.getPagesFailed();
            pagesPending = 0;
            currentUrl = crawl.getStartUrl();
        }

        return new CrawlProgressResponse(
                id,
                status,
                pagesCrawled,
                pagesPending,
                pagesFailed,
                crawl.getMaxPages(),
                currentUrl != null ? currentUrl : crawl.getStartUrl()
        );
    }

    /**
     * Signals the asynchronous crawler to stop crawling.
     */
    public CrawlResponse stopCrawl(Long id) {
        Crawl crawl = crawlRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crawl not found with id: " + id));

        String stopKey = "crawl:" + id + ":stop";
        String stateKey = "crawl:" + id + ":state";

        redisTemplate.opsForValue().set(stopKey, "1");
        redisTemplate.opsForValue().set(stateKey, "STOPPED");

        if ("STARTED".equals(crawl.getStatus()) || "RUNNING".equals(crawl.getStatus())) {
            crawl.setStatus("STOPPED");
            crawlRepository.save(crawl);
        }

        log.info("Stop signal dispatched for crawl id: {}", id);
        return CrawlResponse.fromEntity(crawl);
    }
}
