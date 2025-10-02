const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod');
const { z } = require('zod');
const Requirement = require('../models/Requirement');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for requirement extraction
const SYSTEM_PROMPT = `
You are an expert business analyst specialized in extracting structured software requirements from natural language descriptions.
Your job: analyze the input text and fill any details you can infer from the text. Keep the features simple and concise you are making a mock app.
Rules:
- Extract ONLY what is explicitly stated or reasonably implied in the text.
- Do not invent requirements that are not supported by the input.
- Be specific and actionable in feature descriptions.
- Keep names concise and consistent, but meaningful and use spaces between words.
- Do not include any API calls, database schemas, or external implementation details in the requirements.
`;

// Zod schema for structured requirements
const RequirementSchema = z.object({
    appName: z.string(),
    entities: z.array(z.string()),
    roles: z.array(z.string()),
    features: z.array(z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        userRole: z.string(),
        hint: z.string()
    })),
    technicalRequirements: z.array(z.string()),
    businessRules: z.array(z.string())
});

// @desc    Extract requirements from natural language text
// @route   POST /api/requirements
// @access  Private (requires authentication)
const extractRequirements = async (req, res) => {
    const startTime = Date.now();
    let requirement = null;
    let requirementId = null;

    try {
        const { text } = req.body;

        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length < 100) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid text field with the requirement description of at least 100 characters.'
            });
        }

        if (text.length > 1500) {
            return res.status(400).json({
                success: false,
                message: 'Text input is too long. Please limit to 1500 characters.'
            });
        }

        // Create initial database entry with 'processing' status
        requirement = await Requirement.create({
            prompt: text.trim(),
            title: `Processing - ${new Date().toLocaleDateString()}`,
            extractedRequirements: {},
            user: req.user._id,
            status: 'processing',
            metadata: {
                processingTime: 0,
                tokensUsed: 0,
                apiVersion: 'gpt-5-nano'
            }
        });
        requirementId = requirement._id;

        try {
            // Call OpenAI API using gpt-5-nano
            const completion = await openai.responses.parse({
                model: "gpt-5-nano",
                reasoning: { effort: "low" },
                input: [
                    {
                        role: "system",
                        content: "You are an expert business analyst. Extract structured software requirements from natural language text into the defined schema."
                    },
                    { role: "user", content: text }
                ],
                text: {
                    format: zodTextFormat(RequirementSchema, "requirements_schema")
                }
            });

            // Check if the response is valid
            if (!completion || !completion.output_parsed) {
                console.error('Invalid OpenAI response structure:', completion);
                throw new Error('Invalid response from AI service');
            }

            const extractedRequirements = completion.output_parsed;

            // Check if the AI response exists
            if (!extractedRequirements) {
                console.error('Empty AI response received');
                throw new Error('Empty response from AI service');
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log('AI Response:\n', extractedRequirements);
            }

            // Generate a title if not provided
            const title = extractedRequirements.appName ||
                `Requirements - ${new Date().toLocaleDateString()}`;

            // Calculate processing time
            const processingTime = Date.now() - startTime;

            // Update the requirement with the extracted data and set status to 'draft'
            requirement.title = title;
            requirement.extractedRequirements = extractedRequirements;
            requirement.status = 'draft';
            requirement.metadata = {
                processingTime: processingTime,
                tokensUsed: completion.usage?.total_tokens || 0,
                apiVersion: 'gpt-5-nano'
            };

            await requirement.save();

            // Populate user data for response
            await requirement.populate('user', 'name email');

            res.status(201).json({
                success: true,
                message: 'Requirements extracted successfully',
                data: {
                    id: requirement._id,
                    title: requirement.title,
                    prompt: requirement.prompt,
                    extractedRequirements: requirement.extractedRequirements,
                    user: requirement.user,
                    status: requirement.status,
                    createdAt: requirement.createdAt,
                    metadata: requirement.metadata
                }
            });

        } catch (aiError) {
            const failedRequirementId = requirementId;

            if (failedRequirementId) {
                try {
                    await Requirement.deleteOne({ _id: failedRequirementId });
                } catch (deleteError) {
                    console.error('Error deleting failed requirement:', deleteError);
                } finally {
                    requirement = null;
                }
            }

            console.error('AI processing error:', aiError);

            // Handle specific OpenAI errors
            if (aiError.code === 'insufficient_quota') {
                return res.status(402).json({
                    success: false,
                    message: 'OpenAI API quota exceeded. Please try again later.',
                    requirementId: failedRequirementId
                });
            }

            if (aiError.code === 'invalid_api_key') {
                return res.status(500).json({
                    success: false,
                    message: 'OpenAI API configuration error',
                    requirementId: failedRequirementId
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to extract requirements',
                details: aiError.message,
                requirementId: failedRequirementId
            });
        }

    } catch (error) {
        console.error('Error in extractRequirements:', error);

        const failedRequirementId = requirementId;

        if (failedRequirementId) {
            try {
                await Requirement.deleteOne({ _id: failedRequirementId });
            } catch (deleteError) {
                console.error('Error deleting failed requirement:', deleteError);
            } finally {
                requirement = null;
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to extract requirements',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            requirementId: failedRequirementId
        });
    }
};

