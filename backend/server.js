import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';
import questionPaperRouter from './routes/questionPaperRoute.js';
import Paper from './models/questionPapersModel.js'; // Ensure this path is correct

const app = express();


// Frontend is calling port 5000, so we default to 5000 if .env is missing
const port = process.env.PORT || 5000; 

// Database connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// API Endpoints
app.get('/', (req, res) => res.send('API is working'));

// ---------------------------------------------------------
// 1. SEARCH ROUTE (Fixes the 404 error)
// This handles: GET /api/question-paper?university=...&course=...
// ---------------------------------------------------------
app.get('/api/question-paper', async (req, res, next) => {
    // If there are query parameters (filtering), handle it here
    if (Object.keys(req.query).length > 0) {
        try {
            const { university, course, semester, scheme, year } = req.query;
            
            // Build the dynamic query object
            const query = {};
            if (university) query.university = university;
            if (course) query.course = course;
            if (semester) query.semester = semester;
            if (scheme) query.scheme = scheme;
            if (year) query.year = year;

            const papers = await Paper.find(query);
            
            if (papers.length === 0) {
                console.log("No papers found for this query.");
            }

            return res.json(papers);
        } catch (error) {
            console.error("Search Error:", error);
            return res.status(500).json({ success: false, message: "Error fetching papers" });
        }
    }
    // If no query params (e.g., just /api/question-paper with no filter), 
    // pass control to the questionPaperRouter below
    next();
});

// ---------------------------------------------------------
// 2. OPTIONS ROUTE (For Dropdowns)
// Usage: /api/options?field=course&university=GulbargaUniversity
// ---------------------------------------------------------
app.get('/api/options', async (req, res) => {
    try {
        const { field, university, course, semester, scheme } = req.query;

        // Build query to filter options based on previous selections
        const query = {};
        if (university) query.university = university;
        if (course) query.course = course;
        if (semester) query.semester = semester;
        if (scheme) query.scheme = scheme;

        // Fetch distinct values (e.g., get all courses for a specific university)
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

// This handles other routes like /api/question-paper/add, /api/question-paper/all
app.use('/api/question-paper', questionPaperRouter);

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
});

export default app;