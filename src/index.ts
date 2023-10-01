import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import startDatabase from "partipro-shared/src/core/connection";

startDatabase()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, (): void => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`error while trying to connect to the database, ${error}`);
  });
