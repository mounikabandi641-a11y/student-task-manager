const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists for local fallback storage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed student user (password is 'password123')
const initialSeedUsers = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'student@example.com',
    password_hash: '$2b$10$lSNB61YQ8XduLhIJM6xt.uJV6VXuiqGaVBaqCLx7YZ9oNiVJGnfoC',
    created_at: '2026-10-10T00:00:00.000Z',
    updated_at: '2026-10-10T00:00:00.000Z'
  }
];

// Initial seed tasks (assigned to user 1)
const initialSeedTasks = [
  {
    id: 1,
    user_id: 1,
    title: 'Complete Operating Systems Lab Assignment 4',
    description: 'Implement CPU scheduling algorithms (Round Robin and SJF) in C.',
    subject: 'Operating Systems',
    priority: 'High',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'In Progress',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    title: 'Database Systems Normalization Quiz',
    description: 'Review 1NF, 2NF, 3NF, and BCNF concepts and solve practice questions.',
    subject: 'Database Systems',
    priority: 'High',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    title: 'Computer Networks Presentation',
    description: 'Prepare 10-slide deck explaining TCP 3-way handshake and congestion control.',
    subject: 'Computer Networks',
    priority: 'Medium',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 4,
    user_id: 1,
    title: 'Calculus Problem Set #6',
    description: 'Solve questions 1 through 15 on multivariable derivatives and double integrals.',
    subject: 'Mathematics',
    priority: 'Low',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    user_id: 1,
    title: 'Software Engineering Project Milestone 1',
    description: 'Submit software requirements specification (SRS) and architecture diagram.',
    subject: 'Software Engineering',
    priority: 'High',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 6,
    user_id: 1,
    title: 'Machine Learning Reading: Linear Regression',
    description: 'Read chapter 3 of Bishop and complete Jupyter notebook walkthrough.',
    subject: 'Machine Learning',
    priority: 'Medium',
    due_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    status: 'Completed',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialSeedUsers, null, 2));
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedTasks, null, 2));
}

let pool = null;
let dbStatus = {
  mode: 'unknown',
  connected: false,
  message: 'Initializing database connection...',
  database: process.env.PGDATABASE || 'student_tasks',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432
};

// Configure PostgreSQL Pool
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'student_tasks',
    connectionTimeoutMillis: 3000
  });
}

