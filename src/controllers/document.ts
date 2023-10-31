import { Request, Response } from 'express';
import prisma from '../db/prismaClient';
import { AuthenticatedRequest } from '../customTypes/AuthenticatedRequest';
import { preprocessSearchTerms } from '../utils/preprocessSearchTerms';

export async function getSearchedElements(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  const searchTerms = preprocessSearchTerms(req.body.search);

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
        name: { search: searchTerms },
        isArchive: false
      },
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: searchTerms,
          sort: 'asc'
        }
      }
    });
    const lists = await prisma.list.findMany({
      where: {
        userId: req.userId,
        name: { search: searchTerms },
        isArchive: false
      },
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: searchTerms,
          sort: 'asc'
        }
      }
    });
    res.status(200).json({ Note: notes, List: lists });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
}

export async function getFavoriteElements(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
        isFavorite: true,
        isArchive: false
      }
    });
    const lists = await prisma.list.findMany({
      where: { userId: req.userId, isFavorite: true },
      include: {
        ListItem: true
      }
    });
    res.status(200).json({ Note: notes, List: lists });
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function getArchivedElements(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
        isArchive: true
      }
    });
    const lists = await prisma.list.findMany({
      where: { userId: req.userId, isArchive: true },
      include: {
        ListItem: true
      }
    });
    res.status(200).json({ Note: notes, List: lists });
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function getLastUpdatedElements(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.userId,
        isArchive: false
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });
    const lists = await prisma.list.findMany({
      where: {
        userId: req.userId,
        isArchive: false
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });
    res.status(200).json({ Note: notes, List: lists });
  } catch (error) {
    res.status(500).send('Server error');
  }
}
