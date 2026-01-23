import express from 'express';
import { 
    addQuestionPaper, 
    getAllQuestionPapers, 
    updateQuestionPaper, 
    deleteQuestionPaper 
} from '../controllers/questionPapersController.js';
import upload from '../middleware/multer.js'; 

const router = express.Router();

router.post('/add', upload.single('pdf'), addQuestionPaper);
router.get('/all', getAllQuestionPapers);
router.put('/:id', upload.single('pdf'), updateQuestionPaper);
router.delete('/:id', deleteQuestionPaper);



export default router;