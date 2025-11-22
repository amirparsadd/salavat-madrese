const { DATABASE_CONNECTION_STRING } = require("./config");
const { Pool } = require("pg");

// Validate DATABASE_CONNECTION_STRING
if (!DATABASE_CONNECTION_STRING) {
  console.error("No DATABASE_CONNECTION_STRING found, quitting...");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_CONNECTION_STRING,
});

async function initialize() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create clicks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        count BIGINT NOT NULL DEFAULT 0,
        daily_amount BIGINT NOT NULL DEFAULT 0,
        daily_last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Add daily_amount column if it doesn't exist (for existing tables)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_name='clicks' AND column_name='daily_amount') THEN
          ALTER TABLE clicks ADD COLUMN daily_amount BIGINT NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `);

    // Add daily_last_update column if it doesn't exist (for existing tables)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_name='clicks' AND column_name='daily_last_update') THEN
          ALTER TABLE clicks ADD COLUMN daily_last_update TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;
      END $$;
    `);

    // Ensure a single row exists in clicks table
    await client.query(`
      INSERT INTO clicks (id, count, daily_amount, daily_last_update)
      SELECT 1, 1, 1, now()
      WHERE NOT EXISTS (SELECT 1 FROM clicks WHERE id = 1);
    `);

    // Create configs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS configs (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Insert initial config values
    await client.query(`
      INSERT INTO configs (key, value)
      VALUES 
        ('support', 'https://t.me/amirparsab90'),
        ('servicestatus', 'https://uptimekuma.afrachin.ir/status/salavat-madrese')
      ON CONFLICT (key) DO UPDATE 
        SET value = EXCLUDED.value,
            updated_at = now();
    `);

    await client.query("COMMIT");
    console.info("DAL initialization complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error initializing DAL:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

// Click Functions

/**
 * Read the current click count with daily tracking
 * @returns {Promise<{daily: {amount: number, lastUpdate: number}, total: number}>}
 */
async function getClickCount() {
  const res = await pool.query(
    "SELECT count, daily_amount, daily_last_update FROM clicks WHERE id = 1"
  );
  const row = res.rows[0];
  if (!row) {
    return {
      daily: {
        amount: 0,
        lastUpdate: 0
      },
      total: 0
    };
  }
  return {
    daily: {
      amount: Number(row.daily_amount) || 0,
      lastUpdate: row.daily_last_update ? new Date(row.daily_last_update).getTime() : 0
    },
    total: Number(row.count) || 0
  };
}

/**
 * Increment the click count atomically with daily tracking
 * @param {number} amount - number of clicks to add
 * @returns {Promise<{daily: {amount: number, lastUpdate: number}, total: number} | null>}
 */
async function incrementClickCount(amount = 1) {
  const res = await pool.query(
    `UPDATE clicks
     SET 
       count = count + $1,
       daily_amount = CASE 
         WHEN daily_last_update IS NOT NULL AND DATE(daily_last_update) = DATE(now()) 
           THEN daily_amount + $1
         ELSE $1
       END,
       daily_last_update = now()
     WHERE id = 1
     RETURNING count, daily_amount, daily_last_update`,
    [amount]
  );
  const row = res.rows[0];
  if (!row) {
    return null;
  }
  return {
    daily: {
      amount: Number(row.daily_amount) || 0,
      lastUpdate: row.daily_last_update ? new Date(row.daily_last_update).getTime() : 0
    },
    total: Number(row.count) || 0
  };
}

// Key-Value Functions

/**
 * Get a config value by key
 * @param {string} key
 * @returns {Promise<string | null>}
 */
async function getConfig(key) {
  const res = await pool.query(
    "SELECT value FROM configs WHERE key = $1",
    [key]
  );
  return res.rows[0]?.value ?? null;
}

/**
 * Set or update a config key-value pair
 * @param {string} key
 * @param {string} value
 * @returns {Promise<string | null>}
 */
async function setConfig(key, value) {
  const res = await pool.query(
    `
    INSERT INTO configs (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = now()
    RETURNING value
    `,
    [key, value]
  );
  return res.rows[0]?.value ?? null;
}

/**
 * Get all configs as an object
 * @returns {Promise<Record<string, string>>}
 */
async function getAllConfigs() {
  const res = await pool.query("SELECT key, value FROM configs");
  return res.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

module.exports = {
  initialize,
  pool,
  getClickCount,
  incrementClickCount,
  getConfig,
  setConfig,
  getAllConfigs,
};