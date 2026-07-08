(function () {
  const DB_NAME = "molde-momentos-dashboard";
  const DB_VERSION = 1;
  const DATASET_KEY = "current";
  const STORE_NAME = "dataset";

  let dbPromise = null;

  function createEmptySnapshot() {
    return {
      id: DATASET_KEY,
      pedidos: [],
      contas: [],
      indicadores: [],
      importMeta: {
        pedidos: null,
        contas: null,
        indicadores: null
      },
      normalizedAt: null
    };
  }

  function open() {
    if (dbPromise) {
      return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error || new Error("Não foi possível abrir IndexedDB."));
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
    return dbPromise;
  }

  function saveDataset(snapshot) {
    const payload = {
      ...createEmptySnapshot(),
      ...snapshot,
      id: DATASET_KEY,
      normalizedAt: snapshot.normalizedAt || new Date().toISOString()
    };
    return open().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.oncomplete = () => resolve(payload);
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE_NAME).put(payload);
        })
    );
  }

  function loadDataset() {
    return open().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const request = tx.objectStore(STORE_NAME).get(DATASET_KEY);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        })
    );
  }

  async function upsertSource(kind, rows, metadata, validationReport) {
    const current = (await loadDataset()) || createEmptySnapshot();
    const next = {
      ...current,
      importMeta: {
        ...current.importMeta,
        [kind]: {
          fileName: metadata?.fileName || "",
          importedAt: metadata?.importedAt || new Date().toISOString(),
          sheetNames: metadata?.sheetNames || [],
          rowCount: metadata?.rowCount || rows.length,
          validationStatus: validationReport?.status || null
        }
      },
      normalizedAt: new Date().toISOString()
    };

    if (kind === "pedidos") {
      next.pedidos = rows;
    } else if (kind === "contas") {
      next.contas = rows;
    } else if (kind === "indicadores") {
      next.indicadores = rows;
    }

    return saveDataset(next);
  }

  function clearDataset() {
    return open().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.oncomplete = () => resolve(null);
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE_NAME).delete(DATASET_KEY);
        })
    );
  }

  window.MoldeStore = {
    DB_NAME,
    DATASET_KEY,
    open,
    saveDataset,
    loadDataset,
    upsertSource,
    clearDataset,
    createEmptySnapshot
  };
})();
