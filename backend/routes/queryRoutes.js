import express from 'express';
import { createQuery, deleteQuery, getAllQueries, updateQuery } from '../controllers/queryController.js';

const queryRouter = express.Router();

queryRouter.post('/add', createQuery);
queryRouter.get('/all', getAllQueries);
queryRouter.patch('/:id', updateQuery);
queryRouter.delete('/:id', deleteQuery);

export default queryRouter;