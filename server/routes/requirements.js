const express = require('express');
const { protect } = require('../middleware/auth');
const {
    extractRequirements,
    getUserRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement
} = require('../controllers/requirementsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Extract requirements from text & Get user's requirements
// @route   POST /api/requirements & GET /api/requirements
// @access  Private
router.route('/')
    .post(extractRequirements)
    .get(getUserRequirements);

// @desc    Get specific requirement, Update requirement & Delete requirement
// @route   GET /api/requirements/:id, PUT /api/requirements/:id & DELETE /api/requirements/:id
// @access  Private
router.route('/:id')
    .get(getRequirementById)
    .put(updateRequirement)
    .delete(deleteRequirement);

module.exports = router;