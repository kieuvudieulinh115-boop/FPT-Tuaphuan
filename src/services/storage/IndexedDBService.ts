import { Question, TeacherSettingsConfig, PuzzlePiece, QuestionSet } from '../../types';
import { INITIAL_STEM_QUESTIONS } from '../../data/initialQuestions';
import { DEFAULT_PUZZLE_PIECES } from '../../data/puzzlePieces';
import { CHALLENGE_LIBRARY } from '../../data/challenges';
import { DEFAULT_QUESTION_SETS } from '../../data/questionSets';

const DB_NAME = 'FaceChallenge_STEM_DB';
const DB_VERSION = 2;

const STORE_QUESTIONS = 'questions';
const STORE_SETTINGS = 'settings';
const STORE_PUZZLE = 'puzzle_pieces';
const STORE_QUESTION_SETS = 'question_sets';

const LOCALSTORAGE_SETS_KEY = 'fc_teacher_question_sets';
const LOCALSTORAGE_ACTIVE_SET_KEY = 'fc_teacher_active_set_id';

const DEFAULT_SETTINGS: TeacherSettingsConfig = {
  timerSeconds: 10,
  passThreshold: 65,
  randomChallenges: false,
  enabledChallenges: CHALLENGE_LIBRARY.map(c => c.id),
  schoolName: 'Trường Tiểu học STEM Tân Tiến',
  teacherName: 'Ban Cố vấn Chuyên môn STEM',
  activeQuestionSetId: 'set_lop3_tinhoc',
  puzzleImageUrl: '/assets/stem.svg',
  puzzleThemeTitle: 'STEM - Khoa học, Công nghệ, Kỹ thuật & Toán học'
};

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
          const qStore = db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
          INITIAL_STEM_QUESTIONS.forEach(q => qStore.add(q));
        }

        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          const sStore = db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          sStore.add({ key: 'main_config', ...DEFAULT_SETTINGS });
        }

        if (!db.objectStoreNames.contains(STORE_PUZZLE)) {
          const pStore = db.createObjectStore(STORE_PUZZLE, { keyPath: 'id' });
          DEFAULT_PUZZLE_PIECES.forEach(p => pStore.add(p));
        }

        if (!db.objectStoreNames.contains(STORE_QUESTION_SETS)) {
          const qsStore = db.createObjectStore(STORE_QUESTION_SETS, { keyPath: 'id' });
          DEFAULT_QUESTION_SETS.forEach(qs => qsStore.add(qs));
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB open failed:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Questions ---
  async getQuestions(): Promise<Question[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_QUESTIONS, 'readonly');
        const store = tx.objectStore(STORE_QUESTIONS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: Question[] = req.result;
          if (!list || list.length === 0) {
            this.saveQuestions(INITIAL_STEM_QUESTIONS).then(() => resolve(INITIAL_STEM_QUESTIONS));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to memory/local storage for questions', e);
      return INITIAL_STEM_QUESTIONS;
    }
  }

  async saveQuestions(questions: Question[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUESTIONS, 'readwrite');
      const store = tx.objectStore(STORE_QUESTIONS);
      store.clear().onsuccess = () => {
        questions.forEach(q => store.add(q));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Settings ---
  async getSettings(): Promise<TeacherSettingsConfig> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get('main_config');
        req.onsuccess = () => {
          if (req.result) {
            const { key, ...rest } = req.result;
            const loaded = { ...DEFAULT_SETTINGS, ...rest };
            // Auto-migrate legacy 80 threshold to new 65 passing standard
            if (loaded.passThreshold === 80) {
              loaded.passThreshold = 65;
            }
            resolve(loaded);
          } else {
            resolve(DEFAULT_SETTINGS);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to default settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: TeacherSettingsConfig): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key: 'main_config', ...settings });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Puzzle Pieces ---
  async getPuzzlePieces(): Promise<PuzzlePiece[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PUZZLE, 'readonly');
        const store = tx.objectStore(STORE_PUZZLE);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: PuzzlePiece[] = req.result;
          if (!list || list.length === 0) {
            this.savePuzzlePieces(DEFAULT_PUZZLE_PIECES).then(() => resolve(DEFAULT_PUZZLE_PIECES));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to default puzzle pieces', e);
      return DEFAULT_PUZZLE_PIECES;
    }
  }

  async savePuzzlePieces(pieces: PuzzlePiece[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PUZZLE, 'readwrite');
      const store = tx.objectStore(STORE_PUZZLE);
      store.clear().onsuccess = () => {
        pieces.forEach(p => store.add(p));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Question Sets ---
  async getQuestionSets(): Promise<QuestionSet[]> {
    // Check LocalStorage first for instant recovery / offline reliability
    try {
      const localData = localStorage.getItem(LOCALSTORAGE_SETS_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    try {
      const db = await this.openDB();
      if (!db.objectStoreNames.contains(STORE_QUESTION_SETS)) {
        this.saveQuestionSets(DEFAULT_QUESTION_SETS);
        return DEFAULT_QUESTION_SETS;
      }

      return new Promise((resolve) => {
        const tx = db.transaction(STORE_QUESTION_SETS, 'readonly');
        const store = tx.objectStore(STORE_QUESTION_SETS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: QuestionSet[] = req.result;
          if (!list || list.length === 0) {
            this.saveQuestionSets(DEFAULT_QUESTION_SETS).then(() => resolve(DEFAULT_QUESTION_SETS));
          } else {
            // Cache to localStorage
            try {
              localStorage.setItem(LOCALSTORAGE_SETS_KEY, JSON.stringify(list));
            } catch {
              // ignore
            }
            resolve(list);
          }
        };
        req.onerror = () => {
          resolve(DEFAULT_QUESTION_SETS);
        };
      });
    } catch (e) {
      console.warn('Fallback to DEFAULT_QUESTION_SETS', e);
      return DEFAULT_QUESTION_SETS;
    }
  }

  async saveQuestionSets(sets: QuestionSet[]): Promise<void> {
    // Write to LocalStorage
    try {
      localStorage.setItem(LOCALSTORAGE_SETS_KEY, JSON.stringify(sets));
    } catch (err) {
      console.warn('Failed saving sets to localStorage', err);
    }

    try {
      const db = await this.openDB();
      if (!db.objectStoreNames.contains(STORE_QUESTION_SETS)) return;

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_QUESTION_SETS, 'readwrite');
        const store = tx.objectStore(STORE_QUESTION_SETS);
        store.clear().onsuccess = () => {
          sets.forEach(s => store.add(s));
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Handled via localStorage
    }
  }

  async getActiveQuestionSetId(): Promise<string> {
    try {
      const savedId = localStorage.getItem(LOCALSTORAGE_ACTIVE_SET_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return 'set_lop3_tinhoc';
  }

  async setActiveQuestionSetId(id: string): Promise<void> {
    try {
      localStorage.setItem(LOCALSTORAGE_ACTIVE_SET_KEY, id);
    } catch {
      // ignore
    }
  }

  async resetToDefaults(): Promise<void> {
    await this.saveQuestions(INITIAL_STEM_QUESTIONS);
    await this.saveSettings(DEFAULT_SETTINGS);
    await this.savePuzzlePieces(DEFAULT_PUZZLE_PIECES);
    await this.saveQuestionSets(DEFAULT_QUESTION_SETS);
    await this.setActiveQuestionSetId('set_lop3_tinhoc');
  }
}

export const dbService = new IndexedDBService();
