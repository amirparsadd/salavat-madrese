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

    // Create clicks table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        count BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // Commit the table creation first to ensure catalog is updated
    await client.query("COMMIT");
    
    // Start a new transaction for column additions
    await client.query("BEGIN");

    // Add columns using DO block with proper exception handling
    // This handles catalog corruption errors (XX000) gracefully
    await client.query(`
      DO $$ 
      DECLARE
        col_exists boolean;
      BEGIN
        -- Check and add daily_amount
        SELECT EXISTS (
          SELECT 1 FROM pg_attribute a
          JOIN pg_class c ON a.attrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public' 
            AND c.relname = 'clicks' 
            AND a.attname = 'daily_amount'
            AND a.attnum > 0
        ) INTO col_exists;
        
        IF NOT col_exists THEN
          BEGIN
            ALTER TABLE clicks ADD COLUMN daily_amount BIGINT NOT NULL DEFAULT 0;
          EXCEPTION
            WHEN duplicate_column THEN
              NULL;
            WHEN OTHERS THEN
              -- Catch catalog corruption errors (XX000) and continue
              IF SQLSTATE = 'XX000' THEN
                RAISE NOTICE 'Skipping daily_amount: catalog issue (OID error)';
              ELSE
                RAISE;
              END IF;
          END;
        END IF;
        
        -- Check and add daily_last_update
        SELECT EXISTS (
          SELECT 1 FROM pg_attribute a
          JOIN pg_class c ON a.attrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public' 
            AND c.relname = 'clicks' 
            AND a.attname = 'daily_last_update'
            AND a.attnum > 0
        ) INTO col_exists;
        
        IF NOT col_exists THEN
          BEGIN
            ALTER TABLE clicks ADD COLUMN daily_last_update TIMESTAMP WITH TIME ZONE DEFAULT now();
          EXCEPTION
            WHEN duplicate_column THEN
              NULL;
            WHEN OTHERS THEN
              IF SQLSTATE = 'XX000' THEN
                RAISE NOTICE 'Skipping daily_last_update: catalog issue (OID error)';
              ELSE
                RAISE;
              END IF;
          END;
        END IF;
      END $$;
    `);

    // Ensure a single row exists in clicks table
    // Check which columns actually exist before inserting
    const tableOidForInsert = await client.query(`
      SELECT oid FROM pg_class WHERE relname = 'clicks' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    
    if (tableOidForInsert.rows.length > 0) {
      const oid = tableOidForInsert.rows[0].oid;
      const hasDailyAmount = await client.query(`
        SELECT 1 FROM pg_attribute WHERE attrelid = $1 AND attname = 'daily_amount' AND attnum > 0
      `, [oid]);
      const hasDailyLastUpdate = await client.query(`
        SELECT 1 FROM pg_attribute WHERE attrelid = $1 AND attname = 'daily_last_update' AND attnum > 0
      `, [oid]);
      
      if (hasDailyAmount.rows.length > 0 && hasDailyLastUpdate.rows.length > 0) {
        // Both columns exist, use full insert
        await client.query(`
          INSERT INTO clicks (id, count, daily_amount, daily_last_update)
          SELECT 1, 0, 0, now()
          WHERE NOT EXISTS (SELECT 1 FROM clicks WHERE id = 1);
        `);
      } else {
        // Fallback: insert without new columns
        await client.query(`
          INSERT INTO clicks (id, count)
          SELECT 1, 0
          WHERE NOT EXISTS (SELECT 1 FROM clicks WHERE id = 1);
        `);
      }
    }

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