import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import DBCoonect from './src/config/DBConnect.js';
import { PORT } from './src/config/Constants.js';
import globalErrorHandler from './src/middlewares/GlobalErrorHandler.js';
import helmet from 'helmet';
import authRoutes from './src/routes/AuthRoutes.js';
import adminRouter from './src/routes/AdminRoutes.js';

const app = express();

DBCoonect();

app.disable('x-powered-by');
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());

app.get('/', ( req, res ) => {
  res.send("Hello World");
});

app.use('/api/v1/admin/auth', authRoutes);
app.use('/api/v1/admin/employees', adminRouter);

app.use(globalErrorHandler);

app.listen(PORT,()=>{
  console.log(`Server is running on PORT: ${PORT}`);
});


