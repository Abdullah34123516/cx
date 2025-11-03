import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import Moderator model for seeding
import Moderator from './models/moderatorModel.js'; 

import platformRoutes from './routes/platformRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import moderatorRoutes from './routes/moderatorRoutes.js';
import serviceAreaRoutes from './routes/serviceAreaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

connectDB();

// --- Seeding Function ---
const seedAdminUser = async () => {
    try {
        const moderatorCount = await Moderator.countDocuments();
        if (moderatorCount === 0) {
            console.log('No moderators found. Seeding default admin user...');
            await Moderator.create({
                name: 'Admin User',
                email: 'admin@fixbd.com',
                password: 'password123', // In a real app, this should be hashed
                phone: '01000000000',
                address: 'FixBD HQ, Dhaka',
                voterIdNumber: '1234567890',
                voterIdPhotoUrl: 'https://via.placeholder.com/150',
            });
            console.log('Default admin user created: admin@fixbd.com / password123');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1); // Exit if seeding fails
    }
};

// Call the seeding function after connecting to DB
seedAdminUser();


const app = express();

app.set('trust proxy', 1); // Enable trust proxy for rate limiting req.ip
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/platform', platformRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/moderators', moderatorRoutes);
app.use('/api/service-areas', serviceAreaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/chats', chatRoutes);

app.get('/', (req, res) => {
  res.send('FixBD API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
