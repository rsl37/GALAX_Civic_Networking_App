import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';
import fs from 'fs';
import { diagnoseDatabaseFile, createInitialDatabase } from './database-diagnostics.js';

export interface DatabaseSchema {
  users: {
    id: number;
    email: string | null;
    password_hash: string | null;
    wallet_address: string | null;
    username: string;
    avatar_url: string | null;
    reputation_score: number;
    ap_balance: number;
    crowds_balance: number;
    gov_balance: number;
    roles: string;
    skills: string;
    badges: string;
    created_at: string;
    updated_at: string;
    email_verified: number;
    phone: string | null;
    phone_verified: number;
    two_factor_enabled: number;
    two_factor_secret: string | null;
  };
  help_requests: {
    id: number;
    requester_id: number;
    helper_id: number | null;
    title: string;
    description: string;
    category: string;
    urgency: string;
    latitude: number | null;
    longitude: number | null;
    skills_needed: string;
    media_url: string | null;
    media_type: string;
    is_offline_created: number;
    offline_created_at: string | null;
    matching_score: number;
    status: string;
    helper_confirmed_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    rating: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
  };
  crisis_alerts: {
    id: number;
    title: string;
    description: string;
    severity: string;
    latitude: number;
    longitude: number;
    radius: number;
    created_by: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
  proposals: {
    id: number;
    title: string;
    description: string;
    category: string;
    created_by: number;
    deadline: string;
    status: string;
    votes_for: number;
    votes_against: number;
    created_at: string;
  };
  votes: {
    id: number;
    proposal_id: number;
    user_id: number;
    vote_type: string;
    delegate_id: number | null;
    created_at: string;
  };
  messages: {
    id: number;
    help_request_id: number;
    sender_id: number;
    message: string;
    created_at: string;
  };
  delegates: {
    id: number;
    delegator_id: number;
    delegate_id: number;
    category: string;
    created_at: string;
  };
  transactions: {
    id: number;
    user_id: number;
    type: string;
    amount: number;
    token_type: string;
    description: string | null;
    created_at: string;
  };
  chat_rooms: {
    id: number;
    help_request_id: number;
    requester_id: number;
    helper_id: number;
    status: string;
    created_at: string;
  };
  notifications: {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    data: string;
    read_at: string | null;
    created_at: string;
  };
  user_connections: {
    id: number;
    user_id: number;
    socket_id: string;
    connected_at: string;
  };
  password_reset_tokens: {
    id: number;
    user_id: number;
    token: string;
    expires_at: string;
    used_at: string | null;
    created_at: string;
  };
  passkey_credentials: {
    id: number;
    user_id: number;
    credential_id: string;
    public_key: string;
    counter: number;
    device_name: string | null;
    created_at: string;
    last_used_at: string | null;
  };
  oauth_accounts: {
    id: number;
    user_id: number;
    provider: string;
    provider_id: string;
    provider_email: string | null;
    provider_name: string | null;
    access_token: string | null;
    refresh_token: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
  };
  email_verification_tokens: {
    id: number;
    user_id: number;
    token: string;
    expires_at: string;
    used_at: string | null;
    created_at: string;
  };
  sqlite_master: {
    type: string;
    name: string;
    tbl_name: string;
    rootpage: number;
    sql: string;
  };
}

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const databasePath = path.join(dataDirectory, 'database.sqlite');

console.log('🗄️ Database initialization...');
console.log('📁 Data directory:', dataDirectory);
console.log('📊 Database path:', databasePath);
console.log('🔍 Absolute database path:', path.resolve(databasePath));

async function checkColumnExists(db: Database.Database, tableName: string, columnName: string): Promise<boolean> {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some((col: any) => col.name === columnName);
  } catch (error) {
    console.error(`Error checking column ${columnName} in ${tableName}:`, error);
    return false;
  }
}

async function safeAddColumn(db: Database.Database, tableName: string, columnName: string, columnDefinition: string) {
  const exists = await checkColumnExists(db, tableName, columnName);
  if (!exists) {
    console.log(`📝 Adding column ${columnName} to ${tableName}`);
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  } else {
    console.log(`✅ Column ${columnName} already exists in ${tableName}`);
  }
}

