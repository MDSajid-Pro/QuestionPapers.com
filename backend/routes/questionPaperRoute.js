import express from 'express';
import { 
    addQuestionPaper, 
    getAllQuestionPapers, 
    updateQuestionPaper, 
    deleteQuestionPaper,
    getAllQuestions,
    getOptions // Added controller import for dynamic filtering
} from '../controllers/questionPapersController.js';
import upload from '../middleware/multer.js'; 

const router = express.Router();

// --- Administrative CRUD Routes ---
router.post('/add', upload.single('pdf'), addQuestionPaper);
router.get('/all', getAllQuestionPapers);
router.put('/:id', upload.single('pdf'), updateQuestionPaper);
router.delete('/:id', deleteQuestionPaper);

// --- Student Portal & Filtering Routes ---
router.get('/options', getOptions);
router.get('/filter', getAllQuestions);

export default router;