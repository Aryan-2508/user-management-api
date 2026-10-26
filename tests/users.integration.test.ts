import "dotenv/config";

import {
    beforeAll,
    afterAll,
    describe,
    it,
    expect,
} from "vitest";

import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app";
import connectDB from "../src/config/database";
import { User } from "../src/models/user.model";

const testEmails: string[] = [];

beforeAll(async () => {
    const testMongoUrl = process.env.TEST_MONGO_URL;

    if (!testMongoUrl) {
        throw new Error("TEST_MONGO_URL is not configured");
    }

    // Safety check: only allow the dedicated test database.
    const parsedUrl = new URL(testMongoUrl);

    const databaseName =
        parsedUrl.pathname.split("/").filter(Boolean)[0] ||
        parsedUrl.searchParams.get("dbName");

    if (databaseName !== "user_management_test") {
        throw new Error(
            "Tests require the user_management_test database",
        );
    }

    // Use the dedicated test database.
    process.env.MONGO_URL = testMongoUrl;

    await connectDB();
}, 20_000);

afterAll(async () => {
    try {
        // Delete only records created by these tests.
        if (mongoose.connection.readyState === 1) {
            if (testEmails.length > 0) {
                await User.deleteMany({
                    email: { $in: testEmails },
                });
            }
        }
    } finally {
        await mongoose.disconnect();
    }
}, 20_000);

describe("User Management API", () => {
    it("GET /health should return 200", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("POST /api/users should reject an invalid email", async () => {
        const response = await request(app)
            .post("/api/users")
            .send({
                name: "Test User",
                email: "not-an-email",
                age: 25,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("email");
    });

    it("POST /api/users should create a valid user", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const response = await request(app)
            .post("/api/users")
            .send({
                name: "Integration Test User",
                email: uniqueEmail,
                age: 25,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(
            "Integration Test User",
        );
        expect(response.body.data.email).toBe(uniqueEmail);
    });

    it("GET /api/users should return a list of users", async () => {
        const response = await request(app).get("/api/users");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.users)).toBe(true);

        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(20);
        expect(typeof response.body.pagination.total).toBe("number");
        expect(typeof response.body.pagination.totalPages).toBe("number");
    });

    it("GET /api/users/:id should return a user", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Get User Test",
                email: uniqueEmail,
                age: 30,
            });

        expect(createResponse.status).toBe(201);

        const userId = createResponse.body.data._id;

        const response = await request(app)
            .get(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(userId);
        expect(response.body.data.name).toBe("Get User Test");
        expect(response.body.data.email).toBe(uniqueEmail);
    });

    it("GET /api/users/:id should reject an invalid user ID", async () => {
        const response = await request(app)
            .get("/api/users/invalid-id");

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Invalid user ID");
    });

    it("PATCH /api/users/:id should update a user", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Original Name",
                email: uniqueEmail,
                age: 25,
            });

        expect(createResponse.status).toBe(201);

        const userId = createResponse.body.data._id;

        const response = await request(app)
            .patch(`/api/users/${userId}`)
            .send({
                name: "Updated Name",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("Updated Name");
        expect(response.body.data.email).toBe(uniqueEmail);
    });

    it("PATCH /api/users/:id should reject an invalid email", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Update Validation Test",
                email: uniqueEmail,
            });

        expect(createResponse.status).toBe(201);

        const userId = createResponse.body.data._id;

        const response = await request(app)
            .patch(`/api/users/${userId}`)
            .send({
                email: "not-an-email",
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("email");
    });it("DELETE /api/users/:id should delete a user", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Delete User Test",
                email: uniqueEmail,
            });

        expect(createResponse.status).toBe(201);

        const userId = createResponse.body.data._id;

        const response = await request(app)
            .delete(`/api/users/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Confirm that the user no longer exists.
        const getResponse = await request(app)
            .get(`/api/users/${userId}`);

        expect(getResponse.status).toBe(404);
        expect(getResponse.body.success).toBe(false);
    });

    it("DELETE /api/users/:id should return 404 for a nonexistent user", async () => {
        const nonexistentId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .delete(`/api/users/${nonexistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("User not found");
    });

        it("GET /api/users should search users by name", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Unique Search Test User",
                email: uniqueEmail,
            });

        expect(createResponse.status).toBe(201);

        const response = await request(app)
            .get("/api/users")
            .query({ search: "Unique Search Test" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(
            response.body.users.some(
                (user: { email: string }) =>
                    user.email === uniqueEmail,
            ),
        ).toBe(true);
    });

    it("GET /api/users should support sorting by name", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({
                sortBy: "name",
                order: "asc",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.users)).toBe(true);

        const names = response.body.users.map(
            (user: { name: string }) => user.name,
        );

        expect(names).toEqual(
            [...names].sort((a, b) => a.localeCompare(b)),
        );
    });

    it("GET /api/users should reject an invalid page number", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ page: 0 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
            "Page must be a positive integer",
        );
    });

        it("POST /api/users should reject a duplicate email", async () => {
        const uniqueEmail =
            `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;

        testEmails.push(uniqueEmail);

        const firstResponse = await request(app)
            .post("/api/users")
            .send({
                name: "First User",
                email: uniqueEmail,
            });

        expect(firstResponse.status).toBe(201);

        const secondResponse = await request(app)
            .post("/api/users")
            .send({
                name: "Second User",
                email: uniqueEmail,
            });

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.success).toBe(false);
        expect(secondResponse.body.message).toBe(
            "Email is already registered",
        );
    });

        it("GET /api/users should reject an invalid sort field", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ sortBy: "password" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Invalid sort field");
    });

    it("GET /api/users should reject an invalid order", async () => {
        const response = await request(app)
            .get("/api/users")
            .query({ order: "random" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Invalid order");
    });
});
