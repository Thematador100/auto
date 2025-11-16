// services/databaseService.ts
// Real database implementation using IndexedDB for browser-based persistence

import { CompletedReport } from '../types';

const DB_NAME = 'AIAutoProDB';
const DB_VERSION = 1;
const REPORTS_STORE = 'reports';

/**
 * Opens or creates the IndexedDB database
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store for reports if it doesn't exist
      if (!db.objectStoreNames.contains(REPORTS_STORE)) {
        const objectStore = db.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
        // Create indexes for efficient querying
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('vin', 'vehicle.vin', { unique: false });
      }
    };
  });
};

/**
 * Saves a report to IndexedDB
 */
export const saveReportToDB = async (report: CompletedReport): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const request = objectStore.put(report);

    request.onsuccess = () => {
      console.log('[DatabaseService] Report saved successfully:', report.id);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save report to database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Retrieves all reports from IndexedDB
 */
export const getAllReportsFromDB = async (): Promise<CompletedReport[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const reports = request.result as CompletedReport[];
      console.log(`[DatabaseService] Retrieved ${reports.length} reports from database`);
      // Sort by date, newest first
      reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(reports);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve reports from database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Retrieves a single report by ID
 */
export const getReportByIdFromDB = async (reportId: string): Promise<CompletedReport | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const request = objectStore.get(reportId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve report from database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Deletes a report from IndexedDB
 */
export const deleteReportFromDB = async (reportId: string): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const request = objectStore.delete(reportId);

    request.onsuccess = () => {
      console.log('[DatabaseService] Report deleted successfully:', reportId);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete report from database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Retrieves reports for a specific VIN
 */
export const getReportsByVINFromDB = async (vin: string): Promise<CompletedReport[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const index = objectStore.index('vin');
    const request = index.getAll(vin);

    request.onsuccess = () => {
      const reports = request.result as CompletedReport[];
      console.log(`[DatabaseService] Retrieved ${reports.length} reports for VIN ${vin}`);
      // Sort by date, newest first
      reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(reports);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve reports by VIN'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Clears all data from the database (useful for testing or reset)
 */
export const clearAllReportsFromDB = async (): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([REPORTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(REPORTS_STORE);
    const request = objectStore.clear();

    request.onsuccess = () => {
      console.log('[DatabaseService] All reports cleared from database');
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to clear database'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};
