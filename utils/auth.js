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
  console.log(`Table "${tableName}" removed (if it existed).`);
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
  console.log("NEW USER");
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
      console.log(false);
      return false; // User not found
    }
    const match = await bcrypt.compare(password, row.password);
    console.log("match:", match);
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

    console.log("Password updated successfully.");
    return "Password updated successfully.";
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// updatePassword("izac", "izac1122");

export { generateNewApiKey, checkApiKey, checkPassword };
