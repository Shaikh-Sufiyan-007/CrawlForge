package com.example.crawler.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Lazy(false)
public class StartupWarmup implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger log = LoggerFactory.getLogger(StartupWarmup.class);

    private final JdbcTemplate jdbcTemplate;
    private final RedisConnectionFactory redisConnectionFactory;

    public StartupWarmup(JdbcTemplate jdbcTemplate, RedisConnectionFactory redisConnectionFactory) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        long startTime = System.currentTimeMillis();
        log.info("Starting post-startup pre-warming of database and cache connections...");

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("Database connection pre-warmed successfully (result: {})", result);
        } catch (Exception e) {
            log.warn("Database pre-warming check failed: {}", e.getMessage());
        }

        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            String ping = connection.ping();
            log.info("Redis cache pre-warmed successfully (ping: {})", ping);
        } catch (Exception e) {
            log.warn("Redis pre-warming check failed: {}", e.getMessage());
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Startup pre-warming completed in {}ms. Ready for user traffic.", duration);
    }
}
