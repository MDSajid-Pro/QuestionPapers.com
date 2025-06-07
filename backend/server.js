import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 3000
// Database connection
connectDB()



// Middlewares
app.use(express.json())
app.use(cors())


// API Endpoints
app.get('/', (req, res) => res.send('API is working'))
app.use('/api/admin', adminRouter)


app.listen(port, () => [
    console.log(`Server is running on port : ${port}`)
])

export default app;