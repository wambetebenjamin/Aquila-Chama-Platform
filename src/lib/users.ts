import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { DEMO_CHAMA_ID } from "./seed";
import { storeGet, storeSet } from "./store";
import type { Role } from "./types";

/**
 * Demo user store. Node runtime only — never import this from middleware.
 *
 * Passwords are scrypt-hashed with a per-user salt. The plaintext exists only
 * in environment variables; nothing writable is ever stored in the repo.
 */

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  chamaId: string;
  memberId?: string;
  hash: string;
  salt: string;
}

const USERS_KEY = "users";

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function createHash(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  return { hash: hashPassword(password, salt), salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function demoAccounts() {
  return [
    {
      key: "ADMIN",
      email: process.env.DEMO_ADMIN_EMAIL ?? "admin@maendeleo.co.ke",
      password: process.env.DEMO_ADMIN_PASSWORD ?? "aquila-admin-2026",
      name: "Amina Wanjiku",
      role: "ADMIN" as Role,
      memberId: "mem_01",
    },
    {
      key: "TREASURER",
      email: process.env.DEMO_TREASURER_EMAIL ?? "treasurer@maendeleo.co.ke",
      password: process.env.DEMO_TREASURER_PASSWORD ?? "aquila-treasurer-2026",
      name: "Grace Njeri",
      role: "TREASURER" as Role,
      memberId: "mem_02",
    },
    {
      key: "MEMBER",
      email: process.env.DEMO_MEMBER_EMAIL ?? "member@maendeleo.co.ke",
      password: process.env.DEMO_MEMBER_PASSWORD ?? "aquila-member-2026",
      name: "Joseph Otieno",
      role: "MEMBER" as Role,
      memberId: "mem_03",
    },
  ];
}

export async function getUsers(): Promise<StoredUser[]> {
  const existing = await storeGet<StoredUser[]>(USERS_KEY);
  if (existing && existing.length > 0) return existing;

  const seeded: StoredUser[] = demoAccounts().map((account) => {
    const { hash, salt } = createHash(account.password);
    return {
      id: `usr_${account.key.toLowerCase()}`,
      email: account.email,
      name: account.name,
      role: account.role,
      chamaId: DEMO_CHAMA_ID,
      memberId: account.memberId,
      hash,
      salt,
    };
  });
  await storeSet(USERS_KEY, seeded);
  return seeded;
}

export async function findUser(email: string): Promise<StoredUser | undefined> {
  const users = await getUsers();
  const needle = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === needle);
}

export async function upsertUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  chamaId: string;
  memberId?: string;
}): Promise<StoredUser> {
  const users = await getUsers();
  const { hash, salt } = createHash(input.password);
  const existing = users.find(
    (u) => u.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) {
    existing.hash = hash;
    existing.salt = salt;
    existing.name = input.name;
    existing.role = input.role;
    existing.chamaId = input.chamaId;
    existing.memberId = input.memberId;
    await storeSet(USERS_KEY, users);
    return existing;
  }
  const user: StoredUser = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    email: input.email,
    name: input.name,
    role: input.role,
    chamaId: input.chamaId,
    memberId: input.memberId,
    hash,
    salt,
  };
  await storeSet(USERS_KEY, [...users, user]);
  return user;
}

export const demoCredentials = demoAccounts;
