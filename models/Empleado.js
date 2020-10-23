const { Schema, model } = require('mongoose');

const empSchema = new Schema ({
    nomEmp: { type: String, required: true },
    apeEmp: { type: String, required: true },
    username: { type: String, lowercase: true, required: true },
    pass: { type: String, required: true },
    email: { type: String, required: true },
    tokenFCM: { type: String }
}, {
    timestamps: true
});

module.exports = model('Empleado', empSchema);