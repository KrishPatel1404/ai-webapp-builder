const { ESLint } = require('eslint');
const babel = require('@babel/core');
const App = require('../models/App');
const { updateRequirementStatus } = require('./requirementsController');

const DEFAULT_MAX_RETRIES = parseInt(process.env.CODE_VALIDATION_MAX_RETRIES || '3', 10);
const IS_DEV = process.env.NODE_ENV !== 'production';

const ESLINT_BASE_CONFIG = {
    root: true,
    env: {
        browser: true,
        es2021: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    globals: {
        MaterialUI: 'readonly',
        React: 'readonly',
        ReactDOM: 'readonly'
    }
};

const formatLintMessages = (messages = []) => {
    if (!messages.length) {
        return null;
    }

    const firstError = messages[0];
    const location = firstError.line ? ` at line ${firstError.line}, column ${firstError.column}` : '';
    return `${firstError.message}${location}`;
};

const runESLintCheck = async (code) => {
    if (IS_DEV) {
        console.log('[CodeValidation] Running ESLint check');
    }

    const eslint = new ESLint({
        useEslintrc: false,
        baseConfig: ESLINT_BASE_CONFIG
    });

    const results = await eslint.lintText(code, { filePath: 'generated-app.jsx' });

    if (!results || !results.length) {
        if (IS_DEV) {
            console.log('[CodeValidation] ESLint produced no results, assuming valid');
        }
        return { valid: true };
    }

    const [firstResult] = results;
    const errorMessages = firstResult.messages.filter(message => message.severity === 2);

    if (errorMessages.length > 0) {
        if (IS_DEV) {
            console.log('[CodeValidation] ESLint errors detected:', errorMessages.map(msg => msg.message));
        }
        return {
            valid: false,
            errorMessage: `ESLint error: ${formatLintMessages(errorMessages) || 'Unknown linting error'}`
        };
    }

    if (IS_DEV) {
        console.log('[CodeValidation] ESLint check passed');
    }

    return { valid: true };
};

const runBabelCheck = async (code) => {
    if (IS_DEV) {
        console.log('[CodeValidation] Running Babel compile check');
    }

    try {
        await babel.transformAsync(code, {
            presets: [
                ['@babel/preset-env', { targets: { esmodules: true } }],
                ['@babel/preset-react', { runtime: 'classic' }]
            ],
            sourceType: 'script',
            filename: 'generated-app.jsx'
        });

        if (IS_DEV) {
            console.log('[CodeValidation] Babel compile succeeded');
        }

        return { valid: true };
    } catch (error) {
        if (IS_DEV) {
            console.log('[CodeValidation] Babel compile error:', error.message);
        }
        return {
            valid: false,
            errorMessage: `Babel compile error: ${error.message || 'Unknown compilation error'}`
        };
    }
};

const validateCode = async (code) => {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return {
            valid: false,
            errorMessage: 'Generated code is empty or invalid.'
        };
    }

    const lintResult = await runESLintCheck(code);
    if (!lintResult.valid) {
        return lintResult;
    }

    const babelResult = await runBabelCheck(code);
    if (!babelResult.valid) {
        return babelResult;
    }

    return { valid: true };
};

const validateGeneratedApp = async ({
    appId,
    userId,
    requirementId,
    regenerateFn,
    maxRetries = DEFAULT_MAX_RETRIES
}) => {
    let attempts = 0;
    let lastError = null;

    while (attempts <= maxRetries) {
        const app = await App.findOne({
            _id: appId,
            user: userId
        }).populate('requirement', '_id');

        if (!app) {
            throw new Error('App not found during validation.');
        }

        if (IS_DEV) {
            console.log(`[CodeValidation] Validation attempt ${attempts + 1} for app ${appId}`);
        }

        const code = app.generatedCode?.code || '';
        const validationResult = await validateCode(code);

        if (validationResult.valid) {
            if (IS_DEV) {
                console.log('[CodeValidation] Validation passed, marking app as completed');
            }
            await App.findByIdAndUpdate(appId, {
                status: 'completed',
                errorMessage: null
            });

            if (requirementId || app.requirement?._id) {
                await updateRequirementStatus(requirementId || app.requirement._id, 'completed');
            }

            return {
                success: true,
                attempts,
                appId
            };
        }

        lastError = validationResult.errorMessage || 'Unknown validation error';
        if (IS_DEV) {
            console.log('[CodeValidation] Validation failed:', lastError);
        }
        attempts += 1;

        if (attempts > maxRetries) {
            if (IS_DEV) {
                console.log('[CodeValidation] Max validation attempts exceeded, marking app as failed');
            }
            await App.findByIdAndUpdate(appId, {
                status: 'failed',
                errorMessage: lastError
            });

            if (requirementId || app.requirement?._id) {
                await updateRequirementStatus(requirementId || app.requirement._id, 'failed');
            }

            return {
                success: false,
                attempts,
                errorMessage: lastError
            };
        }

        if (typeof regenerateFn !== 'function') {
            if (IS_DEV) {
                console.log('[CodeValidation] No regeneration function provided, failing app');
            }
            await App.findByIdAndUpdate(appId, {
                status: 'failed',
                errorMessage: lastError
            });

            if (requirementId || app.requirement?._id) {
                await updateRequirementStatus(requirementId || app.requirement._id, 'failed');
            }

            return {
                success: false,
                attempts,
                errorMessage: lastError
            };
        }

        if (IS_DEV) {
            console.log('[CodeValidation] Triggering regeneration due to validation error');
        }
        const regenerationResult = await regenerateFn({ warningMessage: lastError, attempts });

        if (!regenerationResult || !regenerationResult.success) {
            const regenerationError = regenerationResult?.errorMessage || lastError;

            if (IS_DEV) {
                console.log('[CodeValidation] Regeneration failed:', regenerationError);
            }

            await App.findByIdAndUpdate(appId, {
                status: 'failed',
                errorMessage: regenerationError
            });

            if (requirementId || app.requirement?._id) {
                await updateRequirementStatus(requirementId || app.requirement._id, 'failed');
            }

            return {
                success: false,
                attempts,
                errorMessage: regenerationError
            };
        }

        if (IS_DEV) {
            console.log('[CodeValidation] Regeneration succeeded, re-validating new code');
        }
    }

    if (IS_DEV) {
        console.log('[CodeValidation] Validation loop ended without success:', lastError || 'Validation failed.');
    }

    return {
        success: false,
        attempts,
        errorMessage: lastError || 'Validation failed.'
    };
};

module.exports = {
    validateGeneratedApp
};
