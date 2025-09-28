const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    // The original text prompt provided by the user
    prompt: {
        type: String,
        required: [true, 'Prompt is required'],
        trim: true,
        maxlength: [1500, 'Prompt cannot be more than 1500 characters']
    },
    // The title/name of the requirement set
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [150, 'Title cannot be more than 150 characters'],
        default: function () {
            return `Requirements - ${new Date().toLocaleDateString()}`;
        }
    },
    // Color code for the requirement (hex color)
    colorCode: {
        type: String,
        default: '#1976d2',
        validate: {
            validator: function (v) {
                return /^#[0-9A-Fa-f]{6}$/.test(v);
            },
            message: 'Color code must be a valid hex color (e.g., #1976d2)'
        }
    },
    // The extracted structured requirements as JSON
    extractedRequirements: {
        type: mongoose.Schema.Types.Mixed,
        required: function () {
            return this.status !== 'processing';
        }
    },
    // Reference to the user who created this requirement
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    // Status of the requirement extraction
    status: {
        type: String,
        enum: ['processing', 'draft', 'completed', 'failed'],
        default: 'processing'
    },
    // Metadata about the extraction process
    metadata: {
        processingTime: Number,
        tokensUsed: Number,
        apiVersion: String
    }
}, {
    timestamps: true
});

// Index for better query performance
requirementSchema.index({ user: 1, createdAt: -1 });
requirementSchema.index({ status: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);