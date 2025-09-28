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
Template:
const { AppBar, Toolbar, Typography, Tabs, Tab, Box, Container, Button, Card, CardContent } = MaterialUI; 
const { useState } = React;

function DemoApp() {
    const [value, setValue] = useState(0);
    // Add as many as needed

    const handleChange = (event, newValue) => {
        setValue(newValue);
        // Add as many as needed
    };

    return (
    <>
        // Code goes here
    </>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DemoApp />);

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
            name: requirement.extractedRequirements?.appName || requirement.title || 'Generated App',
            description: requirement.prompt ? requirement.prompt.substring(0, 500) : 'Generated from requirements',
            user: req.user._id,
            requirement: requirementId,
            colorCode: requirement.colorCode, // Inherit color from requirement
            generatedCode: { code: '' }, // Initialize with empty code structure
            status: 'generating'
        });

        await app.save();

        // Prepare the prompt for OpenAI
        const generationPrompt = `
Based on this and this requirement list:

${JSON.stringify(requirement.extractedRequirements, null, 2)}

Theme Color: ${requirement.colorCode}
Use this color as the primary theme color throughout the application. Apply it to AppBars, primary buttons, active states, and other key UI elements. You can create variations of this color (lighter/darker shades) for hover states and secondary elements.

Using simple code and checking it over. Use MaterialUI components to make a mock web-app from the template given. And ensure more than basic functionality. Do your best to include advanced lists, checkboxes, saving data and anything advanced where possible. Think about what features would be requirements even if not directly in the requirements list.

ENSURE TO ALWAYS STICK TO MATERIAL UI AND THE TEMPLATE GIVEN. DO NOT USE ANY OTHER LIBRARIES OR EXTENRAL RESOURCES. DO NOT USE ANY APIS`;

        try {
            // Log the prompt being sent to OpenAI (for debugging)
            if (process.env.NODE_ENV !== 'production') {
                console.log('Sending generation prompt to OpenAI:\n', generationPrompt);
            }

            // Call OpenAI API using gpt-5
            const completion = await openai.responses.create({
                model: "gpt-5",
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

            // Parse the Text (Javascript) response
            let generatedCode;
            try {
                generatedCode = { code: response };
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
                apiVersion: 'gpt-5',
                generationPrompt
            };

            await app.save();

            // Update requirement status to 'completed' since an app was successfully generated
            await updateRequirementStatus(requirementId, 'completed');

            // Return success response with full app data (including generatedCode for single app responses)
            res.status(200).json({
                success: true,
                app: {
                    id: app._id,
                    name: app.name,
                    description: app.description,
                    status: app.status,
                    colorCode: app.colorCode,
                    generatedCode: app.generatedCode,
                    metadata: {
                        processingTime: app.metadata.processingTime,
                        tokensUsed: app.metadata.tokensUsed,
                        apiVersion: app.metadata.apiVersion
                    },
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt
                },
                message: 'App generated successfully'
            });

        } catch (openaiError) {
            console.error('OpenAI API Error:', openaiError);

            // Update app status to failed
            app.status = 'failed';
            app.errorMessage = openaiError.message || 'Failed to generate app';
            app.metadata = {
                processingTime: Date.now() - startTime,
                tokensUsed: 0,
                apiVersion: 'gpt-5',
                generationPrompt
            };
            await app.save();

            return res.status(500).json({
                error: 'Failed to generate app',
                details: openaiError.message,
                appId: app._id,
                app: {
                    id: app._id,
                    name: app.name,
                    description: app.description,
                    status: app.status,
                    errorMessage: app.errorMessage,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt
                }
            });
        }

    } catch (error) {
        console.error('Generate app error:', error);

        // Try to update app status to failed if app was created
        if (error.app && error.app._id) {
            try {
                await App.findByIdAndUpdate(error.app._id, {
                    status: 'failed',
                    errorMessage: error.message || 'Unexpected error during generation',
                    metadata: {
                        processingTime: Date.now() - startTime,
                        tokensUsed: 0,
                        apiVersion: 'gpt-5'
                    }
                });
            } catch (updateError) {
                console.error('Failed to update app status:', updateError);
            }
        }

        res.status(500).json({
            error: 'Failed to generate app',
            details: error.message || 'An unexpected error occurred'
        });
    }
};

// @desc    Get user's apps
// @route   GET /api/apps
// @access  Private
const getUserApps = async (req, res) => {
    try {
        const apps = await App.find({ user: req.user._id })
            .select('-generatedCode -metadata.generationPrompt') // Exclude generated code and large prompt text
            .populate('requirement', 'title extractedRequirements.appName colorCode')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apps.length,
            apps: apps.map(app => ({
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                colorCode: app.colorCode,
                requirement: app.requirement,
                errorMessage: app.errorMessage,
                metadata: app.metadata ? {
                    processingTime: app.metadata.processingTime,
                    tokensUsed: app.metadata.tokensUsed,
                    apiVersion: app.metadata.apiVersion
                } : null,
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
        }).populate('requirement', 'title prompt extractedRequirements colorCode');

        if (!app) {
            return res.status(404).json({
                error: 'App not found or not authorized'
            });
        }

        // For individual app requests, include the full generatedCode
        res.status(200).json({
            success: true,
            app: {
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                colorCode: app.colorCode,
                generatedCode: app.generatedCode,
                requirement: app.requirement,
                metadata: app.metadata ? {
                    processingTime: app.metadata.processingTime,
                    tokensUsed: app.metadata.tokensUsed,
                    apiVersion: app.metadata.apiVersion,
                    // Include generationPrompt only for individual app requests if needed for debugging
                    ...(process.env.NODE_ENV !== 'production' && { generationPrompt: app.metadata.generationPrompt })
                } : null,
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

        // Store app info before deletion for response
        const deletedAppInfo = {
            id: app._id,
            name: app.name,
            status: app.status
        };

        await App.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'App deleted successfully',
            deletedApp: deletedAppInfo
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
        })
            .select('-generatedCode -metadata.generationPrompt') // Exclude generated code and large prompt text
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: apps.length,
            requirementTitle: requirement.title,
            apps: apps.map(app => ({
                id: app._id,
                name: app.name,
                description: app.description,
                status: app.status,
                errorMessage: app.errorMessage,
                metadata: app.metadata ? {
                    processingTime: app.metadata.processingTime,
                    tokensUsed: app.metadata.tokensUsed,
                    apiVersion: app.metadata.apiVersion
                } : null,
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