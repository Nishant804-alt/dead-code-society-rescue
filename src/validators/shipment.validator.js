const Joi = require('joi');

/**
 * Validation schema for creating a shipment
 */
const createShipmentSchema = Joi.object({
    trackingId: Joi.string().optional(),
    origin: Joi.string().required().messages({
        'any.required': 'Origin is required'
    }),
    destination: Joi.string().required().messages({
        'any.required': 'Destination is required'
    }),
    status: Joi.string().valid('pending', 'in-progress', 'delivered', 'cancelled').optional(),
    weight: Joi.number().positive().required().messages({
        'number.positive': 'Weight must be a positive number',
        'any.required': 'Weight is required'
    }),
    carrier: Joi.string().required().messages({
        'any.required': 'Carrier is required'
    })
});

/**
 * Validation schema for updating shipment status
 */
const updateShipmentStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'in-progress', 'delivered', 'cancelled').required().messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be one of: pending, in-progress, delivered, cancelled'
    })
});

module.exports = {
    createShipmentSchema,
    updateShipmentStatusSchema
};
