const mongoose = require('mongoose');
const OpenAI = require('openai');
const App = require('../models/App');
const Requirement = require('../models/Requirement');
const { updateRequirementStatus } = require('./requirementsController');
const { validateGeneratedApp } = require('./codeValidationController');

const MAX_VALIDATION_RETRIES = parseInt(process.env.CODE_VALIDATION_MAX_RETRIES || '3');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for app generation
const SYSTEM_PROMPT = `
Code Template:
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

const performOpenAIGeneration = async (generationPrompt, logLabel = 'generation') => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Sending ${logLabel} prompt to OpenAI:\n`, generationPrompt);
    }

    const completion = await openai.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        input: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: generationPrompt }
        ]
    });

    if (!completion || !completion.output_text || !completion.output) {
        console.error('Invalid OpenAI response structure:', completion);
        throw new Error('Invalid response from AI service');
    }

    const response = completion.output_text.trim();

    if (!response || response.length === 0) {
        throw new Error('Empty response from AI service');
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log(`OpenAI ${logLabel} response:\n`, response);
    }

    return {
        code: response,
        tokensUsed: completion.usage?.total_tokens || 0,
        generationPrompt
    };
};

const buildAppResponse = (app, {
    includeCode = true,
    includeGenerationPrompt = process.env.NODE_ENV !== 'production'
} = {}) => {
    if (!app) {
        return null;
    }

    return {
        id: app._id,
        name: app.name,
        description: app.description,
        status: app.status,
        colorCode: app.colorCode,
        ...(includeCode && { generatedCode: app.generatedCode }),
        requirement: app.requirement,
        metadata: app.metadata ? {
            processingTime: app.metadata.processingTime,
            tokensUsed: app.metadata.tokensUsed,
            apiVersion: app.metadata.apiVersion,
            ...(includeGenerationPrompt && app.metadata.generationPrompt ? { generationPrompt: app.metadata.generationPrompt } : {})
        } : null,
        errorMessage: app.errorMessage,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
    };
};

const buildGenerationPrompt = (requirement, warningMessage) => {
    const normalizedWarning = typeof warningMessage === 'string' && warningMessage.trim().length > 0
        ? warningMessage.trim()
        : null;

    const warningSection = normalizedWarning
        ? `Warning Message: ${normalizedWarning}
Ensure the generated application accounts for this warning when implementing features, validations, and UI safeguards.`
        : '';

    return `
Based on this and this requirement list:

${JSON.stringify(requirement.extractedRequirements ?? {}, null, 2)}

Theme Color: ${requirement.colorCode || '#1976d2'}
Use this color as the primary theme color throughout the application. Apply it to AppBars, primary buttons, active states, and other key UI elements. You can create variations of this color (lighter/darker shades) for hover states and secondary elements.
${warningSection}

Using simple code and checking it over. Use MaterialUI components to make a mock web-app from the template given. And ensure more than basic functionality. Do your best to include advanced lists, checkboxes, saving data and anything advanced where possible. Think about what features would be requirements even if not directly in the requirements list.

ENSURE TO ALWAYS STICK TO MATERIAL UI AND THE TEMPLATE GIVEN. DO NOT USE ANY OTHER LIBRARIES OR EXTENRAL RESOURCES. DO NOT USE ANY APIS`;
};

// @desc    Generate app from requirements
// @route   POST /api/apps/generate
// @access  Private (requires authentication)
const generateApp = async (req, res) => {
    const startTime = Date.now();
    let app = null;
    let generationPrompt = null;

    try {
        const { requirementId } = req.body;

        if (!requirementId) {
            return res.status(400).json({
                error: 'Requirement ID is required'
            });
        }

        const requirement = await Requirement.findOne({
            _id: requirementId,
            user: req.user._id
        });

        if (!requirement) {
            return res.status(404).json({
                error: 'Requirement not found or not authorized'
            });
        }

        app = new App({
            name: requirement.extractedRequirements?.appName || requirement.title || 'Generated App',
            description: requirement.prompt ? requirement.prompt.substring(0, 500) : 'Generated from requirements',
            user: req.user._id,
            requirement: requirementId,
            colorCode: requirement.colorCode,
            generatedCode: { code: '' },
            status: 'generating'
        });

        await app.save();

        generationPrompt = buildGenerationPrompt(requirement);

        try {
            const { code, tokensUsed } = await performOpenAIGeneration(generationPrompt, 'generation');
            const processingTime = Date.now() - startTime;

            app.generatedCode = { code };
            app.status = 'completed';
            app.metadata = {
                processingTime,
                tokensUsed,
                apiVersion: 'gpt-5-mini',
                generationPrompt
            };
            app.errorMessage = null;

            await app.save();

            const validationResult = await validateGeneratedApp({
                appId: app._id,
                userId: req.user._id,
                requirementId,
                maxRetries: MAX_VALIDATION_RETRIES,
                regenerateFn: async ({ warningMessage }) => regenerateAppInternal({
                    appId: app._id,
                    userId: req.user._id,
                    warningMessage
                })
            });

            const finalApp = await App.findOne({
                _id: app._id,
                user: req.user._id
            }).populate('requirement', 'title prompt extractedRequirements colorCode');

            if (!validationResult.success) {
                return res.status(500).json({
                    error: 'Failed to generate a valid app',
                    details: validationResult.errorMessage,
                    appId: finalApp?._id,
                    app: buildAppResponse(finalApp)
                });
            }

            return res.status(200).json({
                success: true,
                app: buildAppResponse(finalApp),
                message: 'App generated successfully'
            });
        } catch (openaiError) {
            console.error('OpenAI API Error:', openaiError);

            app.status = 'failed';
            app.errorMessage = openaiError.message || 'Failed to generate app';
            app.metadata = {
                processingTime: Date.now() - startTime,
                tokensUsed: 0,
                apiVersion: 'gpt-5-mini',
                generationPrompt
            };
            await app.save();
            await updateRequirementStatus(requirementId, 'failed');

            return res.status(500).json({
                error: 'Failed to generate app',
                details: openaiError.message,
                appId: app._id,
                app: buildAppResponse(app)
            });
        }
    } catch (error) {
        console.error('Generate app error:', error);

        if (app) {
            try {
                await App.findByIdAndUpdate(app._id, {
                    status: 'failed',
                    errorMessage: error.message || 'Unexpected error during generation'
                });

                if (app.requirement) {
                    await updateRequirementStatus(app.requirement, 'failed');
                }
            } catch (updateError) {
                console.error('Failed to update app status:', updateError);
            }
        }

        return res.status(500).json({
            error: 'Failed to generate app',
            details: error.message || 'An unexpected error occurred'
        });
    }
};

