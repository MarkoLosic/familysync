-- Migration: Update tasks table schema
-- Run this in your Supabase SQL Editor

-- Add new columns if they don't exist
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'other' CHECK (category IN ('chore', 'homework', 'other')),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Update status column to include new statuses
ALTER TABLE tasks 
  DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('active', 'pending_approval', 'completed', 'rejected'));

-- Update existing tasks to have 'active' status if they're 'pending'
UPDATE tasks 
SET status = 'active' 
WHERE status = 'pending';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_family_status ON tasks(family_id, status);

-- Add comment
COMMENT ON COLUMN tasks.category IS 'Task category: chore, homework, or other';
COMMENT ON COLUMN tasks.approved_at IS 'Timestamp when parent approved the completed task';
COMMENT ON COLUMN tasks.status IS 'Task status: active (to do), pending_approval (child completed), completed (parent approved), rejected (parent rejected)';
