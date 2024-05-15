// Requires
const express = require('express');
const {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser,
    loginUser
} = require('../db/users');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require('bcrypt');

const { JWT_SECRET } = process.env;

// Router Middleware
const usersRouter = express.Router();

// Authenticate Middleware
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized: No token provided!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden: Invalid token!' });
        }

        req.user = user;
        next();
    });
};

// Router Handlers
usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users...");
    next();
});

// Endpoint to getAllUsers
usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.send({ users });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getUserById
usersRouter.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send({ user });
    } catch (error) {
        next(error);
    }
});

// Endpoint to getUserByUsername
usersRouter.get('/username/:username', authenticateUser, async (req, res, next) => {
    try {
        const user = await getUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send({ user });
    } catch (error) {
        next(error);
    }
});


// Endpoint to register (create new user)
usersRouter.post('/register', async (req, res, next) => {
    const { username, password, email, first_name, last_name, phone_number, date_of_birth } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            res.status(409).send({
                name: "UserExistsError",
                message: "A user by that name already exists",
                status: 409
            });
        } else {
            const SALT_COUNT = 10;
            const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

            const newUser = await createUser({
                username,
                password: hashedPassword,
                email,
                first_name,
                last_name,
                phone_number,
                date_of_birth
            });

            const { password: _, ...secureUser } = newUser;
            const token = jwt.sign(
                {
                    id: secureUser.id,
                    username: secureUser.username
                }, JWT_SECRET, {
                    expiresIn: "1w",
                });

            res.status(201).send({
                message: "Thank you for signing up.",
                user: secureUser,
                token
            });
        }
    } catch (error) {
        next(error);
    }
});

// Endpoint to getUserByUsername
usersRouter.get('/username/:username', authenticateUser, async (req, res, next) => {
    try {
        const user = await getUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).send({ message: 'User not found!' });
        }
        res.send({ user });
    } catch (error) {
        next(error);
    }
});

// Endpoint to deleteUser
usersRouter.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const user = await deleteUser(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send({ user });
    } catch (error) {
        next(error);
    }
});

// Endpoint to loginUser
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required!' });
    }

    try {
        const user = await loginUser({ username, password });

        if (user) {
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
            res.send({ message: 'Login successful', token });
        } else {
            res.status(401).send({ message: 'Invalid credentials!' });
        }
    } catch (error) {
        next(error);
    }
});

// Export
module.exports = { usersRouter };