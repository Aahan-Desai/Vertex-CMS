import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import contentRoutes from "./routes/content.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/content", contentRoutes);

app.get("/", (req, res) => {
    res.send("CMS API Running");
});

const PORT = 5152;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});