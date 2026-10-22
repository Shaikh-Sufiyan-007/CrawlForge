-- V2: Performance indexes for high-throughput queries, sorting, and foreign key traversals

-- Indexes for crawls table
CREATE INDEX IF NOT EXISTS idx_crawls_created_at ON crawls (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawls_status ON crawls (status);

-- Indexes for pages table
CREATE INDEX IF NOT EXISTS idx_pages_crawl_id ON pages (crawl_id);
CREATE INDEX IF NOT EXISTS idx_pages_crawl_id_created_at ON pages (crawl_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_pages_crawl_url ON pages (crawl_id, url);

-- Indexes for links table
CREATE INDEX IF NOT EXISTS idx_links_crawl_id ON links (crawl_id);
CREATE INDEX IF NOT EXISTS idx_links_source_page_id ON links (source_page_id);
CREATE INDEX IF NOT EXISTS idx_links_crawl_source ON links (crawl_id, source_page_id);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
