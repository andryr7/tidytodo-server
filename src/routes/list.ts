import express from 'express';
//TODO Search for typescript problem when replacing with "import express from "express"
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createList,
  deleteList,
  getListContent,
  reorderListItems,
  updateList
} from '../controllers/list/list';

export const listRouter = express.Router();

listRouter.get('/:listid', authenticateToken, getListContent);
listRouter.post('/create', authenticateToken, createList);
listRouter.patch('/update/:listid', authenticateToken, updateList);
listRouter.delete('/delete/:listid', authenticateToken, deleteList);
listRouter.patch(
  '/reorderitems/:listitemid',
  authenticateToken,
  reorderListItems
);
