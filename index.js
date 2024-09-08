import dotenv from "dotenv";
import connection from "./db.js";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT;

connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.log("NOT ABLE TO CONNECT!");
  });
