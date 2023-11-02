import { Response } from 'express';
import prisma from '../../db/prismaClient';
import { AuthenticatedRequest } from '../../customTypes/AuthenticatedRequest';

export async function createListItem(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const newListItem = await prisma.listItem.create({
      data: {
        name: req.body.name,
        isChecked: false,
        listId: req.body.listId,
        order: req.body.order
      }
    });
    res.status(201).json(newListItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function updateListItem(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const updatedListItem = await prisma.listItem.update({
      where: {
        id: req.params.listitemid
      },
      data: {
        name: req.body.name,
        isChecked: req.body.isChecked,
        rate: req.body.rate,
        order: req.body.order,
        link: req.body.link
      }
    });
    res.status(202).json(updatedListItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

export async function deleteListItem(
  req: AuthenticatedRequest,
  res: Response
): Promise<any> {
  try {
    const deletedListItem = await prisma.listItem.delete({
      where: {
        id: req.params.listitemid
      }
    });
    if (!deleteListItem) {
      res.status(400).send('Bad request');
    } else {
      res.status(202).json(deletedListItem);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}
