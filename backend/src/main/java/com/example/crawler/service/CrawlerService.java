package com.example.crawler.service;

import com.example.crawler.entity.Crawl;
import com.example.crawler.entity.Link;
import com.example.crawler.entity.Page;
import com.example.crawler.repository.CrawlRepository;
import com.example.crawler.repository.LinkRepository;
import com.example.crawler.repository.PageRepository;
import org.jsoup.Connection;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class CrawlerService {

    private static final Logger log = LoggerFactory.getLogger(CrawlerService.class);

    private static final Set<String> IGNORED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp",
            ".css", ".js", ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
            ".mp4", ".webm", ".mp3", ".wav", ".ogg", ".avi", ".mov",
            ".woff", ".woff2", ".ttf", ".eot", ".otf",
            ".xml", ".json", ".rss", ".atom", ".exe", ".bin", ".dmg"
    );

    private final CrawlRepository crawlRepository;
    private final PageRepository pageRepository;
    private final LinkRepository linkRepository;
    private final StringRedisTemplate redisTemplate;

    @Value("${crawler.user-agent:CrawlForge/1.0 (+https://github.com/crawler)}")
    private String userAgent;

    @Value("${crawler.connection-timeout-ms:5000}")
    private int timeoutMs;

    public CrawlerService(CrawlRepository crawlRepository,
                          PageRepository pageRepository,
                          LinkRepository linkRepository,
                          StringRedisTemplate redisTemplate) {
        this.crawlRepository = crawlRepository;
        this.pageRepository = pageRepository;
        this.linkRepository = linkRepository;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Executes the web crawl asynchronously on a background thread pool.
     * Interacts with Redis for queue, visited set, and live progress,
     * and persists permanent data to PostgreSQL.
     */
    @Async("crawlerTaskExecutor")
    public void executeCrawl(Long crawlId, String startUrl, int maxPages) {
        log.info("Starting asynchronous crawl [{}] for URL: {} (maxPages: {})", crawlId, startUrl, maxPages);

        String queueKey = "crawl:" + crawlId + ":queue";
        String visitedKey = "crawl:" + crawlId + ":visited";
        String stateKey = "crawl:" + crawlId + ":state";
        String crawledKey = "crawl:" + crawlId + ":crawled";
        String failedKey = "crawl:" + crawlId + ":failed";
        String currentUrlKey = "crawl:" + crawlId + ":current_url";
        String stopKey = "crawl:" + crawlId + ":stop";

        // Initialize Redis state
        redisTemplate.opsForValue().set(stateKey, "RUNNING");
        redisTemplate.opsForValue().set(crawledKey, "0");
        redisTemplate.opsForValue().set(failedKey, "0");
        redisTemplate.opsForValue().set(currentUrlKey, startUrl);

        // Update database crawl status
        Optional<Crawl> crawlOpt = crawlRepository.findById(crawlId);
        if (crawlOpt.isEmpty()) {
            log.error("Crawl record [{}] not found", crawlId);
            return;
        }
        Crawl crawl = crawlOpt.get();
        crawl.setStatus("RUNNING");
        crawlRepository.save(crawl);

        String targetDomain = extractDomain(startUrl);
        if (targetDomain == null) {
            log.error("Invalid start URL domain: {}", startUrl);
            finalizeCrawl(crawl, "FAILED", 0, 1, stateKey);
            return;
        }

        // Normalize start URL and push to queue: format is "url|||depth"
        String normalizedStartUrl = normalizeUrl(startUrl);
        redisTemplate.opsForSet().add(visitedKey, normalizedStartUrl);
        redisTemplate.opsForList().rightPush(queueKey, normalizedStartUrl + "|||0");

        int pagesCrawled = 0;
        int pagesFailed = 0;
        String finalStatus = "COMPLETED";

        try {
            while (pagesCrawled < maxPages) {
                // Check if user requested stop
                Boolean isStopped = redisTemplate.hasKey(stopKey);
                if (Boolean.TRUE.equals(isStopped)) {
                    log.info("Crawl [{}] received stop request.", crawlId);
                    finalStatus = "STOPPED";
                    break;
                }

                // Dequeue next URL
                String queueItem = redisTemplate.opsForList().leftPop(queueKey);
                if (queueItem == null) {
                    log.info("Queue is empty for crawl [{}]. Finished crawl.", crawlId);
                    break;
                }

                String[] parts = queueItem.split("\\|\\|\\|");
                String currentUrl = parts[0];
                int currentDepth = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;

                redisTemplate.opsForValue().set(currentUrlKey, currentUrl);

                // Process page
                PageProcessResult result = processPage(crawlId, currentUrl, currentDepth, targetDomain, queueKey, visitedKey, maxPages);
                if (result.isSuccess()) {
                    pagesCrawled++;
                    redisTemplate.opsForValue().increment(crawledKey);
                } else {
                    pagesFailed++;
                    redisTemplate.opsForValue().increment(failedKey);
                }

                // Periodically update database count every 5 pages
                if ((pagesCrawled + pagesFailed) % 5 == 0) {
                    crawl.setPagesCrawled(pagesCrawled);
                    crawl.setPagesFailed(pagesFailed);
                    crawlRepository.save(crawl);
                }

                // Polite small delay between requests (50ms)
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    finalStatus = "STOPPED";
                    break;
                }
            }
        } catch (Exception e) {
            log.error("Unexpected error during crawl [{}]: {}", crawlId, e.getMessage(), e);
            finalStatus = "FAILED";
        } finally {
            finalizeCrawl(crawl, finalStatus, pagesCrawled, pagesFailed, stateKey);

            // Set TTL of 2 hours on Redis temporary keys to prevent unbounded memory growth
            setKeysTtl(queueKey, visitedKey, stateKey, crawledKey, failedKey, currentUrlKey, stopKey);
        }
    }

    private PageProcessResult processPage(Long crawlId, String currentUrl, int depth, String targetDomain,
                                          String queueKey, String visitedKey, int maxPages) {
        int statusCode = 200;
        String title = "";
        Document doc = null;

        try {
            Connection connection = Jsoup.connect(currentUrl)
                    .userAgent(userAgent)
                    .timeout(timeoutMs)
                    .followRedirects(true)
                    .ignoreHttpErrors(true);

            Connection.Response response = connection.execute();
            statusCode = response.statusCode();

            String contentType = response.contentType();
            if (contentType != null && !contentType.toLowerCase().contains("text/html")
                    && !contentType.toLowerCase().contains("application/xhtml")) {
                // Not an HTML document
                return new PageProcessResult(false, statusCode);
            }

            doc = response.parse();
            title = doc.title();
            if (title == null || title.isBlank()) {
                title = currentUrl;
            }
        } catch (HttpStatusException e) {
            statusCode = e.getStatusCode();
            title = "HTTP Error " + statusCode;
            log.warn("HTTP {} encountered crawling URL: {}", statusCode, currentUrl);
        } catch (Exception e) {
            log.warn("Failed to fetch page {}: {}", currentUrl, e.getMessage());
            statusCode = 0;
            title = "Error: " + e.getClass().getSimpleName();
        }

        // Save Page entity in PostgreSQL
        Page page = new Page(crawlId, currentUrl, truncate(title, 1000), statusCode, depth);
        page = pageRepository.save(page);

        // If fetch failed completely (network error), don't extract links
        if (doc == null) {
            return new PageProcessResult(statusCode >= 200 && statusCode < 400, statusCode);
        }

        // Extract links
        Elements linkElements = doc.select("a[href]");
        List<Link> linksToSave = new ArrayList<>();
        Set<String> discoveredUrlsInPage = new HashSet<>();

        for (Element linkElem : linkElements) {
            String rawHref = linkElem.attr("abs:href");
            if (rawHref == null || rawHref.isBlank()) {
                continue;
            }

            String normalizedLink = normalizeUrl(rawHref);
            if (normalizedLink == null || !isValidWebUrl(normalizedLink)) {
                continue;
            }

            // Deduplicate links on the same page
            if (!discoveredUrlsInPage.add(normalizedLink)) {
                continue;
            }

            boolean isInternal = isSameDomain(normalizedLink, targetDomain);

            Link link = new Link(crawlId, page.getId(), normalizedLink, isInternal);
            linksToSave.add(link);

            // If internal link and not ignored extension, add to Redis queue if not visited
            if (isInternal && !hasIgnoredExtension(normalizedLink)) {
                // Add to visited set; returns true (1) if newly added
                Long added = redisTemplate.opsForSet().add(visitedKey, normalizedLink);
                if (added != null && added > 0) {
                    redisTemplate.opsForList().rightPush(queueKey, normalizedLink + "|||" + (depth + 1));
                }
            }
        }

        if (!linksToSave.isEmpty()) {
            linkRepository.saveAll(linksToSave);
        }

        return new PageProcessResult(statusCode >= 200 && statusCode < 400, statusCode);
    }

    private void finalizeCrawl(Crawl crawl, String status, int pagesCrawled, int pagesFailed, String stateKey) {
        log.info("Finalizing crawl [{}] with status: {}, crawled: {}, failed: {}",
                crawl.getId(), status, pagesCrawled, pagesFailed);
        crawl.setStatus(status);
        crawl.setPagesCrawled(pagesCrawled);
        crawl.setPagesFailed(pagesFailed);
        crawl.setCompletedAt(LocalDateTime.now());
        crawlRepository.save(crawl);

        redisTemplate.opsForValue().set(stateKey, status);
    }

    private void setKeysTtl(String... keys) {
        try {
            for (String key : keys) {
                redisTemplate.expire(key, 2, TimeUnit.HOURS);
            }
        } catch (Exception e) {
            log.warn("Could not set TTL on Redis keys: {}", e.getMessage());
        }
    }

    public static String normalizeUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }
        try {
            URI uri = new URI(rawUrl.trim());
            String scheme = uri.getScheme();
            if (scheme == null) {
                return null;
            }
            scheme = scheme.toLowerCase();
            if (!scheme.equals("http") && !scheme.equals("https")) {
                return null;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return null;
            }
            host = host.toLowerCase();

            int port = uri.getPort();
            String portPart = "";
            if (port != -1 && !((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443))) {
                portPart = ":" + port;
            }

            String path = uri.getPath();
            if (path == null || path.isEmpty()) {
                path = "/";
            } else if (path.length() > 1 && path.endsWith("/")) {
                path = path.substring(0, path.length() - 1);
            }

            String query = uri.getQuery();
            String queryPart = (query != null && !query.isBlank()) ? "?" + query : "";

            // Note: Fragments (#section) are intentionally omitted per crawling rules
            return scheme + "://" + host + portPart + path + queryPart;
        } catch (Exception e) {
            return null;
        }
    }

    public static String extractDomain(String urlStr) {
        try {
            URI uri = new URI(urlStr);
            String host = uri.getHost();
            if (host != null) {
                return host.toLowerCase().replaceAll("^www\\.", "");
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public static boolean isSameDomain(String testUrl, String targetDomain) {
        String testDomain = extractDomain(testUrl);
        if (testDomain == null || targetDomain == null) {
            return false;
        }
        return testDomain.equalsIgnoreCase(targetDomain) || testDomain.endsWith("." + targetDomain);
    }

    public static boolean hasIgnoredExtension(String url) {
        String path = url.toLowerCase();
        int queryIdx = path.indexOf('?');
        if (queryIdx != -1) {
            path = path.substring(0, queryIdx);
        }
        for (String ext : IGNORED_EXTENSIONS) {
            if (path.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isValidWebUrl(String url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    private static String truncate(String text, int maxLength) {
        if (text == null) return null;
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    private static class PageProcessResult {
        private final boolean success;
        private final int statusCode;

        public PageProcessResult(boolean success, int statusCode) {
            this.success = success;
            this.statusCode = statusCode;
        }

        public boolean isSuccess() {
            return success;
        }

        public int getStatusCode() {
            return statusCode;
        }
    }
}
