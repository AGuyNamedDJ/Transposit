// Requires
const request = require('supertest');
const { app } = require('../../server');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
require('dotenv').config();
const { createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    loginUser,
    deleteUser,
    updateUser
 } = require('../../db/users');

// Utility functions for setting up and cleaning up the database
async function setupDatabase() {
    try {
        console.log("Starting setupDatabase...");
        console.log("Creating TestUser1...");
        await createUser({
            username: 'TestUser1',
            password: 'TestPassword1',
            email: 'testuser1@example.com',
            first_name: 'Test',
            last_name: 'User1',
            phone_number: '9876543210',
            date_of_birth: '1990-01-01'
        });
        console.log("Finished setupDatabase.");
    } catch (error) {
        console.error("Error in setupDatabase:", error);
    }
}

async function cleanupDatabase() {
    try {
        console.log("Cleaning up database...");
        const user = await getUserByUsername('TestUser1');
        console.log("User fetched for cleanup:", user);
        if (user) {
            await deleteUser(user.username);
        }
        console.log("Finished cleaning up database.");
    } catch (error) {
        console.error("Error in cleanupDatabase:", error);
    }
}

describe('User API', () => {
    beforeAll(async () => {
        await setupDatabase();
    }, 60000); 

    afterAll(async () => {
        await cleanupDatabase();
    }, 60000);

    describe('GET /api/users', () => {
        it('should show all users', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('users');
        }, 60000);
    });

    describe('GET /api/users/:id', () => {
        it('should show a user by ID', async () => {
            const user = await getUserByUsername('TestUser1');
            const res = await request(app).get(`/api/users/${user.id}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.username).toEqual('TestUser1');
        }, 60000);
    });
});
