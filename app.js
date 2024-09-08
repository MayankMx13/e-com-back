import express from "express";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ Credential: true }));

//router imports
import userRoute from "./routes/user.route.js";

//useage of router
app.use("/api/user", userRoute);

export { app };
