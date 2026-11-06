import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Collection, SavedItem, UserProfile } from '@/types';
import { INITIAL_COLLECTIONS, INITIAL_SAVED_ITEMS } from './initialData';

export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  theme: string;
  createdAt: string;
}

export interface DbSession {
  userId: string;
  expiresAt: number; // timestamp in ms
}

export interface UserStoreData {
  collections: Collection[];
  items: SavedItem[];
}

interface DatabaseStructure {
  users: DbUser[];
  sessions: Record<string, DbSession>;
  userData: Record<string, UserStoreData>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'afterhours_db.json');

// Ensure data folder and file exists
function readDb(): DatabaseStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseStructure = {
        users: [],
        sessions: {},
        userData: {},
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { users: [], sessions: {}, userData: {} };
  }
}

function writeDb(db: DatabaseStructure): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Password hashing helper
function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return `${actualSalt}:${hash}`;
}

function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

export const serverDb = {
  // --- USER AUTHENTICATION ---
  register(username: string, email: string, password: string, displayName?: string): { success: boolean; user?: UserProfile; token?: string; error?: string } {
    const db = readDb();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Uživatelské jméno musí mít alespoň 3 znaky.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Zadej platnou e-mailovou adresu.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Heslo musí mít alespoň 6 znaků.' };
    }

    // Check existing
    const exists = db.users.find(u => u.username === cleanUsername || u.email === cleanEmail);
    if (exists) {
      return { success: false, error: 'Uživatel s tímto jménem nebo e-mailem již existuje.' };
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newUser: DbUser = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      displayName: displayName?.trim() || username.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      bio: 'Noční průzkumník v AFTERHOURS.',
      theme: 'nocturne',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Initialize user's personal collections and sample items
    db.userData[userId] = {
      collections: INITIAL_COLLECTIONS.map(col => ({
        ...col,
        id: `col_${userId}_${col.id.replace('col_', '')}`,
      })),
      items: INITIAL_SAVED_ITEMS.map(item => ({
        ...item,
        id: `item_${userId}_${item.id.replace('item_', '')}`,
        collectionIds: item.collectionIds.map(cid => `col_${userId}_${cid.replace('col_', '')}`),
      })),
    };

    // Create session token (valid for 30 days)
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions[token] = {
      userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    writeDb(db);

    const profile: UserProfile = {
      id: newUser.id,
      displayName: newUser.displayName,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
      theme: newUser.theme as any,
      joinedDate: 'Člen od ' + new Date(newUser.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
      stats: {
        totalSaved: db.userData[userId].items.length,
        completed: db.userData[userId].items.filter(i => i.status === 'completed').length,
        collectionsCount: db.userData[userId].collections.length,
      },
    };

    return { success: true, user: profile, token };
  },

  login(loginIdentifier: string, password: string): { success: boolean; user?: UserProfile; token?: string; error?: string } {
    const db = readDb();
    const cleanId = loginIdentifier.trim().toLowerCase();

    const user = db.users.find(u => u.username === cleanId || u.email === cleanId);
    if (!user) {
      return { success: false, error: 'Nesprávné uživatelské jméno nebo heslo.' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Nesprávné uživatelské jméno nebo heslo.' };
    }

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions[token] = {
      userId: user.id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    writeDb(db);

    const userStore = db.userData[user.id] || { collections: [], items: [] };

    const profile: UserProfile = {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      theme: user.theme as any,
      joinedDate: 'Člen od ' + new Date(user.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
      stats: {
        totalSaved: userStore.items.length,
        completed: userStore.items.filter(i => i.status === 'completed').length,
        collectionsCount: userStore.collections.length,
      },
    };

    return { success: true, user: profile, token };
  },

  logout(token: string): boolean {
    const db = readDb();
    if (db.sessions[token]) {
      delete db.sessions[token];
      writeDb(db);
      return true;
    }
    return false;
  },

  getUserByToken(token: string): { user: UserProfile; data: UserStoreData } | null {
    if (!token) return null;
    const db = readDb();
    const session = db.sessions[token];

    if (!session || session.expiresAt < Date.now()) {
      if (session) {
        delete db.sessions[token];
        writeDb(db);
      }
      return null;
    }

    const user = db.users.find(u => u.id === session.userId);
    if (!user) return null;

    const userStore = db.userData[user.id] || { collections: [], items: [] };

    const profile: UserProfile = {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      theme: user.theme as any,
      joinedDate: 'Člen od ' + new Date(user.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
      stats: {
        totalSaved: userStore.items.length,
        completed: userStore.items.filter(i => i.status === 'completed').length,
        collectionsCount: userStore.collections.length,
      },
    };

    return { user: profile, data: userStore };
  },

  updateUserProfile(userId: string, updates: Partial<UserProfile>): boolean {
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    if (updates.displayName) db.users[userIndex].displayName = updates.displayName.trim();
    if (updates.avatarUrl) db.users[userIndex].avatarUrl = updates.avatarUrl;
    if (updates.bio !== undefined) db.users[userIndex].bio = updates.bio;
    if (updates.theme) db.users[userIndex].theme = updates.theme;

    writeDb(db);
    return true;
  },

  // --- USER DATA PERSISTENCE ---
  saveUserData(userId: string, data: { collections?: Collection[]; items?: SavedItem[] }): boolean {
    const db = readDb();
    if (!db.userData[userId]) {
      db.userData[userId] = { collections: [], items: [] };
    }

    if (data.collections) {
      db.userData[userId].collections = data.collections;
    }
    if (data.items) {
      db.userData[userId].items = data.items;
    }

    writeDb(db);
    return true;
  },

  getUserData(userId: string): UserStoreData {
    const db = readDb();
    return db.userData[userId] || { collections: [], items: [] };
  },
};
