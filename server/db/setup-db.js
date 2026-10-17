/**
 * PostgreSQL Database Setup Script
 * Run with: npm run db:setup
 * 
 * This script connects to your PostgreSQL instance, creates the database if it doesn't exist,
 * and applies the tasks table schema and initial student tasks seed data.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function setup() {
  const databaseUrl = process.env.DATABASE_URL;
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const targetDb = process.env.PGDATABASE || 'student_tasks';

  console.log(`\n========================================`);
  console.log(`🎓 Student Task Manager - DB Setup`);
  if (databaseUrl) {
    console.log(`Connecting via DATABASE_URL...`);
  } else {
    console.log(`Connecting to PostgreSQL host: ${host}:${port} as ${user}...`);
  }
  console.log(`========================================\n`);

  // If using local postgres without DATABASE_URL, ensure target database exists
  if (!databaseUrl) {
    const adminClient = new Client({
      host,
      port,
      user,
      password,
      database: 'postgres'
    });

    try {
      await adminClient.connect();
      console.log(`Connected to default postgres admin database.`);

      const checkRes = await adminClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [targetDb]
      );

      if (checkRes.rowCount === 0) {
        console.log(`Database "${targetDb}" does not exist. Creating...`);
        await adminClient.query(`CREATE DATABASE "${targetDb}"`);
        console.log(`✅ Database "${targetDb}" created successfully!`);
      } else {
        console.log(`ℹ️ Database "${targetDb}" already exists.`);
      }
    } catch (err) {
      console.warn(`Admin database check note: ${err.message}`);
    } finally {
      try {
        await adminClient.end();
      } catch (e) {}
    }
  }

  // Connect to the target database and execute init.sql
  const targetClient = databaseUrl 
    ? new Client({ connectionString: databaseUrl })
    : new Client({ host, port, user, password, database: targetDb });

  try {
    console.log(`Connecting to target database...`);
    await targetClient.connect();
    console.log(`Applying schema and initial seeds from init.sql...`);

    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await targetClient.query(sql);
    console.log(`✅ Schema created and base seeds verified.`);

    // Migrate users from users.json if present
    const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
    if (fs.existsSync(usersFilePath)) {
      try {
        const localUsers = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
        if (Array.isArray(localUsers) && localUsers.length > 0) {
          console.log(`Migrating ${localUsers.length} user(s) from users.json to PostgreSQL...`);
          for (const u of localUsers) {
            await targetClient.query(
              `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
               VALUES ($1, $2, $3, $4, COALESCE($5::timestamp with time zone, NOW()), COALESCE($6::timestamp with time zone, NOW()))
               ON CONFLICT (email) DO NOTHING`,
              [u.id, u.name, u.email, u.password_hash, u.created_at, u.updated_at]
            );
          }
          await targetClient.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));`);
          console.log(`✅ Users successfully migrated.`);
        }
      } catch (userErr) {
        console.warn(`User migration notice: ${userErr.message}`);
      }
    }

    // Migrate tasks from local data/tasks.json if present (preserves user data)
    const dataFilePath = path.join(__dirname, '..', 'data', 'tasks.json');
    if (fs.existsSync(dataFilePath)) {
      try {
        const localTasks = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        if (Array.isArray(localTasks) && localTasks.length > 0) {
          console.log(`Migrating ${localTasks.length} task(s) from tasks.json to PostgreSQL...`);
          for (const t of localTasks) {
            await targetClient.query(
              `INSERT INTO tasks (user_id, title, description, subject, priority, due_date, status, created_at, updated_at)
               VALUES (COALESCE($1, 1), $2, $3, $4, $5, $6, $7, COALESCE($8::timestamp with time zone, NOW()), COALESCE($9::timestamp with time zone, NOW()))
               ON CONFLICT DO NOTHING`,
              [t.user_id || 1, t.title, t.description || '', t.subject, t.priority, t.due_date, t.status || 'Pending', t.created_at, t.updated_at]
            );
          }
          console.log(`✅ Existing task data successfully migrated.`);
        }
      } catch (migrateErr) {
        console.warn(`Local task migration notice: ${migrateErr.message}`);
      }
    }

    // Ensure auto-increment sequence is synced with max ID
    await targetClient.query(`
      SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));
    `);

    const countRes = await targetClient.query('SELECT COUNT(*) FROM tasks');
    console.log(`Total tasks currently in database: ${countRes.rows[0].count}`);
    console.log(`\n🎉 PostgreSQL is ready for Student Task Manager!\n`);
  } catch (err) {
    console.error(`❌ Error during setup:`, err.message);
    process.exitCode = 1;
  } finally {
    try {
      await targetClient.end();
    } catch (e) {}
  }
}

setup();
