package com.example.crawler.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class RedisConfig {

    @Value("${crawler.async.core-pool-size:4}")
    private int corePoolSize;

    @Value("${crawler.async.max-pool-size:10}")
    private int maxPoolSize;

    @Value("${crawler.async.queue-capacity:50}")
    private int queueCapacity;


    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }


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
}
