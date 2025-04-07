let db = null;
const DB_NAME = 'FireDoorDB';
const STORE_NAME = 'surveys';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    console.log('Opening database:', DB_NAME);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      console.log('Database opened successfully');
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('Database upgrade needed');
      const database = event.target.result;
      
      // Delete the old object store if it exists
      if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
      }
      
      // Create the new object store
      const store = database.createObjectStore(STORE_NAME, { keyPath: 'doorPinNo' });
      store.createIndex('doorPinNo', 'doorPinNo', { unique: true });
      console.log('Object store created');
    };
  });
};

// Get all surveys from IndexedDB
export const getAllSurveys = async () => {
  try {
    console.log('Getting all surveys...');
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Creating transaction...');
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        console.log('Executing getAll request...');
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result || [];
          console.log('Successfully retrieved surveys:', results);
          resolve(results);
        };

        request.onerror = (event) => {
          console.error('Error getting surveys:', event.target.error);
          reject('Error getting surveys');
        };

        transaction.oncomplete = () => {
          console.log('Transaction completed successfully');
        };

        transaction.onerror = (event) => {
          console.error('Transaction error:', event.target.error);
          reject('Transaction error');
        };
      } catch (error) {
        console.error('Error in transaction setup:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in getAllSurveys:', error);
    throw error;
  }
};

// Save survey to IndexedDB
export const saveSurvey = async (survey) => {
  try {
    console.log('Saving survey:', survey);
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Ensure doorPinNo is a string
        const surveyToSave = {
          ...survey,
          doorPinNo: String(survey.doorPinNo)
        };
        
        const request = store.put(surveyToSave);

        request.onsuccess = () => {
          console.log('Successfully saved survey:', surveyToSave.doorPinNo);
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Error saving survey:', event.target.error);
          reject('Error saving survey');
        };

        transaction.oncomplete = () => {
          console.log('Save transaction completed successfully');
        };
      } catch (error) {
        console.error('Error in save transaction setup:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in saveSurvey:', error);
    throw error;
  }
};

// Get a single survey by door number
export const getSurvey = async (doorNumber) => {
  try {
    console.log('Getting survey for door:', doorNumber);
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(String(doorNumber));

        request.onsuccess = () => {
          console.log('Retrieved survey:', request.result);
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Error getting survey:', event.target.error);
          reject('Error getting survey');
        };
      } catch (error) {
        console.error('Error in get transaction setup:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in getSurvey:', error);
    throw error;
  }
};

// Add this function after your other database functions
export const clearAllSurveys = async () => {
  try {
    console.log('Clearing all surveys from database...');
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Clear all records
        const request = store.clear();

        request.onsuccess = () => {
          console.log('Successfully cleared all surveys');
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('Error clearing surveys:', event.target.error);
          reject('Error clearing surveys');
        };

        transaction.oncomplete = () => {
          console.log('Clear transaction completed successfully');
        };
      } catch (error) {
        console.error('Error in clear transaction setup:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in clearAllSurveys:', error);
    throw error;
  }
}; 