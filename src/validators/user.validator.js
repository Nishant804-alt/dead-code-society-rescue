const Joi = require('joi');

/**
 * Validation schema for creating a user
 */
const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required'
    }),
    role: Joi.string().valid('user', 'admin').optional()
});

/**
 * Validation schema for updating a user
 */
const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).optional(),
    role: Joi.string().valid('user', 'admin').optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

module.exports = {
    createUserSchema,
    updateUserSchema
};
