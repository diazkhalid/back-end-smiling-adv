import Express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAllBooks, getBookByIdHandler, getImgByIdHandler, getThumbByIdHandler, 
        searchStoryHandler, addingRev, getReviewById, deleteReviewByRevId, getAllReviewOrderByDate, 
        getStoryCount, getReviewCount, getCount, getDashboardImg } from "./handler.js";
const app = Express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(Express.json());
app.use(cors());
app.use(Express.static(path.join(__dirname, 'images')));

app.get("/", (req, res) => {
    res.send("Smiling API");
});

app.get("/list", (req, res) => {
    const result = getAllBooks();
    res.send(result);
});
app.get("/images/:idS/:id", getImgByIdHandler);
app.get("/thumbnail/:id", getThumbByIdHandler);
app.get("/getreview/:id", getReviewById);
app.get("/detail/:id", getBookByIdHandler);
app.get("/search", searchStoryHandler);
app.post("/review", addingRev);
app.delete("/review/delete/:id", deleteReviewByRevId);
app.get("/getAllReview", getAllReviewOrderByDate);
app.get("/getStoryCount", getStoryCount);
app.get("/getReviewCount", getReviewCount);
app.get("/getCount", getCount);
app.get("/getDashImg/:id", getDashboardImg);
export default app;