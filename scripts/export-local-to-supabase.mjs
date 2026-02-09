#!/usr/bin/env node
/**
 * Exporta datos de prisma/dev.db (SQLite) a un archivo SQL para importar en Supabase (PostgreSQL).
 * Uso: node scripts/export-local-to-supabase.mjs
 * Genera: prisma/supabase-seed-data.sql
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");
const OUT_PATH = path.join(process.cwd(), "prisma", "supabase-seed-data.sql");

function runSqlite(query) {
  const cmd = `sqlite3 "${DB_PATH}" ".mode json" "${query.replace(/"/g, '\\"')}"`;
  const out = execSync(cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (!out.trim()) return [];
  try {
    const rows = JSON.parse(out.trim());
    return Array.isArray(rows) ? rows : [rows];
  } catch {
    return [];
  }
}

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function msToTimestamp(ms) {
  if (ms == null) return "NULL";
  const d = new Date(Number(ms));
  return "'" + d.toISOString().slice(0, 19).replace("T", " ") + "'";
}

function bool(val) {
  if (val === null || val === undefined) return "false";
  return val === 1 || val === true || val === "1" ? "true" : "false";
}

const out = [];

// User (PostgreSQL tiene columnas extra: provider, providerId, name, image, updatedAt)
const users = runSqlite("SELECT * FROM User");
if (users.length) {
  const cols = "id, email, \"passwordHash\", phone, role, \"emailVerified\", \"ndaSigned\", \"dniVerified\", blocked, \"blockedUntil\", \"createdAt\", \"updatedAt\"";
  out.push("-- User");
  for (const r of users) {
    const updatedAt = r.updatedAt != null ? msToTimestamp(r.updatedAt) : msToTimestamp(r.createdAt);
    out.push(
      `INSERT INTO "User" (${cols}) VALUES (${esc(r.id)}, ${esc(r.email)}, ${esc(r.passwordHash)}, ${esc(r.phone)}, ${esc(r.role)}, ${bool(r.emailVerified)}, ${bool(r.ndaSigned)}, ${bool(r.dniVerified)}, ${bool(r.blocked)}, ${r.blockedUntil != null ? msToTimestamp(r.blockedUntil) : "NULL"}, ${msToTimestamp(r.createdAt)}, ${updatedAt}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// Company
const companies = runSqlite("SELECT * FROM Company");
if (companies.length) {
  out.push("-- Company");
  const cols = "id, name, sector, location, revenue, ebitda, employees, description, status, \"createdAt\", \"ownerId\"";
  for (const r of companies) {
    out.push(
      `INSERT INTO "Company" (${cols}) VALUES (${esc(r.id)}, ${esc(r.name)}, ${esc(r.sector)}, ${esc(r.location)}, ${esc(r.revenue)}, ${esc(r.ebitda)}, ${r.employees != null ? r.employees : "NULL"}, ${esc(r.description)}, ${esc(r.status)}, ${msToTimestamp(r.createdAt)}, ${esc(r.ownerId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// Deal
const deals = runSqlite("SELECT * FROM Deal");
if (deals.length) {
  out.push("-- Deal");
  const cols = "id, title, slug, published, \"createdAt\", \"companyId\"";
  for (const r of deals) {
    out.push(
      `INSERT INTO "Deal" (${cols}) VALUES (${esc(r.id)}, ${esc(r.title)}, ${esc(r.slug)}, ${bool(r.published)}, ${msToTimestamp(r.createdAt)}, ${esc(r.companyId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// Valuation
const valuations = runSqlite("SELECT * FROM Valuation");
if (valuations.length) {
  out.push("-- Valuation");
  const cols = "id, \"minValue\", \"maxValue\", \"createdAt\", \"companyId\"";
  for (const r of valuations) {
    out.push(
      `INSERT INTO "Valuation" (${cols}) VALUES (${esc(r.id)}, ${Number(r.minValue)}, ${Number(r.maxValue)}, ${msToTimestamp(r.createdAt)}, ${esc(r.companyId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// Document
const documents = runSqlite("SELECT * FROM Document");
if (documents.length) {
  out.push("-- Document");
  const cols = "id, type, signed, \"signedAt\", \"createdAt\", \"companyId\"";
  for (const r of documents) {
    out.push(
      `INSERT INTO "Document" (${cols}) VALUES (${esc(r.id)}, ${esc(r.type)}, ${bool(r.signed)}, ${r.signedAt != null ? msToTimestamp(r.signedAt) : "NULL"}, ${msToTimestamp(r.createdAt)}, ${esc(r.companyId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// Interest
const interests = runSqlite("SELECT * FROM Interest");
if (interests.length) {
  out.push("-- Interest");
  const cols = "id, \"createdAt\", \"userId\", \"dealId\"";
  for (const r of interests) {
    out.push(
      `INSERT INTO "Interest" (${cols}) VALUES (${esc(r.id)}, ${msToTimestamp(r.createdAt)}, ${esc(r.userId)}, ${esc(r.dealId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// UserCompanyInterest
let ucis = [];
try {
  ucis = runSqlite("SELECT * FROM UserCompanyInterest");
} catch {}
if (ucis.length) {
  out.push("-- UserCompanyInterest");
  const cols = "id, \"companyId\", type, status, \"createdAt\", \"userId\"";
  for (const r of ucis) {
    out.push(
      `INSERT INTO "UserCompanyInterest" (${cols}) VALUES (${esc(r.id)}, ${esc(r.companyId)}, ${esc(r.type)}, ${esc(r.status || "PENDING")}, ${msToTimestamp(r.createdAt)}, ${esc(r.userId)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// WaitlistEntry
const waitlist = runSqlite("SELECT * FROM WaitlistEntry");
if (waitlist.length) {
  out.push("-- WaitlistEntry");
  const cols = "id, email, \"createdAt\"";
  for (const r of waitlist) {
    out.push(
      `INSERT INTO "WaitlistEntry" (${cols}) VALUES (${esc(r.id)}, ${esc(r.email)}, ${msToTimestamp(r.createdAt)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

// ContactRequest
const contacts = runSqlite("SELECT * FROM ContactRequest");
if (contacts.length) {
  out.push("-- ContactRequest");
  const cols = "id, source, type, name, email, phone, \"companyName\", \"contactPerson\", subject, message, \"createdAt\"";
  for (const r of contacts) {
    out.push(
      `INSERT INTO "ContactRequest" (${cols}) VALUES (${esc(r.id)}, ${esc(r.source)}, ${esc(r.type)}, ${esc(r.name)}, ${esc(r.email)}, ${esc(r.phone)}, ${esc(r.companyName)}, ${esc(r.contactPerson)}, ${esc(r.subject)}, ${esc(r.message)}, ${msToTimestamp(r.createdAt)}) ON CONFLICT (id) DO NOTHING;`
    );
  }
  out.push("");
}

const header = `-- Datos exportados desde SQLite local para importar en Supabase (PostgreSQL)
-- Ejecutar DESPUÉS de haber creado las tablas (supabase-init.sql o prisma db push)
-- Generado con: node scripts/export-local-to-supabase.mjs

`;
fs.writeFileSync(OUT_PATH, header + out.join("\n"), "utf8");
console.log("Generado:", OUT_PATH);
console.log("  User:", users.length, "Company:", companies.length, "Deal:", deals.length, "Valuation:", valuations.length);
