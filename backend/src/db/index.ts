import dotenv from 'dotenv';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any;

async function createPool() {
  if (process.env.DATABASE_URL) {
    // Production: Neon serverless
    const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');
    const { WebSocket } = await import('ws');
    neonConfig.webSocketConstructor = WebSocket;
    pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
    console.log('Using Neon DB (DATABASE_URL)');
  } else {
    // Local development: standard PostgreSQL
    const { Pool: PgPool } = await import('pg');
    pool = new PgPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'product_analytics',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    console.log('Using local PostgreSQL');
  }
}

export function getPool() {
  if (!pool) throw new Error('DB pool not initialized. Call initializeDB() first.');
  return pool;
}

export async function initializeDB(): Promise<void> {
  await createPool();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        main_category TEXT NOT NULL,
        discounted_price NUMERIC,
        actual_price NUMERIC,
        discount_percentage NUMERIC,
        rating NUMERIC,
        rating_count INTEGER,
        about_product TEXT,
        user_name TEXT,
        review_title TEXT,
        review_content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}
