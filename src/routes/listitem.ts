import express from 'express';
//TODO Search for typescript problem when replacing with "import express from "express"
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createListItem,
  deleteListItem,
  updateListItem
} from '../controllers/listitem/listitem';

export const listItemRouter = express.Router();

listItemRouter.post('/create', authenticateToken, createListItem);
listItemRouter.patch('/update/:listitemid', authenticateToken, updateListItem);
listItemRouter.delete('/delete/:listitemid', authenticateToken, deleteListItem);
