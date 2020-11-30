const Joi = require('joi');

const registerSchema = Joi.object({

    nomEmp: Joi.string()
        .min(3)
        .max(30)
        .required(),

    apeEmp: Joi.string()
        .min(3)
        .max(60)
        .required(),

    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    pass:  Joi.string()
        //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .min(4)
        .max(30)
        .required(),

    confirm: Joi.ref('pass'),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['es', 'com', 'net'] } })
        .lowercase()
        .required()
});

const loginSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    pass:  Joi.string()
        //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .min(4)
        .max(30)
        .required()
});

const registroSchema = Joi.object({
    horaEntrada: Joi.string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),

    horaSalida: Joi.string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),

    descripcion: Joi.string()
});

module.exports = { registerSchema, loginSchema, registroSchema }