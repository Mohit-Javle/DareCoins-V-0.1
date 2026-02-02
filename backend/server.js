const express = require('express'); // Server entry point
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dareRoutes = require('./routes/dareRoutes');
const truthRoutes = require('./routes/truthRoutes'); // Keep existing truthRoutes
const walletRoutes = require('./routes/walletRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes'); // New adminRoutes
const notificationRoutes = require('./routes/notificationRoutes'); // New notificationRoutes
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dares', dareRoutes);
app.use('/api/truths', truthRoutes); // Keep existing truthRoutes
app.use('/api/content', contentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes); // Use new adminRoutes
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.send('DareCoin API is running...');
});

const PORT = process.env.PORT || 5000;

const { cleanupExpiredDares } = require('./controllers/dareController');

// Run cleanup every 1 minute
setInterval(() => {
    try {
        cleanupExpiredDares();
    } catch (e) {
        console.error("Cleanup Scheduler Error:", e);
    }
}, 60 * 1000);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
