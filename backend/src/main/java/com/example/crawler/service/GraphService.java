package com.example.crawler.service;

import com.example.crawler.dto.GraphResponse;
import com.example.crawler.entity.Link;
import com.example.crawler.entity.Page;
import com.example.crawler.repository.LinkRepository;
import com.example.crawler.repository.PageRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphService {

    private final PageRepository pageRepository;
    private final LinkRepository linkRepository;

    public GraphService(PageRepository pageRepository, LinkRepository linkRepository) {
        this.pageRepository = pageRepository;
        this.linkRepository = linkRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "graph", key = "#crawlId")
    public GraphResponse getGraph(Long crawlId) {
        List<Page> pages = pageRepository.findByCrawlIdOrderByCreatedAtAsc(crawlId);
        List<Link> links = linkRepository.findByCrawlId(crawlId);

        Map<Long, Page> pageIdMap = pages.stream()
                .collect(Collectors.toMap(Page::getId, p -> p, (p1, p2) -> p1));

        Set<String> existingNodeUrls = new HashSet<>();
        List<GraphResponse.NodeDto> nodes = new ArrayList<>();

        for (Page page : pages) {
            String label = page.getTitle();
            if (label == null || label.isBlank()) {
                label = page.getUrl();
            }
            nodes.add(new GraphResponse.NodeDto(page.getUrl(), label, page.getStatusCode(), page.getDepth()));
            existingNodeUrls.add(page.getUrl());
        }

        List<GraphResponse.EdgeDto> edges = new ArrayList<>();
        Set<String> edgeSignatures = new HashSet<>();

        for (Link link : links) {
            Page sourcePage = pageIdMap.get(link.getSourcePageId());
            if (sourcePage == null) {
                continue;
            }

            String sourceUrl = sourcePage.getUrl();
            String targetUrl = link.getTargetUrl();

            // React Flow requires both source and target nodes to exist on the canvas.
            if (!existingNodeUrls.contains(targetUrl)) {
                String label = targetUrl.replaceFirst("https?://[^/]+", "");
                if (label.isBlank() || label.equals("/")) {
                    label = targetUrl;
                }
                nodes.add(new GraphResponse.NodeDto(targetUrl, label, 0,
                        (sourcePage.getDepth() != null ? sourcePage.getDepth() + 1 : 1)));
                existingNodeUrls.add(targetUrl);
            }

            String edgeSignature = sourceUrl + " -> " + targetUrl;
            if (edgeSignatures.add(edgeSignature)) {
                String edgeId = "e-" + edges.size() + "-" + Math.abs(edgeSignature.hashCode());
                edges.add(new GraphResponse.EdgeDto(edgeId, sourceUrl, targetUrl, link.getInternal()));
            }
        }

        return new GraphResponse(nodes, edges);
    }
}
