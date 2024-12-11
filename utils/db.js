import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function connectToDatabase() {
  return open({
    filename: "./db.db",
    driver: sqlite3.Database,
  });
}

export async function logErrorToDB(error) {
  const db = await connectToDatabase();
  await db.exec(`
        CREATE TABLE IF NOT EXISTS errors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            time TEXT NOT NULL,
            seen TEXT NOT NULL
        );
    `);

  let result = await db.run("INSERT INTO errors (message, time, seen) VALUES (?, ?, ?)", error, new Date().toLocaleString(), false);
}

export async function getErrorsFromDB() {
  const db = await connectToDatabase();

  let result = await db.all(`SELECT * FROM errors`);

  return result;
}

export async function logToDB(log) {
  const db = await connectToDatabase();
  await db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            time TEXT NOT NULL,
            level TEXT NOT NULL
        );
        `);
  let result = await db.run("INSERT INTO logs (message, time, level) VALUES (?, ?, ?)", log.message, log.timestamp, log.level);
  console.log(result);
}

export async function getLogsFronDB() {
  const db = await connectToDatabase();

  let result = await db.all(`SELECT * FROM logs`);

  return result;
}

// getErrorsFromDB();
