const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔴 1. PASTE YOUR MONGODB CONNECTION STRING HERE 🔴
// Make sure to replace <db_password> with your actual password (no brackets!)
const MONGO_URI = "mongodb+srv://brodiedimevski_db_user:4icGaE7v8TScrWZE@logit-cluster.za2psyd.mongodb.net/?appName=LogIt-Cluster";

// 🔴 2. PASTE YOUR GOOGLE AI KEY HERE 🔴
const API_KEY = "AIzaSyBeBMYLVs8_YPH0b3zgt32XL0hhDWWwCo0"; 


// --- CONNECT TO CLOUD DATABASE ---
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Cloud"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- DEFINE THE DATA STRUCTURE ---
const companySchema = new mongoose.Schema({
    id: String, 
    name: String,
    adminUser: String,
    adminPass: String,
    currentGoal: { type: String, default: "" },
    logs: [{
        id: String,
        user: String,
        accomplishment: String,
        nextFocus: String,
        aiFeedback: String,
        managerNote: { type: String, default: "" },
        timestamp: String
    }]
});

const Company = mongoose.model('Company', companySchema);

// --- AI SETUP ---
let model = null;
try {
    if (API_KEY && API_KEY.startsWith("AIza")) {
        const genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ AI Brain Initialized");
    }
} catch (e) {}

app.use(cors());
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'landing.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));

app.get('/system-status', (req, res) => {
    res.json({ isOnline: true });
});

app.post('/signup', async (req, res) => {
    const { companyName, username, password } = req.body;
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const newCompany = new Company({
        id: code,
        name: companyName,
        adminUser: username,
        adminPass: password,
        logs: []
    });

    await newCompany.save(); 
    res.json({ success: true, companyCode: code });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const company = await Company.findOne({ adminUser: username, adminPass: password });

    if (company) {
        res.json({ success: true, companyCode: company.id, companyName: company.name });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.get('/manager-view', async (req, res) => {
    const code = req.query.code;
    const company = await Company.findOne({ id: code });
    
    if (company) {
        res.json({ logs: company.logs, currentGoal: company.currentGoal, companyName: company.name });
    } else {
        res.json({ logs: [], currentGoal: "", companyName: "Unknown" });
    }
});

app.post('/log-work', async (req, res) => {
    const { companyCode, user, accomplishment, nextFocus, timestamp } = req.body;
    
    const company = await Company.findOne({ id: companyCode });
    if (!company) return res.status(404).json({ error: "Invalid Company Code" });

    let aiFeedback = "Log saved.";
    if (model) {
        try {
            const result = await model.generateContent(`Role: Coach. Log: "${accomplishment}". Next: "${nextFocus}". One short sentence of advice.`);
            aiFeedback = (await result.response).text().trim();
        } catch (e) {}
    }

    const newLog = {
        id: Date.now().toString(36),
        user, accomplishment, nextFocus, aiFeedback, managerNote: "", timestamp
    };

    company.logs.push(newLog);
    await company.save(); 
    res.json({ message: "Saved!", feedback: aiFeedback });
});

app.post('/set-goal', async (req, res) => {
    const { companyCode, goal } = req.body;
    await Company.updateOne({ id: companyCode }, { currentGoal: goal });
    res.json({ message: "Updated" });
});

app.post('/delete-log', async (req, res) => {
    const { companyCode, id } = req.body;
    const company = await Company.findOne({ id: companyCode });
    if (company) {
        company.logs = company.logs.filter(l => l.id !== id);
        await company.save();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

app.post('/update-note', async (req, res) => {
    const { companyCode, id, note } = req.body;
    const company = await Company.findOne({ id: companyCode });
    if (company) {
        const log = company.logs.find(l => l.id === id);
        if (log) {
            log.managerNote = note;
            await company.save();
            res.json({ success: true });
        }
    }
});

app.listen(PORT, () => console.log(`🚀 Cloud Server running at http://localhost:${PORT}`));