import { Response } from 'express';
import prisma from '../../db/prismaClient';
import { transformFolderStructure } from '../../utils/transformFolderStructure';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';
import { Folder } from '@prisma/client';

//See https://stackoverflow.com/questions/65749916/what-is-the-correct-type-for-this-handler for type declaration
export async function getAllFolders(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const userFolders = await prisma.folder.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        name: true,
        folderId: true,
        userId: true
      }
    });
    //Transforming the data structure to accomodate frontend component
    const transformedFolders = transformFolderStructure(userFolders);
    res.status(200).json(transformedFolders);
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function getFolder(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.folderid }
    });
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function getFolderWithContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const requestedFolderId = req.params.folderid;

    switch (requestedFolderId) {
      //If the requested folder is root, agregate data and send dummy root folder containing it
      case 'root':
        const rootFolderContent = await prisma.$transaction([
          prisma.folder.findMany({
            where: { userId: req.userId, folderId: null }
          }),
          prisma.list.findMany({
            where: { userId: req.userId, folderId: null }
          }),
          prisma.note.findMany({
            where: { userId: req.userId, folderId: null }
          })
        ]);
        const [Folders, Lists, Notes] = rootFolderContent;

        const rootFolder = {
          id: 'root',
          userId: req.userId,
          name: 'Root',
          folderId: null,
          Folder: Folders,
          List: Lists,
          Note: Notes
        };

        return res.status(200).json(rootFolder);
      //Else, get and send folder data
      default:
        const folderWithContent = await prisma.folder.findUnique({
          where: {
            id: req.params.folderid
          },
          include: {
            Folder: true,
            Note: true,
            List: true
          }
        });

        return res.status(200).json(folderWithContent);
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function createFolder(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const newFolder = await prisma.folder.create({
      data: {
        userId: req.userId!,
        name: req.body.name,
        folderId: req.body.folderId
      }
    });
    res.status(201).json(newFolder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function updateFolder(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  if (req.params.folderid === req.body.folderId) {
    return res.status(400).send('Error: Folder cannot be inside of itself');
  }
  try {
    //TODO Add validation to prevent folders from being move to their children folders

    const updatedFolder = await prisma.folder.update({
      where: {
        id: req.params.folderid,
        userId: req.userId
      },
      data: {
        name: req.body.name,
        folderId: req.body.folderId === 'root' ? null : req.body.folderId
      }
    });
    res.status(202).json(updatedFolder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function deleteFolder(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const deletedFolder = await prisma.folder.delete({
      where: {
        id: req.params.folderid,
        userId: req.userId
      }
    });

    if (!deletedFolder) {
      return res.status(400).send('Bad request');
    } else {
      res.status(202).json(deletedFolder);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
