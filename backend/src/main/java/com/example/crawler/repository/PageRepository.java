package com.example.crawler.repository;

import com.example.crawler.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    List<Page> findByCrawlIdOrderByCreatedAtAsc(Long crawlId);

    Optional<Page> findByCrawlIdAndUrl(Long crawlId, String url);

    long countByCrawlId(Long crawlId);

    boolean existsByCrawlIdAndUrl(Long crawlId, String url);
}
