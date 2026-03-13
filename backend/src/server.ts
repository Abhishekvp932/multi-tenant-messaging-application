import express ,{Application} from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import connectDB from "./config/db";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './router/user.routes';
import authRouter from './router/auth.routes';
import groupRouter from './router/group.routes';
import { initializeSocket } from './utils/socket';
dotenv.config();

const app: Application = express();
const server = createServer(app);

const corsOperation = {
  origin:'http://localhost:5173',
  credentials: true ,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cookieParser());
app.use(cors(corsOperation));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/group',groupRouter);

const PORT = process.env.PORT;
connectDB();

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
});
