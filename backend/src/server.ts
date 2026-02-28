import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import contentRoutes from "./modules/content-type/contentType.routes";
import { errorHandler } from "./middlewares/error.middleware";
import entryRoutes from "@/modules/entry/entry.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/entries", entryRoutes);

app.use("/api/content", contentRoutes);

app.get("/", (req, res) => {
    res.send("CMS API Running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5152;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});