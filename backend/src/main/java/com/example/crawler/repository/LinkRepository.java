package com.example.crawler.repository;

import com.example.crawler.entity.Link;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {

    List<Link> findByCrawlId(Long crawlId);

    long countByCrawlId(Long crawlId);

    boolean existsByCrawlIdAndSourcePageIdAndTargetUrl(Long crawlId, Long sourcePageId, String targetUrl);
}