// @desc    Get all requirements for the authenticated user
// @route   GET /api/requirements
// @access  Private
const getUserRequirements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const requirements = await Requirement.find({ user: req.user._id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Requirement.countDocuments({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: requirements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error in getUserRequirements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requirements',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get a specific requirement by ID
// @route   GET /api/requirements/:id
// @access  Private
const getRequirementById = async (req, res) => {
    try {
        const requirement = await Requirement.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('user', 'name email');

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: requirement
        });

    } catch (error) {
        console.error('Error in getRequirementById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requirement',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Delete a requirement
// @route   DELETE /api/requirements/:id
// @access  Private
const deleteRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        await requirement.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Requirement deleted successfully'
        });

    } catch (error) {
        console.error('Error in deleteRequirement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete requirement',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update a requirement
// @route   PUT /api/requirements/:id
// @access  Private
const updateRequirement = async (req, res) => {
    try {
        const { title, prompt, extractedRequirements, colorCode } = req.body;

        // Find the requirement and ensure it belongs to the authenticated user
        const requirement = await Requirement.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        // Validate input
        if (prompt && (typeof prompt !== 'string' || prompt.trim().length < 10)) {
            return res.status(400).json({
                success: false,
                message: 'Prompt must be at least 10 characters long'
            });
        }

        if (prompt && prompt.length > 1500) {
            return res.status(400).json({
                success: false,
                message: 'Prompt cannot be more than 1500 characters'
            });
        }

        if (title && (typeof title !== 'string' || title.trim().length < 1)) {
            return res.status(400).json({
                success: false,
                message: 'Title is required and cannot be empty'
            });
        }

        if (title && title.length > 150) {
            return res.status(400).json({
                success: false,
                message: 'Title cannot be more than 150 characters'
            });
        }

        // Validate colorCode if provided
        if (colorCode !== undefined) {
            if (typeof colorCode !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(colorCode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Color code must be a valid hex color (e.g., #1976d2)'
                });
            }
        }

        // Validate extractedRequirements structure if provided
        if (extractedRequirements) {
            const requiredFields = ['appName', 'entities', 'roles', 'features', 'technicalRequirements', 'businessRules'];
            const missingFields = requiredFields.filter(field => !(field in extractedRequirements));

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields in extractedRequirements: ${missingFields.join(', ')}`
                });
            }

            // Validate that arrays are actually arrays
            const arrayFields = ['entities', 'roles', 'features', 'technicalRequirements', 'businessRules'];
            for (const field of arrayFields) {
                if (extractedRequirements[field] && !Array.isArray(extractedRequirements[field])) {
                    return res.status(400).json({
                        success: false,
                        message: `Field '${field}' must be an array`
                    });
                }
            }

            // Validate features structure
            if (extractedRequirements.features && extractedRequirements.features.length > 0) {
                for (const feature of extractedRequirements.features) {
                    if (!feature.title || typeof feature.title !== 'string') {
                        return res.status(400).json({
                            success: false,
                            message: 'Each feature must have a valid title'
                        });
                    }
                    if (!feature.description || typeof feature.description !== 'string') {
                        return res.status(400).json({
                            success: false,
                            message: 'Each feature must have a valid description'
                        });
                    }
                }
            }
        }

        // Update the requirement
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (prompt !== undefined) updateData.prompt = prompt.trim();
        if (extractedRequirements !== undefined) updateData.extractedRequirements = extractedRequirements;
        if (colorCode !== undefined) updateData.colorCode = colorCode;

        // Update the updatedAt timestamp
        updateData.updatedAt = new Date();

        const updatedRequirement = await Requirement.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Requirement updated successfully',
            data: updatedRequirement
        });

    } catch (error) {
        console.error('Error in updateRequirement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update requirement',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update requirement status (internal use)
// @access  Internal function for other controllers
const updateRequirementStatus = async (requirementId, status) => {
    try {
        const requirement = await Requirement.findByIdAndUpdate(
            requirementId,
            { status: status },
            { new: true }
        );
        return requirement;
    } catch (error) {
        console.error('Error updating requirement status:', error);
        throw error;
    }
};

module.exports = {
    extractRequirements,
    getUserRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement,
    updateRequirementStatus
};