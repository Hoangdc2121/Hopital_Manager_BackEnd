import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './src/common/middlewares/errorHandler.js';
import router from './src/routers/index.js';

dotenv.config();
const PORT = process.env.PORT
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from server Hopital Manager!!");
});
app.use(router);
app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
});
