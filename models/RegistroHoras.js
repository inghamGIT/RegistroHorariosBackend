const { Schema, model } = require('mongoose');

const regSchema = new Schema ({
    horaEntrada: Date,
    horaSalida: Date,
    fecha: Date,
    user: { type: String, required: true },
    descripcion: String
}, {
    timestamps: true
});

module.exports = model('RegistroHoras', regSchema);