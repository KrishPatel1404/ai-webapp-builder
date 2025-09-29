const express = require('express');
const { protect } = require('../middleware/auth');
const {
    generateApp,
    regenerateApp,
    getUserApps,
    getAppById,
    deleteApp,
    getAppsByRequirement
} = require('../controllers/appsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Generate app from requirements & Get user's apps
// @route   POST /api/apps/generate & GET /api/apps
// @access  Private
router.route('/')
    .get(getUserApps);

// @desc    Generate app from requirements
// @route   POST /api/apps/generate
// @access  Private
router.post('/generate', generateApp);

// @desc    Regenerate app from existing app and requirement
// @route   POST /api/apps/regenerate
// @access  Private
router.post('/regenerate', regenerateApp);

// @desc    Get apps for a specific requirement
// @route   GET /api/apps/requirement/:requirementId
// @access  Private
router.get('/requirement/:requirementId', getAppsByRequirement);

// @desc    Get specific app & Delete app
// @route   GET /api/apps/:id & DELETE /api/apps/:id
// @access  Private
router.route('/:id')
    .get(getAppById)
    .delete(deleteApp);

module.exports = router;