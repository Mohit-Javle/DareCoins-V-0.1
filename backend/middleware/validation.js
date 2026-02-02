const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().required(), // Allow username or email
    password: Joi.string().required()
});

const dareSchema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500).required(),
    reward: Joi.number().min(0).required(),
    timeframe: Joi.string().required(),
    category: Joi.string().valid('Physical', 'Social', 'Creative', 'Funny', 'Other', 'Fitness', 'Extreme', 'Crypto', 'Personal', 'Deep', 'Dirty', 'Random').required(),
    targetUser: Joi.string().allow(null, '').optional()
}).unknown(true); // Allow unknown fields

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        // Log validation error
        const fs = require('fs');
        const path = require('path');
        try {
            fs.appendFileSync(path.join(__dirname, '../validation_error.log'), `${new Date().toISOString()} - Validation Error: ${error.details[0].message} - Body: ${JSON.stringify(req.body)}\n`);
        } catch (e) { }

        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegister: validateRequest(registerSchema),
    validateLogin: validateRequest(loginSchema),
    validateDare: validateRequest(dareSchema)
};
