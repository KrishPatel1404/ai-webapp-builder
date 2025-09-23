const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    // The name/title of the generated application
    name: {
        type: String,
        required: [true, 'App name is required'],
        trim: true,
        maxlength: [100, 'App name cannot be more than 100 characters']
    },
    // Description of the generated application
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    // Reference to the user who owns this app
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    // Reference to the requirement this app was generated from
    requirement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement',
        required: [true, 'Requirement is required']
    },
    // The generated application code/structure
    generatedCode: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Generated code is required']
    },
    // Status of the app generation
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed'],
        default: 'generating'
    },
    // Generation metadata
    metadata: {
        processingTime: Number,
        tokensUsed: Number,
        apiVersion: String,
        generationPrompt: String
    },
    // Error message if generation failed
    errorMessage: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
appSchema.index({ user: 1, createdAt: -1 });
appSchema.index({ requirement: 1 });
appSchema.index({ status: 1 });

// Virtual for app URL/identifier
appSchema.virtual('appId').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized
appSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('App', appSchema);