async function initializeDatabase() {
  try {
    // Run diagnostics first
    const diagnostics = await diagnoseDatabaseFile();
    
    if (!diagnostics.exists) {
      console.log('🔧 Database file does not exist, creating it...');
      await createInitialDatabase();
    } else if (!diagnostics.valid) {
      console.log('🔧 Database file is invalid, recreating it...');
      // Backup the old file
      const backupPath = databasePath + '.backup.' + Date.now();
      fs.renameSync(databasePath, backupPath);
      console.log('📁 Old database backed up to:', backupPath);
      
      await createInitialDatabase();
    } else {
      console.log('✅ Database file is valid');
      
      // Check and add missing columns to existing tables
      const tempDb = new Database(databasePath);
      
      // Add missing columns to users table
      await safeAddColumn(tempDb, 'users', 'email_verified', 'INTEGER DEFAULT 0');
      await safeAddColumn(tempDb, 'users', 'phone', 'TEXT');
      await safeAddColumn(tempDb, 'users', 'phone_verified', 'INTEGER DEFAULT 0');
      await safeAddColumn(tempDb, 'users', 'two_factor_enabled', 'INTEGER DEFAULT 0');
      await safeAddColumn(tempDb, 'users', 'two_factor_secret', 'TEXT');
      
      // Create missing tables if they don't exist
      const tables = tempDb.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      const tableNames = tables.map((t: any) => t.name);
      
      // Create password_reset_tokens table if it doesn't exist
      if (!tableNames.includes('password_reset_tokens')) {
        console.log('📝 Creating password_reset_tokens table');
        tempDb.exec(`
          CREATE TABLE password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);
        
        // Add indexes
        tempDb.exec(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`);
        tempDb.exec(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)`);
      }
      
      // Create passkey_credentials table if it doesn't exist
      if (!tableNames.includes('passkey_credentials')) {
        console.log('📝 Creating passkey_credentials table');
        tempDb.exec(`
          CREATE TABLE passkey_credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            credential_id TEXT NOT NULL UNIQUE,
            public_key TEXT NOT NULL,
            counter INTEGER DEFAULT 0,
            device_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_used_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);
        
        // Add indexes
        tempDb.exec(`CREATE INDEX idx_passkey_credentials_user_id ON passkey_credentials(user_id)`);
        tempDb.exec(`CREATE INDEX idx_passkey_credentials_credential_id ON passkey_credentials(credential_id)`);
      }
      
      // Create oauth_accounts table if it doesn't exist
      if (!tableNames.includes('oauth_accounts')) {
        console.log('📝 Creating oauth_accounts table');
        tempDb.exec(`
          CREATE TABLE oauth_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            provider TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            provider_email TEXT,
            provider_name TEXT,
            access_token TEXT,
            refresh_token TEXT,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(provider, provider_id)
          )
        `);
        
        // Add indexes
        tempDb.exec(`CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id)`);
        tempDb.exec(`CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider, provider_id)`);
      }
      
      tempDb.close();
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Initialize database before creating connection
await initializeDatabase();

// Ensure data directory exists
if (!fs.existsSync(dataDirectory)) {
  console.log('📁 Creating data directory...');
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDirectory = path.join(dataDirectory, 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

let sqliteDb: Database.Database;
try {
  console.log('🔌 Connecting to SQLite database...');
  sqliteDb = new Database(databasePath);
  console.log('✅ SQLite database connection established');
  
  // Enable foreign keys
  sqliteDb.pragma('foreign_keys = ON');
  
  // Set journal mode to WAL for better performance
  sqliteDb.pragma('journal_mode = WAL');
  
  // Test the connection
  const result = sqliteDb.prepare('SELECT sqlite_version() as version').get();
  console.log('🧪 Database test query result:', result);
  
  // Verify tables exist
  const tables = sqliteDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  
  console.log('📋 Database tables found:', tables.length);
  tables.forEach((table: any) => {
    console.log('  ✅', table.name);
  });
  
  if (tables.length === 0) {
    throw new Error('No tables found in database');
  }
  
} catch (error) {
  console.error('❌ Failed to initialize SQLite database:', error);
  console.error('🔍 Database path that failed:', databasePath);
  throw error;
}

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: (event) => {
    if (event.level === 'query') {
      console.log('🔍 Query:', event.query.sql);
      console.log('📊 Parameters:', event.query.parameters);
    }
    if (event.level === 'error') {
      console.error('❌ Database error:', event.error);
    }
  }
});

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Try to get a count of users
    const userCount = await db
      .selectFrom('users')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();
    
    console.log('✅ Database connection test successful');
    console.log('👥 User count:', userCount?.count || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection();

console.log('✅ Database module initialized successfully');
