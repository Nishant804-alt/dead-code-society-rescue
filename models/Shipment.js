// SMELL: [MEDIUM]
// var usage should be replaced with const.
var mongoose = require('mongoose');

var shipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending' // SMELL: [MEDIUM]
// Magic string should be a constant.
// pending, in-progress, delivered, cancelled
    },
    weight: {
        type: Number,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    // which user this shipment belongs to
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// hook for pre-save on model
shipmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
