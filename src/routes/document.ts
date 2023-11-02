import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  getArchivedElements,
  getFavoriteElements,
  getLastUpdatedElements,
  getSearchedElements
} from '../controllers/document/document';

export const documentRouter = express.Router();

documentRouter.get('/favorite', authenticateToken, getFavoriteElements);
documentRouter.get('/archived', authenticateToken, getArchivedElements);
documentRouter.get('/lastupdated', authenticateToken, getLastUpdatedElements);
documentRouter.post('/search', authenticateToken, getSearchedElements);
