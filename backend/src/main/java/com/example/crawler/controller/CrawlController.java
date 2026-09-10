package com.example.crawler.controller;

import com.example.crawler.dto.CrawlProgressResponse;
import com.example.crawler.dto.CrawlRequest;
import com.example.crawler.dto.CrawlResponse;
import com.example.crawler.dto.GraphResponse;
import com.example.crawler.service.CrawlService;
import com.example.crawler.service.GraphService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crawls")
public class CrawlController {

    private final CrawlService crawlService;
    private final GraphService graphService;

    public CrawlController(CrawlService crawlService, GraphService graphService) {
        this.crawlService = crawlService;
        this.graphService = graphService;
    }

    /**
     * Start Crawl
     * POST /api/crawls
     */
    @PostMapping
    public ResponseEntity<CrawlResponse> startCrawl(@Valid @RequestBody CrawlRequest request) {
        CrawlResponse response = crawlService.startCrawl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get Previous Crawls
     * GET /api/crawls
     */
    @GetMapping
    public ResponseEntity<List<CrawlResponse>> getAllCrawls() {
        return ResponseEntity.ok(crawlService.getAllCrawls());
    }

    /**
     * Get Crawl by ID
     * GET /api/crawls/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CrawlResponse> getCrawl(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.getCrawl(id));
    }

    /**
     * Get Crawl Progress
     * GET /api/crawls/{id}/progress
     */
    @GetMapping("/{id}/progress")
    public ResponseEntity<CrawlProgressResponse> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.getProgress(id));
    }

    /**
     * Stop Crawl
     * POST /api/crawls/{id}/stop
     */
    @PostMapping("/{id}/stop")
    public ResponseEntity<CrawlResponse> stopCrawl(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.stopCrawl(id));
    }

    /**
     * Get Site Graph
     * GET /api/crawls/{id}/graph
     */
    @GetMapping("/{id}/graph")
    public ResponseEntity<GraphResponse> getGraph(@PathVariable Long id) {
        return ResponseEntity.ok(graphService.getGraph(id));
    }
}
