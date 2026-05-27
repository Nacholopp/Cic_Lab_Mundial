import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
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
    createdAt: user.createdAt
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

export async function checkEmail(req, res) {
  const email = normalizeEmail(req.query?.email);
  if (!email) {
    return res.status(400).json({ ok: false, error: "email is required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  return res.json({
    ok: true,
    exists: Boolean(existing),
    shouldLogin: Boolean(existing)
  });
}

export async function register(req, res) {
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

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({
      ok: false,
      error: "Email already exists. Please login instead.",
      code: "EMAIL_ALREADY_EXISTS",
      shouldLogin: true
    });
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return res.status(409).json({
      ok: false,
      error: "Username is already taken",
      code: "USERNAME_ALREADY_EXISTS"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  return res.status(201).json({
    ok: true,
    message: "User created successfully",
    token: createAuthToken(user),
    user: sanitizeUser(user)
  });
}

export async function login(req, res) {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password?.toString() || "";

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      error: "email and password are required"
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
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

  return res.json({
    ok: true,
    token: createAuthToken(user),
    user: sanitizeUser(user)
  });
}

export async function me(req, res) {
  const userId = req.authUser?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true
    }
  });

  if (!user) {
    return res.status(404).json({
      ok: false,
      error: "User not found"
    });
  }

  return res.json({
    ok: true,
    user
  });
}
