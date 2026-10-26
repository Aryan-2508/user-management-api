import type { Request, Response, NextFunction } from "express";

import {
    createUser,
    getUserById,
    getUsers,
    updateUser,
    deleteUser,
} from "../services/user.service";

import { AppError } from "../utils/app-error";

// Create a new user
export async function createUserController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const user = await createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

// Get all users with search, sorting, and pagination
export async function getUsersController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const sortBy =
            typeof req.query.sortBy === "string"
                ? req.query.sortBy
                : undefined;

        const order =
            typeof req.query.order === "string"
                ? req.query.order
                : undefined;

        const result = await getUsers({
            page: req.query.page
                ? Number(req.query.page)
                : 1,

            limit: req.query.limit
                ? Number(req.query.limit)
                : 20,

            search,

            sortBy:
                sortBy === "name" ||
                sortBy === "email" ||
                sortBy === "createdAt"
                    ? sortBy
                    : sortBy === undefined
                      ? undefined
                      : (() => {
                            throw new AppError(
                                400,
                                "Invalid sort field. Use name, email, or createdAt.",
                            );
                        })(),

            order:
                order === "asc" || order === "desc"
                    ? order
                    : order === undefined
                      ? undefined
                      : (() => {
                            throw new AppError(
                                400,
                                "Invalid order. Use asc or desc.",
                            );
                        })(),
        });

        res.status(200).json({
            success: true,
            message:
                result.users.length === 0
                    ? "No users found"
                    : "Users retrieved successfully",
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

// Get a single user by ID
export async function getUserByIdController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = req.params.id;

        if (typeof id !== "string") {
            throw new AppError(400, "Invalid user ID");
        }

        const user = await getUserById(id);

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

// Update a user
export async function updateUserController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = req.params.id;

        if (typeof id !== "string") {
            throw new AppError(400, "Invalid user ID");
        }

        const user = await updateUser(id, req.body);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

// Delete a user
export async function deleteUserController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = req.params.id;

        if (typeof id !== "string") {
            throw new AppError(400, "Invalid user ID");
        }

        const user = await deleteUser(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
}