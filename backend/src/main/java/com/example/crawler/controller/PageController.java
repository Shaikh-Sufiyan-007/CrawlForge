package com.example.crawler.controller;

import com.example.crawler.entity.Page;
import com.example.crawler.repository.PageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crawls/{crawlId}/pages")
public class PageController {

    private final PageRepository pageRepository;

    public PageController(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    /**
     * Get Crawled Pages for a specific crawl
     * GET /api/crawls/{crawlId}/pages
     */
    @GetMapping
    public ResponseEntity<List<Page>> getPages(@PathVariable Long crawlId) {
        List<Page> pages = pageRepository.findByCrawlIdOrderByCreatedAtAsc(crawlId);
        return ResponseEntity.ok(pages);
    }
}
