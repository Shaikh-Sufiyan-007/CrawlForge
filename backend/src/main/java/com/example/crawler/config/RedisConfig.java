package com.example.crawler.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executor;

@Configuration
public class RedisConfig implements WebMvcConfigurer {

    @Value("${crawler.async.core-pool-size:4}")
    private int corePoolSize;

    @Value("${crawler.async.max-pool-size:10}")
    private int maxPoolSize;

    @Value("${crawler.async.queue-capacity:50}")
    private int queueCapacity;

    /**
     * StringRedisTemplate for simple and efficient String key-value operations:
     * - URL queue (lists)
     * - Visited sets
     * - Crawl status and progress counters
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    /**
     * Dedicated ThreadPoolTaskExecutor for @Async crawler background tasks.
     * Prevents blocking HTTP request threads.
     */
    @Bean(name = "crawlerTaskExecutor")
    public Executor crawlerTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("crawler-exec-");
        executor.initialize();
        return executor;
    }

    /**
     * Configure CORS to allow the React frontend to communicate with the Spring Boot backend.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
