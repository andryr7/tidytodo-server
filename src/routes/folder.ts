import express from "express"
//TODO Search for typescript problem when replacing with "import express from "express"
import { authenticateToken } from '../middleware/authenticateToken'
import { createFolder, deleteFolder, getAllFolders, getFolder, getFolderWithContent, updateFolder } from '../controllers/folder'

export const folderRouter = express.Router();

folderRouter.get('/all', authenticateToken, getAllFolders);
folderRouter.get('/:folderid', authenticateToken, getFolder);
folderRouter.get('/withcontent/:folderid', authenticateToken, getFolderWithContent);
folderRouter.post('/create', authenticateToken, createFolder);
folderRouter.patch('/update/:folderid', authenticateToken, updateFolder);
folderRouter.delete('/delete/:folderid', authenticateToken, deleteFolder);