/**
 * Local JSON-file database fallback for development.
 * Used when MONGODB_URI is not configured.
 * Mimics Mongoose model API (find, findOne, save, etc.)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'local-data.json');

interface DbData {
  users: any[];
  foodrequests: any[];
}

function readDb(): DbData {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local DB:', e);
  }
  return { users: [], foodrequests: [] };
}

function writeDb(data: DbData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return crypto.randomBytes(12).toString('hex');
}

// ---- Mongoose-like Document wrapper ----
class LocalDocument {
  [key: string]: any;
  _collection: string;

  constructor(data: any, collection: string) {
    Object.assign(this, data);
    this._collection = collection;
  }

  async save(): Promise<this> {
    const db = readDb();
    const col = db[this._collection as keyof DbData] as any[];
    const idx = col.findIndex((item: any) => item._id === this._id);
    
    const plainData: any = {};
    for (const key of Object.keys(this)) {
      if (key !== '_collection') plainData[key] = this[key];
    }
    
    if (idx >= 0) {
      plainData.updatedAt = new Date().toISOString();
      col[idx] = plainData;
    } else {
      plainData.createdAt = plainData.createdAt || new Date().toISOString();
      plainData.updatedAt = new Date().toISOString();
      col.push(plainData);
    }
    writeDb(db);
    return this;
  }

  toJSON() {
    const obj: any = {};
    for (const key of Object.keys(this)) {
      if (key !== '_collection') obj[key] = this[key];
    }
    return obj;
  }

  toString() {
    return this._id;
  }
}

// ---- Populate helper ----
function populateField(doc: any, field: string, selectFields: string, db: DbData): any {
  if (!doc[field]) return doc;
  const userId = typeof doc[field] === 'object' ? doc[field]._id || doc[field] : doc[field];
  const user = db.users.find((u: any) => u._id === userId);
  if (user) {
    const fields = selectFields.split(' ');
    const populated: any = { _id: user._id };
    for (const f of fields) {
      if (user[f] !== undefined) populated[f] = user[f];
    }
    doc[field] = populated;
  }
  return doc;
}

// ---- Query builder (chainable .populate()) ----
class LocalQuery {
  private _results: any[];
  private _collection: string;
  private _populates: { field: string; select: string }[] = [];

  constructor(results: any[], collection: string) {
    this._results = results;
    this._collection = collection;
  }

  populate(field: string, select: string = ''): LocalQuery {
    this._populates.push({ field, select });
    return this;
  }

  select(fields: string): LocalQuery {
    if (fields.startsWith('-')) {
      const exclude = fields.replace('-', '');
      this._results = this._results.map((doc: any) => {
        const copy = { ...doc };
        delete copy[exclude];
        return copy;
      });
    }
    return this;
  }

  async then(resolve: (value: any) => any, reject?: (reason?: any) => any): Promise<any> {
    try {
      const db = readDb();
      let results = this._results.map((r: any) => ({ ...r }));
      for (const pop of this._populates) {
        results = results.map((doc: any) => populateField(doc, pop.field, pop.select, db));
      }
      resolve(results);
    } catch (e) {
      if (reject) reject(e);
    }
  }
}

// ---- Local Model (mimics Mongoose Model) ----
export class LocalModel {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  create(data: any): LocalDocument {
    const doc = new LocalDocument(
      { _id: generateId(), ...data },
      this.collectionName
    );
    return doc;
  }

  find(filter: any = {}): LocalQuery {
    const db = readDb();
    const col = db[this.collectionName as keyof DbData] || [];
    const results = col.filter((item: any) => {
      for (const key of Object.keys(filter)) {
        if (String(item[key]) !== String(filter[key])) return false;
      }
      return true;
    });
    return new LocalQuery(results, this.collectionName);
  }

  async findOne(filter: any = {}): Promise<LocalDocument | null> {
    const db = readDb();
    const col = db[this.collectionName as keyof DbData] || [];
    const found = col.find((item: any) => {
      for (const key of Object.keys(filter)) {
        if (String(item[key]) !== String(filter[key])) return false;
      }
      return true;
    });
    return found ? new LocalDocument({ ...found }, this.collectionName) : null;
  }

  async findById(id: string): Promise<LocalDocument | null> {
    return this.findOne({ _id: id });
  }

  async findByIdAndDelete(id: string): Promise<any> {
    const db = readDb();
    const col = db[this.collectionName as keyof DbData] as any[];
    const idx = col.findIndex((item: any) => item._id === id);
    if (idx >= 0) {
      const removed = col.splice(idx, 1)[0];
      writeDb(db);
      return removed;
    }
    return null;
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const db = readDb();
    const col = db[this.collectionName as keyof DbData] || [];
    if (Object.keys(filter).length === 0) return col.length;
    return col.filter((item: any) => {
      for (const key of Object.keys(filter)) {
        if (String(item[key]) !== String(filter[key])) return false;
      }
      return true;
    }).length;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    const db = readDb();
    let col = [...(db[this.collectionName as keyof DbData] || [])];

    for (const stage of pipeline) {
      if (stage.$match) {
        col = col.filter((item: any) => {
          for (const [key, val] of Object.entries(stage.$match)) {
            if (String(item[key]) !== String(val)) return false;
          }
          return true;
        });
      }
      if (stage.$lookup) {
        const { from, localField, foreignField, as: asField } = stage.$lookup;
        const foreignCol = db[from as keyof DbData] || [];
        col = col.map((item: any) => ({
          ...item,
          [asField]: foreignCol.filter((f: any) => String(f[foreignField]) === String(item[localField]))
        }));
      }
      if (stage.$project) {
        col = col.map((item: any) => {
          const result: any = { _id: item._id };
          for (const [key, val] of Object.entries(stage.$project)) {
            if (key === '_id' && val === 0) {
              delete result._id;
              continue;
            }
            if (val === 1) {
              result[key] = item[key];
            } else if (typeof val === 'object' && (val as any).$size) {
              const arrField = (val as any).$size.replace('$', '');
              result[key] = Array.isArray(item[arrField]) ? item[arrField].length : 0;
            }
          }
          return result;
        });
      }
      if (stage.$group) {
        const grouped: any = { _id: stage.$group._id };
        // Basic grouping logic for $sum
        for (const [key, op] of Object.entries(stage.$group)) {
          if (key === '_id') continue;
          if (typeof op === 'object' && (op as any).$sum) {
            const field = (op as any).$sum.replace('$', '');
            grouped[key] = col.reduce((sum: number, item: any) => sum + (Number(item[field]) || 0), 0);
          }
        }
        col = [grouped];
      }
    }

    return col;
  }
}

// ---- Pre-built models ----
export const LocalUserModel = new LocalModel('users');
export const LocalFoodRequestModel = new LocalModel('foodrequests');

// ---- Connection state mock ----
export const localDbState = {
  readyState: 1 as number, // always "connected"
  isLocal: true
};

console.log('📂 Using local JSON file database (local-data.json)');
console.log('   To use MongoDB Atlas instead, set MONGODB_URI in .env');
