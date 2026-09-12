const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');

const app = express();
const serverStartId = Date.now().toString();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server Info Endpoint
app.get('/api/server-info', (req, res) => {
  res.json({ serverStartId, status: 'online', database: 'connected' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const accounts = await db.getUsers();
  const account = accounts.find(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (account && account.password === password) {
    return res.json({ user: account.profile });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPhone = phone ? phone.trim() : '';

  const accounts = await db.getUsers();
  if (accounts.some(a => a.profile.email.trim().toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
    bio: '',
    skills: [],
    completedJobs: 0,
    rating: 5.0,
    reviews: [],
    isAdmin: false,
    friends: [],
    friendTags: {}
  };

  accounts.push({ password, profile: newUser });
  await db.saveUsers(accounts);

  return res.json({ user: newUser });
});

// Update Profile
app.post('/api/auth/update', async (req, res) => {
  const { email, updates } = req.body;
  if (!email || !updates) {
    return res.status(400).json({ error: 'Email and updates are required' });
  }

  const accounts = await db.getUsers();
  const accountIndex = accounts.findIndex(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (accountIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedProfile = { ...accounts[accountIndex].profile, ...updates };
  accounts[accountIndex].profile = updatedProfile;
  await db.saveUsers(accounts);

  return res.json({ user: updatedProfile });
});

// Get all users
app.get('/api/users', async (req, res) => {
  const accounts = await db.getUsers();
  const profiles = accounts.map(a => a.profile);
  res.json(profiles);
});

// Delete account
app.delete('/api/auth/delete', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const accounts = await db.getUsers();
  const accountIndex = accounts.findIndex(a => a.profile.email.toLowerCase() === email.toLowerCase());

  if (accountIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const username = accounts[accountIndex].profile.name;
  accounts.splice(accountIndex, 1);
  await db.saveUsers(accounts);

  const messages = await db.getMessages();
  const remainingMessages = messages.filter(m => 
    m.senderEmail.toLowerCase() !== email.toLowerCase() && 
    m.receiverEmail.toLowerCase() !== email.toLowerCase()
  );
  await db.saveMessages(remainingMessages);

  const jobs = await db.getJobs();
  const deletedJobIds = new Set(
    jobs.filter(j => j.employer.toLowerCase() === username.toLowerCase()).map(j => j.id)
  );
  const remainingJobs = jobs.filter(j => j.employer.toLowerCase() !== username.toLowerCase());
  await db.saveJobs(remainingJobs);

  const applications = await db.getApplications();
  const remainingApps = applications.filter(app => 
    app.applicantName.toLowerCase() !== username.toLowerCase() && 
    !deletedJobIds.has(app.jobId)
  );
  await db.saveApplications(remainingApps);

  return res.json({ message: 'Account deleted successfully' });
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  const jobs = await db.getJobs();
  res.json(jobs);
});

app.post('/api/jobs', async (req, res) => {
  const job = req.body;
  if (!job.title || !job.employer) {
    return res.status(400).json({ error: 'Title and employer are required' });
  }

  const jobs = await db.getJobs();
  const newJob = { ...job, id: Date.now() };
  jobs.unshift(newJob);
  await db.saveJobs(jobs);

  res.json(newJob);
});

// Applications
app.get('/api/applications', async (req, res) => {
  const applications = await db.getApplications();
  res.json(applications);
});

app.post('/api/applications', async (req, res) => {
  const appData = req.body;
  if (!appData.jobId || !appData.applicantName) {
    return res.status(400).json({ error: 'JobId and applicantName are required' });
  }

  const applications = await db.getApplications();
  const newApp = {
    ...appData,
    id: Date.now(),
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  applications.unshift(newApp);
  await db.saveApplications(applications);

  res.json(newApp);
});

app.post('/api/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || (status !== 'accepted' && status !== 'rejected' && status !== 'abandoned')) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  const applications = await db.getApplications();
  const index = applications.findIndex(a => a.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  applications[index].status = status;
  await db.saveApplications(applications);

  res.json(applications[index]);
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const allNotifs = await db.getNotifications();
  const userNotifs = allNotifs.filter(n => n.userEmail === email);
  res.json(userNotifs);
});

app.post('/api/notifications', async (req, res) => {
  const notif = req.body;
  const allNotifs = await db.getNotifications();
  allNotifs.unshift(notif);
  await db.saveNotifications(allNotifs);
  res.json(notif);
});

app.post('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  const allNotifs = await db.getNotifications();
  const index = allNotifs.findIndex(n => n.id === id);
  if (index !== -1) {
    allNotifs[index].read = true;
    await db.saveNotifications(allNotifs);
  }
  res.json({ success: true });
});

app.delete('/api/notifications', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  let allNotifs = await db.getNotifications();
  allNotifs = allNotifs.filter(n => n.userEmail !== email);
  await db.saveNotifications(allNotifs);
  res.json({ success: true });
});

// Messages
app.get('/api/messages', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const messages = await db.getMessages();
  const userMessages = messages.filter(m => 
    m.senderEmail.toLowerCase() === email.toLowerCase() || 
    m.receiverEmail.toLowerCase() === email.toLowerCase()
  );
  res.json(userMessages);
});

app.post('/api/messages', async (req, res) => {
  const { senderEmail, receiverEmail, text } = req.body;
  if (!senderEmail || !receiverEmail || !text) {
    return res.status(400).json({ error: 'senderEmail, receiverEmail, and text are required' });
  }

  const messages = await db.getMessages();
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
  await db.saveMessages(messages);
  res.json(newMsg);
});

module.exports = app;
