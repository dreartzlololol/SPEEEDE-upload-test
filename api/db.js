const fs = require('fs');
const path = require('path');

// In-memory cache for serverless environments
let memoryStore = {
  users: [],
  jobs: [],
  applications: [],
  messages: [],
  notifications: []
};

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Initialize local files if running locally
function initLocalFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Ignore in read-only serverless environments like Vercel
  }
}

function readJSON(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`File read fallback for ${filePath}`);
  }
  return defaultVal;
}

function writeJSON(filePath, data) {
  try {
    if (fs.existsSync(path.dirname(filePath))) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.warn(`File write skipped for ${filePath} in serverless environment`);
  }
}

// Initialize memoryStore from local disk if available
initLocalFiles();
memoryStore.users = readJSON(USERS_FILE, []);
memoryStore.jobs = readJSON(JOBS_FILE, []);
memoryStore.applications = readJSON(APPLICATIONS_FILE, []);
memoryStore.messages = readJSON(MESSAGES_FILE, []);
memoryStore.notifications = readJSON(NOTIFICATIONS_FILE, []);

// Database helper module for Vercel & Local
const db = {
  getUsers: async () => memoryStore.users,
  saveUsers: async (users) => {
    memoryStore.users = users;
    writeJSON(USERS_FILE, users);
  },

  getJobs: async () => memoryStore.jobs,
  saveJobs: async (jobs) => {
    memoryStore.jobs = jobs;
    writeJSON(JOBS_FILE, jobs);
  },

  getApplications: async () => memoryStore.applications,
  saveApplications: async (applications) => {
    memoryStore.applications = applications;
    writeJSON(APPLICATIONS_FILE, applications);
  },

  getMessages: async () => memoryStore.messages,
  saveMessages: async (messages) => {
    memoryStore.messages = messages;
    writeJSON(MESSAGES_FILE, messages);
  },

  getNotifications: async () => memoryStore.notifications,
  saveNotifications: async (notifications) => {
    memoryStore.notifications = notifications;
    writeJSON(NOTIFICATIONS_FILE, notifications);
  }
};

module.exports = db;
