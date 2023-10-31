import express from 'express';
import { userRouter } from './src/routes/user';
import { folderRouter } from './src/routes/folder';
import { listRouter } from './src/routes/list';
import { noteRouter } from './src/routes/note';
import { listItemRouter } from './src/routes/listitem';
import cors from 'cors';
import { documentRouter } from './src/routes/document';
import { HOST_PORT } from './src/utils/envVariables';

const app = express();

//TODO Restrict origin with env variables
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://tidytodo.andryratsimba.com']
  })
);

app.use(express.json());
app.use('/user', userRouter);
app.use('/folder', folderRouter);
app.use('/list', listRouter);
app.use('/note', noteRouter);
app.use('/listitem', listItemRouter);
app.use('/document', documentRouter);

app.listen(HOST_PORT, () =>
  console.log(`TidyToDo backend is ready on port ${HOST_PORT}`)
);