const regenerateAppInternal = async ({ appId, userId, warningMessage }) => {
    const startTime = Date.now();

    if (!mongoose.Types.ObjectId.isValid(appId)) {
        return {
            success: false,
            statusCode: 400,
            errorMessage: 'Invalid App ID'
        };
    }

    const app = await App.findOne({
        _id: appId,
        user: userId
    });

    if (!app) {
        return {
            success: false,
            statusCode: 404,
            errorMessage: 'App not found or not authorized'
        };
    }

    const requirement = await Requirement.findOne({
        _id: app.requirement,
        user: userId
    });

    if (!requirement) {
        return {
            success: false,
            statusCode: 404,
            errorMessage: 'Requirement not found or not authorized'
        };
    }

    const generationPrompt = buildGenerationPrompt(requirement, warningMessage);

    app.status = 'generating';
    app.errorMessage = null;
    await app.save();

    try {
        const { code, tokensUsed } = await performOpenAIGeneration(generationPrompt, 'regeneration');
        const processingTime = Date.now() - startTime;

        if (!warningMessage || (typeof warningMessage === 'string' && warningMessage.trim().length === 0)) {
            const currentName = app.name;
            const versionRegex = / - V(\d+)$/;
            const match = currentName.match(versionRegex);

            if (match) {
                const currentVersion = parseInt(match[1], 10);
                app.name = currentName.replace(versionRegex, ` - V${currentVersion + 1}`);
            } else {
                app.name = `${currentName} - V2`;
            }
        }

        app.generatedCode = { code };
        app.status = 'completed';
        app.metadata = {
            processingTime,
            tokensUsed,
            apiVersion: 'gpt-5-mini',
            generationPrompt
        };
        app.errorMessage = null;

        await app.save();

        return {
            success: true,
            app,
            requirement
        };
    } catch (error) {
        console.error('OpenAI API Regeneration Error:', error);

        app.status = 'failed';
        app.errorMessage = error.message || 'Failed to regenerate app';
        app.metadata = {
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            apiVersion: 'gpt-5-mini',
            generationPrompt
        };

        await app.save();

        return {
            success: false,
            statusCode: 500,
            errorMessage: error.message || 'Failed to regenerate app',
            app,
            requirement
        };
    }
};

// @desc    Regenerate app code using existing requirement
// @route   POST /api/apps/regenerate
// @access  Private
const regenerateApp = async (req, res) => {
    try {
        const { appId, warningMessage } = req.body;

        if (!appId) {
            return res.status(400).json({
                error: 'App ID is required'
            });
        }

        const initialResult = await regenerateAppInternal({
            appId,
            userId: req.user._id,
            warningMessage
        });

        if (!initialResult.success) {
            if (initialResult.requirement?._id) {
                await updateRequirementStatus(initialResult.requirement._id, 'failed');
            }

            const statusCode = initialResult.statusCode || 500;

            if (statusCode === 404) {
                return res.status(404).json({
                    error: initialResult.errorMessage || 'App not found or not authorized'
                });
            }

            if (statusCode === 400) {
                return res.status(400).json({
                    error: initialResult.errorMessage || 'Invalid App ID'
                });
            }

            return res.status(500).json({
                error: 'Failed to regenerate app',
                details: initialResult.errorMessage,
                appId
            });
        }

        const validationResult = await validateGeneratedApp({
            appId,
            userId: req.user._id,
            requirementId: initialResult.requirement._id,
            maxRetries: MAX_VALIDATION_RETRIES,
            regenerateFn: async ({ warningMessage: autoWarning }) => regenerateAppInternal({
                appId,
                userId: req.user._id,
                warningMessage: autoWarning
            })
        });

        const finalApp = await App.findOne({
            _id: appId,
            user: req.user._id
        }).populate('requirement', 'title prompt extractedRequirements colorCode');

        if (!validationResult.success) {
            return res.status(500).json({
                error: 'Failed to regenerate app',
                details: validationResult.errorMessage,
                appId,
                app: buildAppResponse(finalApp)
            });
        }

        return res.status(200).json({
            success: true,
            app: buildAppResponse(finalApp),
            message: 'App regenerated successfully'
        });
    } catch (error) {
        console.error('Regenerate app error:', error);

        return res.status(500).json({
            error: 'Failed to regenerate app',
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
            apps: apps.map(app => buildAppResponse(app, {
                includeCode: false,
                includeGenerationPrompt: false
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

        res.status(200).json({
            success: true,
            app: buildAppResponse(app)
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
            apps: apps.map(app => buildAppResponse(app, {
                includeCode: false,
                includeGenerationPrompt: false
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
    regenerateApp,
    getUserApps,
    getAppById,
    deleteApp,
    getAppsByRequirement
};