-- Student Task Manager Database Schema (PostgreSQL)
-- Multi-Student Architecture with User Authentication and Task Ownership

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tasks Table with User Ownership Foreign Key
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alter table safely if tasks was previously created without user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for fast filtering, searching, and user-scoped lookups
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_modtime ON tasks;
CREATE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Seed Default Student User (password: password123)
INSERT INTO users (id, name, email, password_hash)
VALUES (1, 'Alex Rivera', 'student@example.com', '$2b$10$lSNB61YQ8XduLhIJM6xt.uJV6VXuiqGaVBaqCLx7YZ9oNiVJGnfoC')
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- Synchronize users sequence
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));

-- Initial Seed Tasks (assigned to user_id = 1)
INSERT INTO tasks (user_id, title, description, subject, priority, due_date, status)
VALUES 
(1, 'Complete Operating Systems Lab Assignment 4', 'Implement CPU scheduling algorithms (Round Robin and SJF) in C.', 'Operating Systems', 'High', CURRENT_DATE + INTERVAL '2 days', 'In Progress'),
(1, 'Database Systems Normalization Quiz', 'Review 1NF, 2NF, 3NF, and BCNF concepts and solve practice questions.', 'Database Systems', 'High', CURRENT_DATE + INTERVAL '1 day', 'Pending'),
(1, 'Computer Networks Presentation', 'Prepare 10-slide deck explaining TCP 3-way handshake and congestion control.', 'Computer Networks', 'Medium', CURRENT_DATE + INTERVAL '5 days', 'Pending'),
(1, 'Calculus Problem Set #6', 'Solve questions 1 through 15 on multivariable derivatives and double integrals.', 'Mathematics', 'Low', CURRENT_DATE + INTERVAL '7 days', 'Pending'),
(1, 'Software Engineering Project Milestone 1', 'Submit software requirements specification (SRS) and architecture diagram.', 'Software Engineering', 'High', CURRENT_DATE - INTERVAL '1 day', 'Pending'),
(1, 'Machine Learning Reading: Linear Regression', 'Read chapter 3 of Bishop and complete Jupyter notebook walkthrough.', 'Machine Learning', 'Medium', CURRENT_DATE - INTERVAL '3 days', 'Completed')
ON CONFLICT DO NOTHING;

-- Synchronize tasks sequence
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1));
