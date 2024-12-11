import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import crypto from "crypto";

sqlite3.verbose(); // Ensures verbose mode for sqlite3

async function hash(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function connectToDatabase() {
  return open({
    filename: "./db.db",
    driver: sqlite3.Database,
  });
}

async function createAuthTable() {
  const db = await connectToDatabase();
  await db.exec(`
        CREATE TABLE IF NOT EXISTS apikeys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL
        );
    `);
}

async function addApiKey(key) {
  const db = await connectToDatabase();
  await createAuthTable();
  await db.run(`INSERT INTO apiKeys (key) VALUES (?)`, key);
}

async function getApiKey() {
  const db = await connectToDatabase();
  const row = await db.get("SELECT * FROM apiKeys ORDER BY id DESC LIMIT 1");
  return row.key;
}

async function dropTable(tableName) {
  const db = await connectToDatabase();
  await db.exec(`DROP TABLE IF EXISTS ${tableName}`);
}

async function checkApiKey(testKey) {
  let key = await getApiKey();
  const isMatch = await bcrypt.compare(testKey, key);
  return isMatch;
}

async function generateNewApiKey() {
  const key = crypto.randomBytes(32).toString("hex");
  const hashedKey = await hash(key);

  await addApiKey(hashedKey);

  return key;
}

async function newUser(username, password) {
  const db = await connectToDatabase();
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            reject("Username already exists.");
          } else {
            reject(err.message);
          }
        } else {
          resolve("User created successfully.");
        }
      });
    });
  } catch (err) {
    throw new Error("Error hashing password.");
  }
}

async function checkPassword(username, password) {
  const db = await connectToDatabase();

  try {
    const row = await db.get(`SELECT password FROM users WHERE username = ?`, [username]);
    if (!row) {
      return false; // User not found
    }
    const match = await bcrypt.compare(password, row.password);
    return match;
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

async function updatePassword(username, newPassword) {
  const db = await connectToDatabase();
  const saltRounds = 10;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    const result = await db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, username]);

    if (result.changes === 0) {
      throw new Error("User not found or password update failed.");
    }

    return "Password updated successfully.";
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

async function upsertObject(obj) {
  const db = await connectToDatabase();
  const tableName = "Accounts";

  const keys = Object.keys(obj);

  if (keys.length === 0) {
    throw new Error("Object must have at least one key-value pair.");
  }

  if (!keys.includes("id")) {
    throw new Error("Object must include an 'id' property.");
  }

  // Create or update the table with columns matching the object's keys.
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY
    );`;

  await new Promise((resolve, reject) => {
    db.run(createTableQuery, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  for (const key of keys) {
    if (key === "id") continue; // Skip 'id' as it is already part of the table.
    const alterQuery = `ALTER TABLE ${tableName} ADD COLUMN ${key} TEXT;`;
    await new Promise((resolve) => {
      db.run(alterQuery, (err) => {
        if (!err) resolve(); // Ignore errors if column already exists.
        else resolve();
      });
    });
  }

  // Upsert the object.
  const columns = keys.join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const updatePlaceholders = keys
    .filter((key) => key !== "id")
    .map((key) => `${key} = excluded.${key}`)
    .join(", ");

  const insertQuery = `INSERT INTO ${tableName} (${columns})
        VALUES (${placeholders})
        ON CONFLICT(id) DO UPDATE SET ${updatePlaceholders};`;

  await new Promise((resolve, reject) => {
    db.run(insertQuery, Object.values(obj), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// updatePassword("izac", "izac1122");

export { generateNewApiKey, checkApiKey, checkPassword, upsertObject };
