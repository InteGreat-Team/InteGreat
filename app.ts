import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes';
import emailRoutes from './routes/emailRoutes';
import { requestLogger } from './middleware/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for all requests
app.use(cors());

// ✅ Parse incoming JSON requests
app.use(express.json());

// ✅ Apply logging middleware BEFORE routes
app.use(requestLogger);

// ✅ Load Routes
app.use('/events', eventRoutes);
app.use('/send-email', emailRoutes);

// ✅ Default Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: '🎉 Welcome to the InteGreat API!' });
});

// ✅ Error Handling for Undefined Routes
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// ✅ Start Server
if (process.env.NODE_ENV !== 'lambda') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
}

// ✅ Export for AWS Lambda Support
export default app;
