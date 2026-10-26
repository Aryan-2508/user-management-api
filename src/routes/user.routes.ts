import { Router } from "express";

import {
    createUserController,
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
} from "../controllers/user.controller";

import { validateBody } from "../middleware/validate";

import {
    createUserSchema,
    updateUserSchema,
} from "../validators/user.validator";

const router = Router();

// Create a user — validate request body first
router.post(
    "/",
    validateBody(createUserSchema),
    createUserController,
);

// Get all users
router.get("/", getUsersController);

// Get a single user by ID
router.get("/:id", getUserByIdController);

// Update a user — validate request body first
router.patch(
    "/:id",
    validateBody(updateUserSchema),
    updateUserController,
);

// Delete a user
router.delete("/:id", deleteUserController);

export default router;
