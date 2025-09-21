const OpenAI = require('openai');
const Requirement = require('../models/Requirement');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for requirement extraction
const SYSTEM_PROMPT = ``;

// @desc    Extract requirements from natural language text
// @route   POST /api/requirements
// @access  Private (requires authentication)
const extractRequirements = async (req, res) => {
    const startTime = Date.now();

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

        // Call OpenAI API using gpt-5-nano with flex tier
        // Flex tier provides cost optimization with potential variable latency
        const completion = await openai.responses.create({
            model: "gpt-5-nano",
            reasoning: { effort: "low" },
            input: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: text }
            ]
        });

        // Check if the response is valid
        if (!completion || !completion.output_text || !completion.output) {
            console.error('Invalid OpenAI response structure:', completion);
            return res.status(500).json({
                success: false,
                message: 'Invalid response from AI service',
                details: 'The AI service returned an unexpected response format'
            });
        }

        const aiResponse = completion.output_text;

        // Check if the AI response is empty or null
        if (!aiResponse || aiResponse.trim() === '') {
            console.error('Empty AI response received');
            return res.status(500).json({
                success: false,
                message: 'Empty response from AI service',
                details: 'The AI service returned an empty response'
            });
        }

        // Parse the AI response
        let extractedRequirements;
        try {
            extractedRequirements = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.error('Raw AI response that failed to parse:', JSON.stringify(aiResponse));
            return res.status(500).json({
                success: false,
                message: 'Failed to parse requirements from AI response',
                details: 'The AI response was not in valid JSON format',
                rawResponse: process.env.NODE_ENV === 'development' ? aiResponse : undefined
            });
        }

        // Generate a title if not provided
        const title = extractedRequirements.appName ||
            `Requirements - ${new Date().toLocaleDateString()}`;

        // Calculate processing time
        const processingTime = Date.now() - startTime;

        // Save to database
        const requirement = await Requirement.create({
            prompt: text.trim(),
            title: title,
            extractedRequirements: extractedRequirements,
            user: req.user._id,
            status: 'completed',
            metadata: {
                processingTime: processingTime,
                tokensUsed: completion.usage?.total_tokens || 0,
                apiVersion: 'gpt-5-nano'
            }
        });

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
                createdAt: requirement.createdAt,
                metadata: requirement.metadata
            }
        });

    } catch (error) {
        console.error('Error in extractRequirements:', error);

        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(402).json({
                success: false,
                message: 'OpenAI API quota exceeded. Please try again later.'
            });
        }

        if (error.code === 'invalid_api_key') {
            return res.status(500).json({
                success: false,
                message: 'OpenAI API configuration error'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to extract requirements',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

module.exports = {
    extractRequirements,
    getUserRequirements,
    getRequirementById,
    deleteRequirement
};