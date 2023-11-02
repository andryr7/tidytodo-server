import express from 'express';
import { userRouter } from './src/routes/user';
import { folderRouter } from './src/routes/folder';
import { listRouter } from './src/routes/list';
import { noteRouter } from './src/routes/note';
import { listItemRouter } from './src/routes/listitem';
import cors from 'cors';
import { documentRouter } from './src/routes/document';
import { CLIENT_HOST_URL, HOST_PORT } from './src/utils/envVariables';
import { authRouter } from './src/routes/auth';

const app = express();

//move
app.use(
  cors({
    origin: ['http://localhost:5173', CLIENT_HOST_URL]
  })
);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/document', documentRouter);
app.use('/note', noteRouter);
app.use('/list', listRouter);
app.use('/listitem', listItemRouter);
app.use('/folder', folderRouter);

app.listen(HOST_PORT, () =>
  console.log(`TidyTodo backend is ready on port ${HOST_PORT}`)
);
