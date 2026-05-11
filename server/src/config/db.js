import dotenv from "dotenv";
import pg from "pg";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
});

export async function connectDB() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Use your Neon PostgreSQL connection string.");
  }

  await pool.query("select 1");
  await createSchema();
  console.log("PostgreSQL connected");
}

async function createSchema() {
  await pool.query(`
    create extension if not exists pgcrypto;

    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null unique,
      password_hash text not null,
      phone text,
      role text not null default 'volunteer' check (role in ('admin', 'volunteer')),
      status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
      skills text[] not null default '{}',
      availability text[] not null default '{}',
      experience text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists events (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      description text not null,
      date timestamptz not null,
      location text not null,
      required_volunteers integer not null check (required_volunteers > 0),
      created_by uuid references users(id) on delete set null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists event_registrations (
      event_id uuid not null references events(id) on delete cascade,
      volunteer_id uuid not null references users(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (event_id, volunteer_id)
    );

    create table if not exists tasks (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      description text,
      event_id uuid not null references events(id) on delete cascade,
      volunteer_id uuid not null references users(id) on delete cascade,
      status text not null default 'assigned' check (status in ('assigned', 'in-progress', 'completed')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists attendance (
      id uuid primary key default gen_random_uuid(),
      event_id uuid not null references events(id) on delete cascade,
      volunteer_id uuid not null references users(id) on delete cascade,
      status text not null check (status in ('present', 'absent')),
      marked_by uuid references users(id) on delete set null,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (event_id, volunteer_id)
    );
  `);
}

export function mapUser(row) {
  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    role: row.role,
    status: row.status,
    skills: row.skills || [],
    availability: row.availability || [],
    experience: row.experience || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
