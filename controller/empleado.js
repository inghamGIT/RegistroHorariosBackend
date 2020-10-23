const Empleado = require('../models/Empleado');
const bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;

async function getAll (req, res) {
    try {
        const empleados = await Empleado.find();
        var e;
        for (e of empleados) {
            e.pass = undefined;
        }
        res.status(200).json({accion: 'get all', datos: empleados});
    }
    catch (err) {
        res.status(500).json({accion: 'get all', mensaje: 'Error al obtener los empleados.'})
    }
}

async function getById (req, res) {
    try {
        const empleadoId = req.params.id;
        let empleado = await Empleado.findById(empleadoId);
        empleado.pass = undefined;
        res.status(200).json({accion: 'get by id', datos: empleado});
    }
    catch {
        res.status(500).json({accion: 'get by id', mensaje: 'Error al obtener el empleado.'})
    }
}

async function getByUsername (req, res) {
    try {
        const username = req.params.username;
        let empleado = await Empleado.findOne({ username: username });
        empleado.pass = undefined;
        res.status(200).json({accion: 'get by username', datos: empleado});
    }
    catch {
        res.status(500).json({accion: 'get by username', mensaje: 'Error al obtener el empleado.'})
    }
}

async function updatePass (req, res) {
    try {
        const empleadoId = req.params.id;
        const { pass, newPass, confirm } = req.body

        if (newPass !== confirm) {
            return res.status(401).send({ mensaje: 'Las contraseñas no coinciden.' });
        }

        //Comprobamos que la contraseña coincide.
        const emp = await Empleado.findById(empleadoId);     
        const passValido = await bcrypt.compare(pass, emp.pass);
        if (!passValido) {
            return res.status(401).send({ mensaje: 'Contraseña erronea.' });
        }
        
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPass, salt);
        let o_id = new ObjectId(empleadoId);

        let empleado = await Empleado.updateOne({ _id: o_id }, {$set: {pass: hashedPassword}});
        res.status(200).json({accion: 'update password', datos: empleado});
    }
    catch {
        res.status(500).json({accion: 'Éxito en actualizar la contraseña', mensaje: 'Error al actualizar la contraseña.'})
    }
}

async function updateUser (req, res) {
    try {
        const empleadoId = req.params.id;
        let { nomEmp, apeEmp, username, email } = req.body
        const empUserCheck = await Empleado.findById(empleadoId);

        //Rellenar campos nulos.
        if (username) {
            //Comprobar que el usuario no existe.
            const existe = await Empleado.findOne({ username });
            if (existe) {
                if (existe._id.toString() !== empleadoId) return res.status(401).send('Ya existe un usuario con ese nombre de usuario.');
            }
        }
        else {
            username = empUserCheck.username;
        }
        if (!nomEmp) nomEmp = empUserCheck.nomEmp;
        if (!apeEmp) apeEmp = empUserCheck.apeEmp;
        if (!email) email = empUserCheck.email;
        let o_id = new ObjectId(empleadoId);

        let empleado = await Empleado.updateOne(
            { _id: o_id },
            {$set: {
                nomEmp: nomEmp,
                apeEmp: apeEmp,
                username: username,
                email: email
            }}
        );
        res.status(200).json({accion: 'Éxito al actualizar los datos del empleado', datos: empleado});
    }
    catch {
        res.status(500).json({accion: 'update empleado', mensaje: 'Error al actualizar el empleado.'})
    }
}

module.exports = { getAll, getById, getByUsername, updatePass, updateUser }
