import express from 'express';
import cors from 'cors';
import { userRouter } from './src/routes/user';
import { folderRouter } from './src/routes/folder';
import { listRouter } from './src/routes/list';
import { noteRouter } from './src/routes/note';
import { listItemRouter } from './src/routes/listitem';
import { documentRouter } from './src/routes/document';
import { CLIENT_HOST_URL, HOST_PORT } from './src/utils/envVariables';
import { authRouter } from './src/routes/auth';
import {
  testDatabase,
  testEmailing,
  testEnvVariables
} from './src/utils/tests';

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

async function startup() {
  try {
    await testEnvVariables();
    await testDatabase();
    await testEmailing();
    app.listen(HOST_PORT, () =>
      console.log(`TidyTodo backend is ready on port ${HOST_PORT}`)
    );
  } catch (err) {
    console.error(err);
    console.error(
      `Something went wrong and TidyTodo backend could not start properly. Check the error above`
    );
  }
}

startup();
