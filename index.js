import express from "express";
import router from "./router.js";

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/api", router);

app.listen(PORT, () => console.log("Сервер запущен на порту: " + PORT));
