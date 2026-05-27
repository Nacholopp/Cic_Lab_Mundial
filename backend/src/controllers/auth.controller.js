import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbQuery, isDbReady, newId } from "../config/db.js";
import { env } from "../config/env.js";

function normalizeEmail(email) {
  return email?.toString().trim().toLowerCase() || "";
}

function normalizeUsername(username) {
  return username?.toString().trim() || "";
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.created_at || user.createdAt
  };
}

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

function tokenExpiresAt(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function persistLoggedSession(userId, token) {
  if (!isDbReady()) return;
  try {
    await dbQuery(
      `INSERT INTO logged_sessions (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [newId(), userId, token, tokenExpiresAt(7)]
    );
  } catch {
    // No bloqueamos auth si la tabla aun no existe o falla el insert.
  }
}

function isMissingTableError(error) {
  return error?.code === "42P01";
}

async function findPrimaryUserByEmail(email) {
  const result = await dbQuery(
    `SELECT id, username, email, password, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findLegacyUserByEmail(email) {
  try {
    const result = await dbQuery(
      `SELECT id, username, email, password, "createdAt" AS created_at
       FROM "User"
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
}

async function userExistsByEmailAnyTable(email) {
  const inPrimary = await dbQuery(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
  if (inPrimary.rowCount > 0) return true;

  try {
    const inLegacy = await dbQuery(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
    return inLegacy.rowCount > 0;
  } catch (error) {
    if (isMissingTableError(error)) return false;
    throw error;
  }
}

async function usernameExistsAnyTable(username) {
  const inPrimary = await dbQuery(`SELECT id FROM users WHERE username = $1 LIMIT 1`, [username]);
  if (inPrimary.rowCount > 0) return true;

  try {
    const inLegacy = await dbQuery(`SELECT id FROM "User" WHERE username = $1 LIMIT 1`, [username]);
    return inLegacy.rowCount > 0;
  } catch (error) {
    if (isMissingTableError(error)) return false;
    throw error;
  }
}

async function ensurePrimaryUserFromLegacy(legacyUser) {
  if (!legacyUser) return null;

  const existing = await dbQuery(
    `SELECT id, username, email, password, created_at
     FROM users
     WHERE id = $1 OR email = $2
     LIMIT 1`,
    [legacyUser.id, legacyUser.email]
  );
  if (existing.rowCount > 0) return existing.rows[0];

  const inserted = await dbQuery(
    `INSERT INTO users (id, username, email, password, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, username, email, password, created_at`,
    [legacyUser.id, legacyUser.username, legacyUser.email, legacyUser.password, legacyUser.created_at || new Date()]
  );
  return inserted.rows[0] || null;
}

export async function checkEmail(req, res) {
  if (!isDbReady()) {
    return res.status(500).json({ ok: false, error: "Database unavailable" });
  }

  const email = normalizeEmail(req.query?.email);
  if (!email) {
    return res.status(400).json({ ok: false, error: "email is required" });
  }

  const exists = await userExistsByEmailAnyTable(email);
  return res.json({
    ok: true,
    exists,
    shouldLogin: exists
  });
}

export async function register(req, res) {
  if (!isDbReady()) {
    return res.status(500).json({ ok: false, error: "Database unavailable" });
  }

  const username = normalizeUsername(req.body?.username);
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password?.toString() || "";

  if (!username || !email || !password) {
    return res.status(400).json({
      ok: false,
      error: "username, email and password are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      ok: false,
      error: "Password must be at least 8 characters long"
    });
  }

  const existingEmail = await userExistsByEmailAnyTable(email);
  if (existingEmail) {
    return res.status(409).json({
      ok: false,
      error: "Email already exists. Please login instead.",
      code: "EMAIL_ALREADY_EXISTS",
      shouldLogin: true
    });
  }

  const existingUsername = await usernameExistsAnyTable(username);
  if (existingUsername) {
    return res.status(409).json({
      ok: false,
      error: "Username is already taken",
      code: "USERNAME_ALREADY_EXISTS"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = newId();
  const created = await dbQuery(
    `INSERT INTO users (id, username, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, created_at`,
    [userId, username, email, hashedPassword]
  );
  const user = created.rows[0];

  const token = createAuthToken(user);
  await persistLoggedSession(user.id, token);

  return res.status(201).json({
    ok: true,
    message: "User created successfully",
    token,
    user: sanitizeUser(user)
  });
}

export async function login(req, res) {
  if (!isDbReady()) {
    return res.status(500).json({ ok: false, error: "Database unavailable" });
  }

  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password?.toString() || "";

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      error: "email and password are required"
    });
  }

  let user = await findPrimaryUserByEmail(email);
  if (!user) {
    const legacyUser = await findLegacyUserByEmail(email);
    if (legacyUser) {
      user = await ensurePrimaryUserFromLegacy(legacyUser);
    }
  }
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: "Email not found. Please register first.",
      code: "EMAIL_NOT_FOUND",
      shouldRegister: true
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      ok: false,
      error: "Invalid credentials"
    });
  }

  const token = createAuthToken(user);
  await persistLoggedSession(user.id, token);

  return res.json({
    ok: true,
    token,
    user: sanitizeUser(user)
  });
}

export async function me(req, res) {
  if (!isDbReady()) {
    return res.status(500).json({ ok: false, error: "Database unavailable" });
  }

  const userId = req.authUser?.id;
  const found = await dbQuery(`SELECT id, username, email, created_at FROM users WHERE id = $1 LIMIT 1`, [userId]);
  let user = found.rows[0] || null;

  if (!user) {
    try {
      const legacy = await dbQuery(
        `SELECT id, username, email, "createdAt" AS created_at
         FROM "User"
         WHERE id = $1
         LIMIT 1`,
        [userId]
      );
      user = legacy.rows[0] || null;
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
    }
  }

  if (!user) {
    return res.status(404).json({
      ok: false,
      error: "User not found"
    });
  }

  return res.json({
    ok: true,
    user: sanitizeUser(user)
  });
}
