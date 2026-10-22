package com.example.crawler.controller;

import com.example.crawler.dto.CrawlProgressResponse;
import com.example.crawler.dto.CrawlRequest;
import com.example.crawler.dto.CrawlResponse;
import com.example.crawler.dto.GraphResponse;
import com.example.crawler.entity.Crawl;
import com.example.crawler.repository.CrawlRepository;
import com.example.crawler.service.CrawlService;
import com.example.crawler.service.GraphService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crawls")
public class CrawlController {

    private final CrawlService crawlService;
    private final GraphService graphService;
    private final CrawlRepository crawlRepository;

    public CrawlController(CrawlService crawlService, GraphService graphService, CrawlRepository crawlRepository) {
        this.crawlService = crawlService;
        this.graphService = graphService;
        this.crawlRepository = crawlRepository;
    }

    @PostMapping
    public ResponseEntity<CrawlResponse> startCrawl(@Valid @RequestBody CrawlRequest request) {
        CrawlResponse response = crawlService.startCrawl(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<CrawlResponse>> getAllCrawls(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null && size > 0) {
            Pageable pageable = PageRequest.of(Math.max(0, page), size);
            Page<Crawl> paged = crawlRepository.findAllByOrderByCreatedAtDesc(pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Count", String.valueOf(paged.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(paged.getTotalPages()))
                    .body(paged.stream().map(CrawlResponse::fromEntity).collect(Collectors.toList()));
        }

        return ResponseEntity.ok(crawlService.getAllCrawls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrawlResponse> getCrawl(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.getCrawl(id));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<CrawlProgressResponse> getProgress(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.getProgress(id));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<CrawlResponse> stopCrawl(@PathVariable Long id) {
        return ResponseEntity.ok(crawlService.stopCrawl(id));
    }

    @GetMapping("/{id}/graph")
    public ResponseEntity<GraphResponse> getGraph(@PathVariable Long id) {
        return ResponseEntity.ok(graphService.getGraph(id));
    }
}
