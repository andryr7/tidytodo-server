import { Folder } from '@prisma/client';

interface FrontendFolder {
  id: string;
  text: string;
  parent: string;
  droppable: boolean;
}

export function transformFolderStructure(folders: Folder[]): FrontendFolder[] {
  return folders.map((folder) => ({
    id: folder.id,
    text: folder.name,
    parent: folder.folderId ? folder.folderId : 'root',
    droppable: true
  }));
}
