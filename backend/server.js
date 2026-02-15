import express from 'express';
import 'dotenv/config'; 
import cors from 'cors';
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';
import questionPaperRouter from './routes/questionPaperRoute.js';
import Paper from './models/questionPapersModel.js'; 
import queryRoutes from './routes/queryRoutes.js';

const app = express();
const port = process.env.PORT || 5000; 

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed in middleware:", error);
        res.status(500).json({ error: "Database Connection Error" });
    }
});

// --- API Endpoints ---
app.get('/', (req, res) => res.send('API is working'));

// ---------------------------------------------------------
// 1. SEARCH ROUTE
// ---------------------------------------------------------
app.get('/api/question-paper', async (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
        return next();
    }

    try {
        const { university, course, semester, scheme, year } = req.query;

        const query = {};
        if (university) query.university = university;
        if (course) query.course = course;
        if (semester) query.semester = semester;
        if (scheme) query.scheme = scheme;
        if (year) query.year = year;

        const papers = await Paper.find(query);
        return res.json(papers);

    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching papers" });
    }
});

// ---------------------------------------------------------
// 2. OPTIONS ROUTE
// ---------------------------------------------------------
app.get('/api/options', async (req, res) => {
    try {
        const { field, university, course, semester, scheme } = req.query;

        const query = {};
        if (university) query.university = university;
        if (course) query.course = course;
        if (semester) query.semester = semester;
        if (scheme) query.scheme = scheme;

        const distinctValues = await Paper.distinct(field, query);
        res.json(distinctValues);
    } catch (error) {
        console.error("Options Error:", error);
        res.status(500).json([]);
    }
});

// ---------------------------------------------------------
// 3. ROUTERS
// ---------------------------------------------------------
app.use('/api/admin', adminRouter);
app.use('/api/question-paper', questionPaperRouter);
app.use('/api/queries', queryRoutes);

// --- Start Server (Conditional) ---
// Only run app.listen locally. Vercel handles this automatically.
    app.listen(port, () => {
        console.log(`Server is running locally on port: ${port}`);
    });

export default app;