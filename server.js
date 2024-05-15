// Requires
require('dotenv').config();
const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');
const app = express();

// Import project dirs
const { apiRouter } = require('./api/index');
const { client } = require('./db/index');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

// Catch-all route handler
app.get("/", (req, res) => {
    res.status(200).send("Transposit server is functioning.");
});

// Router Handelers
// app.use('/api', apiRouter)

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Middleware Error!');
});

// Database connection
async function startServer() {
    try {
        await client.connect();
        console.log("Database connected successfully.");

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to database:", error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Close database connection
process.on('SIGINT', () => {
    console.log('Closing database connection.');
    client.end();
    process.exit();
});

// Export app
module.exports = app;