package com.example.crawler.controller;

import com.example.crawler.entity.Page;
import com.example.crawler.repository.PageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crawls/{crawlId}/pages")
public class PageController {

    private final PageRepository pageRepository;

    public PageController(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Page>> getPages(
            @PathVariable Long crawlId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null && size > 0) {
            Pageable pageable = PageRequest.of(Math.max(0, page), size);
            org.springframework.data.domain.Page<Page> pageResult = pageRepository
                    .findByCrawlIdOrderByCreatedAtAsc(crawlId, pageable);

            return ResponseEntity.ok()
                    .header("X-Total-Count", String.valueOf(pageResult.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(pageResult.getTotalPages()))
                    .body(pageResult.getContent());
        }

        List<Page> pages = pageRepository.findByCrawlIdOrderByCreatedAtAsc(crawlId);
        return ResponseEntity.ok(pages);
    }
}