// Function to initialize PostgreSQL tables
async function initializePostgres() {
  const client = await pool.connect();
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      await client.query(sql);
      console.log('✅ PostgreSQL tables, indexes, and triggers initialized successfully.');
    }

    // Migrate users from users.json if database has no users
    if (fs.existsSync(USERS_FILE)) {
      try {
        const localUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        for (const u of localUsers) {
          await client.query(
            `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
             VALUES ($1, $2, $3, $4, COALESCE($5::timestamp with time zone, NOW()), COALESCE($6::timestamp with time zone, NOW()))
             ON CONFLICT (email) DO NOTHING`,
            [u.id, u.name, u.email, u.password_hash, u.created_at, u.updated_at]
          );
        }
        await client.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));`);
      } catch (err) {
        console.warn('Initial users sync notice:', err.message);
      }
    }

    // Migrate tasks from tasks.json if database has no tasks
    if (fs.existsSync(DATA_FILE)) {
      try {
        const localTasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        for (const t of localTasks) {
          await client.query(
            `INSERT INTO tasks (user_id, title, description, subject, priority, due_date, status, created_at, updated_at)
             VALUES (COALESCE($1, 1), $2, $3, $4, $5, $6, $7, COALESCE($8::timestamp with time zone, NOW()), COALESCE($9::timestamp with time zone, NOW()))
             ON CONFLICT DO NOTHING`,
            [t.user_id || 1, t.title, t.description || '', t.subject, t.priority, t.due_date, t.status || 'Pending', t.created_at, t.updated_at]
          );
        }
        await client.query(`SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));`);
      } catch (e) {
        console.warn('Initial tasks sync notice:', e.message);
      }
    }
  } finally {
    client.release();
  }
}

// Test connection on boot
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    dbStatus = {
      mode: 'postgres',
      connected: true,
      message: `Connected to PostgreSQL database: ${process.env.PGDATABASE || 'student_tasks'}`,
      database: process.env.PGDATABASE || 'student_tasks',
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      timestamp: res.rows[0].now
    };
    console.log(`✅ [DB] Connected to PostgreSQL on ${dbStatus.host}:${dbStatus.port}/${dbStatus.database}`);
    await initializePostgres();
  } catch (err) {
    dbStatus = {
      mode: 'fallback_file',
      connected: false,
      message: `PostgreSQL connection unavailable (${err.code || err.message}). Fallback persistent storage active.`,
      database: 'local JSON storage (multi-student)',
      host: 'local',
      port: 0,
      error: err.message
    };
    console.log(`ℹ️ [DB] Notice: PostgreSQL is not active (${err.message}). Using local persistent database fallback.`);
  }
}

testConnection();

// File-based Storage Handlers for Fallback
function readLocalUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function readLocalTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeLocalTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Helper to keep local JSON backup in sync with PostgreSQL mutations
function syncLocalBackup(data, action) {
  try {
    const tasks = readLocalTasks();
    if (action === 'insert') {
      const idx = tasks.findIndex(t => String(t.id) === String(data.id));
      if (idx >= 0) tasks[idx] = data;
      else tasks.push(data);
    } else if (action === 'update') {
      const idx = tasks.findIndex(t => String(t.id) === String(data.id));
      if (idx >= 0) tasks[idx] = { ...tasks[idx], ...data };
      else tasks.push(data);
    } else if (action === 'delete') {
      const filtered = tasks.filter(t => String(t.id) !== String(data));
      writeLocalTasks(filtered);
      return;
    }
    writeLocalTasks(tasks);
  } catch (e) {}
}

function syncLocalUserBackup(user) {
  try {
    const users = readLocalUsers();
    const idx = users.findIndex(u => String(u.id) === String(user.id));
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    writeLocalUsers(users);
  } catch (e) {}
}

// Universal Multi-Student Database Layer
const db = {
  getStatus: () => dbStatus,

  // --- USER AUTHENTICATION QUERIES ---
  async findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('Postgres findUserByEmail error:', err.message);
      }
    }
    const users = readLocalUsers();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    const numericId = parseInt(id, 10);
    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [numericId]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('Postgres findUserById error:', err.message);
      }
    }
    const users = readLocalUsers();
    const user = users.find(u => Number(u.id) === numericId);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
  },

  async createUser({ name, email, password_hash }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query(
          `INSERT INTO users (name, email, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           RETURNING id, name, email, created_at`,
          [cleanName, cleanEmail, password_hash]
        );
        const newUser = res.rows[0];
        syncLocalUserBackup({ ...newUser, password_hash });
        return newUser;
      } catch (err) {
        console.error('Postgres createUser error:', err.message);
        throw err;
      }
    }

    const users = readLocalUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password_hash,
      created_at: now,
      updated_at: now
    };
    users.push(newUser);
    writeLocalUsers(users);
    return { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at };
  },

  // --- MULTI-STUDENT TASK QUERIES (OWNERSHIP-ENFORCED) ---
  async getAllTasks({ userId, status, subject, priority, deadline, search }) {
    const numericUserId = parseInt(userId, 10);

    if (dbStatus.mode === 'postgres') {
      try {
        let query = 'SELECT * FROM tasks WHERE user_id = $1';
        const params = [numericUserId];
        let paramIdx = 2;

        if (status && status !== 'all') {
          query += ` AND status = $${paramIdx++}`;
          params.push(status);
        }

        if (subject && subject !== 'all') {
          query += ` AND subject = $${paramIdx++}`;
          params.push(subject);
        }

        if (priority && priority !== 'all') {
          query += ` AND priority = $${paramIdx++}`;
          params.push(priority);
        }

        if (search && search.trim()) {
          query += ` AND (LOWER(title) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx})`;
          params.push(`%${search.trim().toLowerCase()}%`);
          paramIdx++;
        }

        if (deadline) {
          const today = new Date().toISOString().split('T')[0];
          if (deadline === 'today') {
            query += ` AND due_date = $${paramIdx++}`;
            params.push(today);
          } else if (deadline === 'week') {
            query += ` AND due_date >= CURRENT_DATE AND due_date <= CURRENT_DATE + INTERVAL '7 days'`;
          } else if (deadline === 'overdue') {
            query += ` AND due_date < CURRENT_DATE AND status != 'Completed'`;
          }
        }

        query += ' ORDER BY due_date ASC, priority DESC';
        const res = await pool.query(query, params);
        return res.rows;
      } catch (err) {
        console.error('Postgres getAllTasks error, falling back to local:', err.message);
      }
    }

    // Fallback filter implementation strictly scoped to authenticated user
    let tasks = readLocalTasks().filter(t => Number(t.user_id) === numericUserId);
    const todayStr = new Date().toISOString().split('T')[0];

    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }
    if (subject && subject !== 'all') {
      tasks = tasks.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    }
    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter(t => (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q)));
    }
    if (deadline) {
      if (deadline === 'today') {
        tasks = tasks.filter(t => t.due_date === todayStr);
      } else if (deadline === 'week') {
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        tasks = tasks.filter(t => t.due_date >= todayStr && t.due_date <= nextWeek);
      } else if (deadline === 'overdue') {
        tasks = tasks.filter(t => t.due_date < todayStr && t.status !== 'Completed');
      }
    }

    // Sort: due_date ASC, then priority
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    tasks.sort((a, b) => {
      if (a.due_date !== b.due_date) {
        return a.due_date.localeCompare(b.due_date);
      }
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    return tasks;
  },

  async getTaskById(id, userId) {
    const numericUserId = parseInt(userId, 10);
    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, numericUserId]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('Postgres getTaskById error:', err.message);
      }
    }
    const tasks = readLocalTasks();
    return tasks.find(t => String(t.id) === String(id) && Number(t.user_id) === numericUserId) || null;
  },

  async createTask({ userId, title, description, subject, priority, due_date, status }) {
    const numericUserId = parseInt(userId, 10);
    const taskStatus = status || 'Pending';

    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query(
          `INSERT INTO tasks (user_id, title, description, subject, priority, due_date, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING *`,
          [numericUserId, title, description || '', subject, priority, due_date, taskStatus]
        );
        if (res.rows[0]) syncLocalBackup(res.rows[0], 'insert');
        return res.rows[0];
      } catch (err) {
        console.error('Postgres createTask error:', err.message);
      }
    }

    const tasks = readLocalTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => Number(t.id) || 0)) + 1 : 1;
    const newTask = {
      id: newId,
      user_id: numericUserId,
      title,
      description: description || '',
      subject,
      priority,
      due_date,
      status: taskStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tasks.push(newTask);
    writeLocalTasks(tasks);
    return newTask;
  },

  async updateTask(id, userId, fields) {
    const numericUserId = parseInt(userId, 10);
    const { title, description, subject, priority, due_date, status } = fields;

    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query(
          `UPDATE tasks 
           SET title = COALESCE($1, title),
               description = COALESCE($2, description),
               subject = COALESCE($3, subject),
               priority = COALESCE($4, priority),
               due_date = COALESCE($5, due_date),
               status = COALESCE($6, status),
               updated_at = NOW()
           WHERE id = $7 AND user_id = $8
           RETURNING *`,
          [title, description, subject, priority, due_date, status, id, numericUserId]
        );
        if (res.rows[0]) syncLocalBackup(res.rows[0], 'update');
        return res.rows[0] || null;
      } catch (err) {
        console.error('Postgres updateTask error:', err.message);
      }
    }

    const tasks = readLocalTasks();
    const idx = tasks.findIndex(t => String(t.id) === String(id) && Number(t.user_id) === numericUserId);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(subject !== undefined && { subject }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { due_date }),
      ...(status !== undefined && { status }),
      updated_at: new Date().toISOString()
    };
    writeLocalTasks(tasks);
    return tasks[idx];
  },

  async deleteTask(id, userId) {
    const numericUserId = parseInt(userId, 10);
    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, numericUserId]);
        if (res.rowCount > 0) syncLocalBackup(id, 'delete');
        return res.rowCount > 0;
      } catch (err) {
        console.error('Postgres deleteTask error:', err.message);
      }
    }

    const tasks = readLocalTasks();
    const target = tasks.find(t => String(t.id) === String(id) && Number(t.user_id) === numericUserId);
    if (!target) return false;

    const filtered = tasks.filter(t => !(String(t.id) === String(id) && Number(t.user_id) === numericUserId));
    writeLocalTasks(filtered);
    return true;
  },

  async getDashboardStats(userId) {
    const numericUserId = parseInt(userId, 10);
    let tasks = [];

    if (dbStatus.mode === 'postgres') {
      try {
        const res = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [numericUserId]);
        tasks = res.rows;
      } catch (err) {
        tasks = readLocalTasks().filter(t => Number(t.user_id) === numericUserId);
      }
    } else {
      tasks = readLocalTasks().filter(t => Number(t.user_id) === numericUserId);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    
    // Overdue: due_date < today AND status != 'Completed'
    const overdueTasks = tasks.filter(t => {
      const taskDue = typeof t.due_date === 'string' 
        ? t.due_date.split('T')[0] 
        : new Date(t.due_date).toISOString().split('T')[0];
      return taskDue < todayStr && t.status !== 'Completed';
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority breakdown
    const priorityBreakdown = {
      High: tasks.filter(t => t.priority === 'High').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      Low: tasks.filter(t => t.priority === 'Low').length
    };

    // Subject breakdown
    const subjectMap = {};
    tasks.forEach(t => {
      const sub = t.subject || 'General';
      subjectMap[sub] = (subjectMap[sub] || 0) + 1;
    });
    const subjectBreakdown = Object.keys(subjectMap).map(name => ({
      name,
      count: subjectMap[name]
    })).sort((a, b) => b.count - a.count);

    // Upcoming deadlines (next 7 days, not completed)
    const next7DaysStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const upcomingDeadlines = tasks
      .filter(t => {
        const d = typeof t.due_date === 'string' ? t.due_date.split('T')[0] : new Date(t.due_date).toISOString().split('T')[0];
        return d >= todayStr && d <= next7DaysStr && t.status !== 'Completed';
      })
      .sort((a, b) => {
        const da = typeof a.due_date === 'string' ? a.due_date : new Date(a.due_date).toISOString();
        const db = typeof b.due_date === 'string' ? b.due_date : new Date(b.due_date).toISOString();
        return da.localeCompare(db);
      })
      .slice(0, 5);

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      priorityBreakdown,
      subjectBreakdown,
      upcomingDeadlines
    };
  }
};

module.exports = {
  db,
  pool,
  testConnection
};
