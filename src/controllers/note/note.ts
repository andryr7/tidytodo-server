import { Request, Response } from 'express';
import prisma from '../../db/prismaClient';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

export async function getNoteContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const noteContent = await prisma.note.findUnique({
      where: { id: req.params.noteid, userId: req.userId }
    });
    res.status(200).json(noteContent);
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function createNote(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const newList = await prisma.note.create({
      data: {
        name: req.body.name,
        content: req.body.content || '',
        folderId: req.body.folderId,
        userId: req.userId!,
        isFavorite: false
      }
    });
    res.status(201).json(newList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function updateNote(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const updatedNote = await prisma.note.update({
      where: {
        id: req.params.noteid,
        userId: req.userId
      },
      data: {
        name: req.body.name,
        content: req.body.content,
        color: req.body.color,
        isFavorite: req.body.isFavorite,
        folderId: req.body.folderId === 'root' ? null : req.body.folderId,
        isArchive: req.body.isArchive
      }
    });
    res.status(202).json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function deleteNote(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const noteId = req.params.noteid;

    const deletedNote = await prisma.note.delete({
      where: {
        id: noteId,
        userId: req.userId
      }
    });

    if (!deletedNote) {
      return res.status(400).send('Error: note doesnt exist');
    }

    res.status(202).json(deletedNote);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
