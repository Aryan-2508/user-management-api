import mongoose from "mongoose";
import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import type {
    CreateUserInput,
    UpdateUserInput,
} from "../validators/user.validator";

// Create a new user
export async function createUser(data: CreateUserInput) {
    try {
        const user = await User.create({
            name: data.name,
            email: data.email.trim().toLowerCase(),
            ...(data.age !== undefined ? { age: data.age } : {}),
        });

        return user;
    } catch (error: unknown) {
        if (
            error instanceof mongoose.mongo.MongoServerError &&
            error.code === 11000
        ) {
            throw new AppError(409, "Email is already registered");
        }

        throw error;
    }
}

// Get a user by ID
export async function getUserById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, "Invalid user ID");
    }

    const user = await User.findById(id).lean();

    if (!user) {
        throw new AppError(404, "User not found");
    }

    return user;
}

// Search, sort and paginate users
export interface GetUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "email" | "createdAt";
    order?: "asc" | "desc";
}

export async function getUsers(options: GetUsersOptions = {}) {
    const {
        page = 1,
        limit = 20,
        search,
        sortBy = "createdAt",
        order = "desc",
    } = options;

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError(400, "Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new AppError(400, "Limit must be between 1 and 100");
    }

    const allowedSortFields = ["name", "email", "createdAt"];

    if (!allowedSortFields.includes(sortBy)) {
        throw new AppError(400, "Invalid sort field");
    }

    if (order !== "asc" && order !== "desc") {
        throw new AppError(400, "Order must be 'asc' or 'desc'");
    }

    const filter: { name?: { $regex: string; $options: string } } = {};

    if (search?.trim()) {
        const escapedSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.name = {
            $regex: escapedSearch,
            $options: "i",
        };
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
        User.find(filter)
            .sort({ [sortBy]: sortOrder, _id: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("name email age createdAt updatedAt")
            .lean(),

        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// Update a user
export async function updateUser(
    id: string,
    data: UpdateUserInput,
) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, "Invalid user ID");
    }

    const update = {
        ...data,
        ...(data.email !== undefined
            ? { email: data.email.trim().toLowerCase() }
            : {}),
    };

    try {

        const user = await User.findByIdAndUpdate(
            id,
            data,
            {
                returnDocument: "after",
                runValidators: true,
            },
        );

        if (!user) {
            throw new AppError(404, "User not found");
        }

        return user;
    } catch (error: unknown) {
        if (
            error instanceof mongoose.mongo.MongoServerError &&
            error.code === 11000
        ) {
            throw new AppError(409, "Email is already registered");
        }

        throw error;
    }
}

// Delete a user
export async function deleteUser(id: string) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, "Invalid user ID");
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    return user;
}