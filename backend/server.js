import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 3000
// Database connection
connectDB()

const allowedOrigins = ['http://localhost:5173'];

// Middlewares
app.use(express.json())
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true,}))


// API Endpoints
app.get('/', (req, res) => res.send('API is working'))
app.use('/api/admin', adminRouter)


app.listen(port, () => [
    console.log(`Server is running on port : ${port}`)
])

export default app;