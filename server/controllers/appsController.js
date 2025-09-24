const OpenAI = require('openai');
const App = require('../models/App');
const Requirement = require('../models/Requirement');
const { updateRequirementStatus } = require('./requirementsController');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for app generation
const SYSTEM_PROMPT = `
EMPTY
`;

// @desc    Generate app from requirements
// @route   POST /api/apps/generate
// @access  Private (requires authentication)
const generateApp = async (req, res) => {
    const startTime = Date.now();

    try {
        const { requirementId } = req.body;

        // Validate input
        if (!requirementId) {
            return res.status(400).json({
                error: 'Requirement ID is required'
            });
        }

        // Get the requirement
        const requirement = await Requirement.findOne({
            _id: requirementId,
            user: req.user._id
        });

        if (!requirement) {
            return res.status(404).json({
                error: 'Requirement not found or not authorized'
            });
        }

        // Create initial app record
        const app = new App({
            name: requirement.extractedRequirements.appName || requirement.title,
            description: requirement.prompt.substring(0, 500),
            user: req.user._id,
            requirement: requirementId,
            generatedCode: {},
            status: 'generating'
        });

        await app.save();

        // Prepare the prompt for OpenAI
        const generationPrompt = `
Generate a complete web application based on these requirements:

App Name: ${requirement.extractedRequirements.appName || requirement.title}
Original Prompt: ${requirement.prompt}

Structured Requirements:
${JSON.stringify(requirement.extractedRequirements, null, 2)}

Technical Requirements: ${requirement.extractedRequirements.technicalRequirements?.join(', ') || 'Modern web stack'}

Generate a complete, production-ready application that implements all the specified features and requirements.
`;

        try {
            // Call OpenAI API using gpt-5-nano with flex tier
            const completion = await openai.responses.create({
                model: "gpt-5-nano",
                reasoning: { effort: "medium" },
                input: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: generationPrompt }
                ]
            });

            // Check if the response is valid
            if (!completion || !completion.output_text || !completion.output) {
                console.error('Invalid OpenAI response structure:', completion);
                throw new Error('Invalid response from AI service');
            }

            const response = completion.output_text.trim();

            if (process.env.NODE_ENV !== 'production') {
                console.log('AI Response:\n', response);
            }

            // Check if the AI response is empty or null
            if (!response || response.trim() === '') {
                console.error('Empty AI response received');
                throw new Error('Empty response from AI service');
            }

            // Parse the JSON response
            let generatedCode;
            try {
                generatedCode = JSON.parse(response);
            } catch (parseError) {
                console.error('Failed to parse OpenAI response:', parseError);
                console.error('Raw AI response that failed to parse:', JSON.stringify(response));
                throw new Error('Failed to parse generated code structure');
            }

            // Calculate processing time
            const processingTime = Date.now() - startTime;

            // Update app with generated code
            app.generatedCode = generatedCode;
            app.status = 'completed';
            app.metadata = {
                processingTime,
                tokensUsed: completion.usage?.total_tokens || 0,
                apiVersion: 'gpt-5-nano',
                generationPrompt
            };

            await app.save();

            // Update requirement status to 'completed' since an app was successfully generated
            await updateRequirementStatus(requirementId, 'completed');

            // Return success response
            res.status(200).json({
                success: true,
                app: {
                    id: app._id,
                    name: app.name,
                    description: app.description,
                    status: app.status,
                    generatedCode: app.generatedCode,
                    metadata: app.metadata,
                    createdAt: app.createdAt
                },
                message: 'App generated successfully'
            });

        } catch (openaiError) {
            console.error('OpenAI API Error:', openaiError);

            // Update app status to failed
            app.status = 'failed';
            app.errorMessage = openaiError.message || 'Failed to generate app';
            await app.save();

            return res.status(500).json({
                error: 'Failed to generate app',
                details: openaiError.message,
                appId: app._id
            });
        }

    } catch (error) {
        console.error('Generate app error:', error);
        res.status(500).json({
            error: 'Failed to generate app',
            details: error.message
        });
    }
};

// @desc    Get user's apps
// @route   GET /api/apps
// @access  Private
const getUserApps = async (req, res) => {
    try {
        const apps = await App.find({ user: req.user._id })
            .populate('requirement', 'title prompt extractedRequirements')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apps.length,
            apps: apps.map(app => ({
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                requirement: app.requirement,
                createdAt: app.createdAt,
                updatedAt: app.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get user apps error:', error);
        res.status(500).json({
            error: 'Failed to retrieve apps',
            details: error.message
        });
    }
};

// @desc    Get specific app by ID
// @route   GET /api/apps/:id
// @access  Private
const getAppById = async (req, res) => {
    try {
        const app = await App.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('requirement', 'title prompt extractedRequirements');

        if (!app) {
            return res.status(404).json({
                error: 'App not found or not authorized'
            });
        }

        res.status(200).json({
            success: true,
            app: {
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                generatedCode: app.generatedCode,
                requirement: app.requirement,
                metadata: app.metadata,
                errorMessage: app.errorMessage,
                createdAt: app.createdAt,
                updatedAt: app.updatedAt
            }
        });
    } catch (error) {
        console.error('Get app by ID error:', error);
        res.status(500).json({
            error: 'Failed to retrieve app',
            details: error.message
        });
    }
};

// @desc    Delete app
// @route   DELETE /api/apps/:id
// @access  Private
const deleteApp = async (req, res) => {
    try {
        const app = await App.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!app) {
            return res.status(404).json({
                error: 'App not found or not authorized'
            });
        }

        await App.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'App deleted successfully'
        });
    } catch (error) {
        console.error('Delete app error:', error);
        res.status(500).json({
            error: 'Failed to delete app',
            details: error.message
        });
    }
};

// @desc    Get apps for a specific requirement
// @route   GET /api/apps/requirement/:requirementId
// @access  Private
const getAppsByRequirement = async (req, res) => {
    try {
        const { requirementId } = req.params;

        // Verify the requirement belongs to the user
        const requirement = await Requirement.findOne({
            _id: requirementId,
            user: req.user._id
        });

        if (!requirement) {
            return res.status(404).json({
                error: 'Requirement not found or not authorized'
            });
        }

        const apps = await App.find({
            requirement: requirementId,
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apps.length,
            requirementTitle: requirement.title,
            apps: apps.map(app => ({
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                createdAt: app.createdAt,
                updatedAt: app.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get apps by requirement error:', error);
        res.status(500).json({
            error: 'Failed to retrieve apps for requirement',
            details: error.message
        });
    }
};

module.exports = {
    generateApp,
    getUserApps,
    getAppById,
    deleteApp,
    getAppsByRequirement
};