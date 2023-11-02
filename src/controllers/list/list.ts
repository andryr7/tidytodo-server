import { Response } from 'express';
import prisma from '../../db/prismaClient';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

export async function getListContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const listAndContent = await prisma.list.findUnique({
      where: {
        id: req.params.listid,
        userId: req.userId
      },
      include: {
        ListItem: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    if (!listAndContent) {
      res.status(400).send('List was not found');
    } else {
      res.status(200).json(listAndContent);
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
}

export async function createList(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const newList = await prisma.list.create({
      data: {
        userId: req.userId!,
        name: req.body.name,
        folderId: req.body.folderId,
        isToDo: req.body.isToDo || false,
        hasLinks: req.body.hasLinks || false,
        hasRatings: req.body.hasRatings || false,
        isFavorite: false
      }
    });
    res.status(201).json(newList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function updateList(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const updatedList = await prisma.list.update({
      where: {
        id: req.params.listid,
        userId: req.userId
      },
      data: {
        name: req.body.name,
        isToDo: req.body.isToDo,
        hasLinks: req.body.hasLinks,
        hasRatings: req.body.hasRatings,
        isFavorite: req.body.isFavorite,
        color: req.body.color,
        folderId: req.body.folderId === 'root' ? null : req.body.folderId,
        isArchive: req.body.isArchive
      }
    });
    res.status(202).json(updatedList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function deleteList(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const listId = req.params.listid;

    const deletedList = await prisma.list.delete({
      where: {
        id: listId,
        userId: req.userId
      }
    });

    if (!deletedList) {
      return res.status(400).send('Error: list doesnt exist');
    }

    res.status(202).json(deletedList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function reorderListItems(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    //Extracting ids and data from request
    const { listid: listId } = req.params;
    const { listItemPosition, newListItemPosition } = req.body;

    //Finding all list items
    const updatedListItems = await prisma.listItem.findMany({
      where: {
        //TODO implement user verification ? Must add user id to list items
        listId: listId
      }
    });

    //If the array of list items is empty (theoretically impossible case as there must be a moved list item for this to be called)
    if (!updatedListItems.length) {
      res.status(400).send('Error: list not found');
    }

    //Finding the moved list item
    const updatedListItem = updatedListItems.find(
      (listItem) => listItem.order === listItemPosition
    );

    //If the moved list item is not found
    if (!updatedListItem) {
      return res.status(400).send('Error: list item not found');
    }

    //Initializing an array containing the required operations
    //TODO improve typing ?
    const reorderPromises: Promise<any>[] = [];

    //Performing operations on each list item if necessary
    for (const listItem of updatedListItems) {
      if (listItem.id === updatedListItem.id) {
        reorderPromises.push(
          prisma.listItem.update({
            where: { id: updatedListItem.id },
            data: { order: newListItemPosition }
          })
        );
      } else if (
        listItem.order <= newListItemPosition &&
        listItem.order > listItemPosition
      ) {
        reorderPromises.push(
          prisma.listItem.update({
            where: { id: listItem.id },
            data: { order: listItem.order - 1 }
          })
        );
      } else if (
        listItem.order >= newListItemPosition &&
        listItem.order < listItemPosition
      ) {
        reorderPromises.push(
          prisma.listItem.update({
            where: { id: listItem.id },
            data: { order: listItem.order + 1 }
          })
        );
      }
    }

    await Promise.all(reorderPromises);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
