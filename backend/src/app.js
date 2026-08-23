const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');

const authRouter = require('./routes/auth.route');
const tokenRouter = require('./routes/token.route');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const setupSwagger = require('./swagger');

// Initialize Swagger docs
setupSwagger(app);

app.use(helmet());
app.use(cors({
    origin: true, // Dynamically reflects the request origin
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tokens', tokenRouter);

app.use(errorHandler);

module.exports = app;