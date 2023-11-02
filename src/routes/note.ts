import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createNote,
  deleteNote,
  getNoteContent,
  updateNote
} from '../controllers/note/note';

export const noteRouter = express.Router();

noteRouter.get('/:noteid', authenticateToken, getNoteContent);
noteRouter.post('/create', authenticateToken, createNote);
noteRouter.delete('/delete/:noteid', authenticateToken, deleteNote);
noteRouter.patch('/update/:noteid', authenticateToken, updateNote);
