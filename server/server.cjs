const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Support JSON bodies up to 50MB (for base64 image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers to read/write JSON files
function readData(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Seed default users if users file is empty or doesn't exist
const seedAccounts = [];

readData(USERS_FILE, seedAccounts);
readData(JOBS_FILE, []);
readData(APPLICATIONS_FILE, []);
readData(MESSAGES_FILE, []);
readData(NOTIFICATIONS_FILE, []);

// Endpoints
// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const accounts = readData(USERS_FILE, seedAccounts);
  const account = accounts.find(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (account && account.password === password) {
    return res.json({ user: account.profile });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const accounts = readData(USERS_FILE, seedAccounts);
  if (accounts.some(a => a.profile.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    name,
    email,
    phone: phone || '',
    avatar: '',
    bio: '',
    skills: [],
    completedJobs: 0,
    rating: 0,
    reviews: [],
    isAdmin: false,
  };

  accounts.push({ password, profile: newUser });
  writeData(USERS_FILE, accounts);

  return res.json({ user: newUser });
});

// Update Profile
app.post('/api/auth/update', (req, res) => {
  const { email, updates } = req.body;
  if (!email || !updates) {
    return res.status(400).json({ error: 'Email and updates are required' });
  }

  const accounts = readData(USERS_FILE, seedAccounts);
  const accountIndex = accounts.findIndex(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (accountIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedProfile = { ...accounts[accountIndex].profile, ...updates };
  accounts[accountIndex].profile = updatedProfile;
  writeData(USERS_FILE, accounts);

  return res.json({ user: updatedProfile });
});

// Get all users (profiles only)
app.get('/api/users', (req, res) => {
  const accounts = readData(USERS_FILE, seedAccounts);
  const profiles = accounts.map(a => a.profile);
  res.json(profiles);
});

// Get Jobs
app.get('/api/jobs', (req, res) => {
  const jobs = readData(JOBS_FILE, []);
  res.json(jobs);
});

// Add Job
app.post('/api/jobs', (req, res) => {
  const job = req.body;
  if (!job.title || !job.employer) {
    return res.status(400).json({ error: 'Title and employer are required' });
  }

  const jobs = readData(JOBS_FILE, []);
  const newJob = { ...job, id: Date.now() };
  jobs.unshift(newJob);
  writeData(JOBS_FILE, jobs);

  res.json(newJob);
});

// Get Applications
app.get('/api/applications', (req, res) => {
  const applications = readData(APPLICATIONS_FILE, []);
  res.json(applications);
});

// Submit Application
app.post('/api/applications', (req, res) => {
  const appData = req.body;
  if (!appData.jobId || !appData.applicantName) {
    return res.status(400).json({ error: 'JobId and applicantName are required' });
  }

  const applications = readData(APPLICATIONS_FILE, []);
  const newApp = {
    ...appData,
    id: Date.now(),
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  applications.unshift(newApp);
  writeData(APPLICATIONS_FILE, applications);

  res.json(newApp);
});

// Update Application Status
app.post('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || (status !== 'accepted' && status !== 'rejected' && status !== 'abandoned')) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  const applications = readData(APPLICATIONS_FILE, []);
  const index = applications.findIndex(a => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  applications[index].status = status;
  writeData(APPLICATIONS_FILE, applications);

  res.json(applications[index]);
});

// Get Notifications
app.get('/api/notifications', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const allNotifs = readData(NOTIFICATIONS_FILE, []);
  const userNotifs = allNotifs.filter(n => n.userEmail === email);
  res.json(userNotifs);
});

// Add Notification
app.post('/api/notifications', (req, res) => {
  const notif = req.body;
  const allNotifs = readData(NOTIFICATIONS_FILE, []);
  allNotifs.unshift(notif);
  writeData(NOTIFICATIONS_FILE, allNotifs);
  res.json(notif);
});

// Mark Notification Read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const allNotifs = readData(NOTIFICATIONS_FILE, []);
  const index = allNotifs.findIndex(n => n.id === id);
  if (index !== -1) {
    allNotifs[index].read = true;
    writeData(NOTIFICATIONS_FILE, allNotifs);
  }
  res.json({ success: true });
});

// Clear Notifications
app.delete('/api/notifications', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  let allNotifs = readData(NOTIFICATIONS_FILE, []);
  allNotifs = allNotifs.filter(n => n.userEmail !== email);
  writeData(NOTIFICATIONS_FILE, allNotifs);
  res.json({ success: true });
});

// Delete account
app.delete('/api/auth/delete', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const accounts = readData(USERS_FILE, seedAccounts);
  const accountIndex = accounts.findIndex(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (accountIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const username = accounts[accountIndex].profile.name;

  // 1. Delete user account
  accounts.splice(accountIndex, 1);
  writeData(USERS_FILE, accounts);

  // 2. Delete messages sent/received by this user
  const messages = readData(MESSAGES_FILE, []);
  const remainingMessages = messages.filter(m => 
    m.senderEmail.toLowerCase() !== email.toLowerCase() && 
    m.receiverEmail.toLowerCase() !== email.toLowerCase()
  );
  writeData(MESSAGES_FILE, remainingMessages);

  // 3. Delete jobs posted by this user
  const jobs = readData(JOBS_FILE, []);
  const deletedJobIds = new Set(
    jobs.filter(j => j.employer.toLowerCase() === username.toLowerCase()).map(j => j.id)
  );
  const remainingJobs = jobs.filter(j => j.employer.toLowerCase() !== username.toLowerCase());
  writeData(JOBS_FILE, remainingJobs);

  // 4. Delete applications submitted by this user OR to their deleted jobs
  const applications = readData(APPLICATIONS_FILE, []);
  const remainingApps = applications.filter(app => 
    app.applicantName.toLowerCase() !== username.toLowerCase() && 
    !deletedJobIds.has(app.jobId)
  );
  writeData(APPLICATIONS_FILE, remainingApps);

  return res.json({ message: 'Account deleted successfully' });
});

// Get messages
app.get('/api/messages', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const messages = readData(MESSAGES_FILE, []);
  const userMessages = messages.filter(m => 
    m.senderEmail.toLowerCase() === email.toLowerCase() || 
    m.receiverEmail.toLowerCase() === email.toLowerCase()
  );
  res.json(userMessages);
});

// Send message
app.post('/api/messages', (req, res) => {
  const { senderEmail, receiverEmail, text } = req.body;
  if (!senderEmail || !receiverEmail || !text) {
    return res.status(400).json({ error: 'senderEmail, receiverEmail, and text are required' });
  }

  const messages = readData(MESSAGES_FILE, []);
  
  const hasAccepted = messages.some(m => 
    m.isAccepted && 
    ((m.senderEmail.toLowerCase() === senderEmail.toLowerCase() && m.receiverEmail.toLowerCase() === receiverEmail.toLowerCase()) ||
     (m.senderEmail.toLowerCase() === receiverEmail.toLowerCase() && m.receiverEmail.toLowerCase() === senderEmail.toLowerCase()))
  );

  let isAccepted = hasAccepted;
  if (!hasAccepted) {
    const lastMsg = [...messages].reverse().find(m => 
      (m.senderEmail.toLowerCase() === receiverEmail.toLowerCase() && m.receiverEmail.toLowerCase() === senderEmail.toLowerCase())
    );
    if (lastMsg) {
      isAccepted = true;
      messages.forEach(m => {
        if ((m.senderEmail.toLowerCase() === senderEmail.toLowerCase() && m.receiverEmail.toLowerCase() === receiverEmail.toLowerCase()) ||
            (m.senderEmail.toLowerCase() === receiverEmail.toLowerCase() && m.receiverEmail.toLowerCase() === senderEmail.toLowerCase())) {
          m.isAccepted = true;
        }
      });
    }
  }

  const newMsg = {
    id: Date.now(),
    senderEmail,
    receiverEmail,
    text,
    timestamp: new Date().toISOString(),
    isAccepted
  };

  messages.push(newMsg);
  writeData(MESSAGES_FILE, messages);
  res.json(newMsg);
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeedE backend server running on http://0.0.0.0:${PORT}`);
});
