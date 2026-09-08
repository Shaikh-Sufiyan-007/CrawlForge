package com.example.crawler.repository;

import com.example.crawler.entity.Crawl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrawlRepository extends JpaRepository<Crawl, Long> {

    List<Crawl> findAllByOrderByCreatedAtDesc();
}
