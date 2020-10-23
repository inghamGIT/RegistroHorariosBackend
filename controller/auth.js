const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { registerSchema, loginSchema } = require('../utils/validationSchema');
const Empleado = require('../models/Empleado');
var ObjectId = require('mongodb').ObjectId;

async function signup (req, res) {
    try {
        const { nomEmp, apeEmp, username, pass, confirm, email, tokenFCM } = req.body;
        const result = await registerSchema.validateAsync({ nomEmp, apeEmp, username, pass, confirm, email });

        const empUserCheck = await Empleado.findOne({ username });
        if (empUserCheck) {
            return res.status(409).send({mensaje: 'Ya existe un usuario con ese nombre de usuario.'});
        }
    
        if (pass !== confirm) {
            return res.status(422).send({mensaje: 'Error en la gestion de las contraseñas'});
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);
    
        const emp = new Empleado({ 
            nomEmp: nomEmp,
            apeEmp: apeEmp,
            username: username,
            pass: hashedPassword,
            email: email,
            tokenFCM: tokenFCM
        });
    
        await emp.save();
        const token = jwt.sign({ subject: emp._id }, process.env.TOKEN_SECRETO);
        res.status(200).json({token});
    }
    catch (error) {
        if (error.isJoi === true) {
            res.status(422).json({accion: 'Error en la validación del usuario', mensaje: error});
        } 
        else {
            res.status(500).json({accion: 'Signup', mensaje: 'Error al crear el usuario'});
        } 
    }
}

async function login (req, res) {
    try {
        const { username, pass, tokenFCM } = req.body;
        const result = await loginSchema.validateAsync({ username, pass });

        //Comprobamos que el usuario existe.
        const emp = await Empleado.findOne({ username });
        if (!emp) {
            return res.status(422).send({ mensaje: 'No existe el usuario.' });
        }
    
        //Comprobamos que la contraseña coincide.
        const passValido = await bcrypt.compare(pass, emp.pass);
        if (!passValido) {
            return res.status(401).send({ mensaje: 'Contraseña erronea.' });
        }

        //comprobamos si el usuario tiene tokenFCM.
        if (!emp.tokenFCM && tokenFCM) {
            let o_id = new ObjectId(emp._id);
            await Empleado.updateOne(
                { _id: o_id },
                {$set: {
                    tokenFCM: tokenFCM
                }}
            );
        }

        const token = jwt.sign({ subject: emp._id }, process.env.TOKEN_SECRETO);
        res.status(200).json({token});
    }
    catch (error) {
        if (error.isJoi === true) {
            res.status(422).json({accion: 'Error en la validación del usuario', mensaje: error});
        } 
        else {
            res.status(500).json({accion: 'Signup', mensaje: 'Error al ingresar el usuario'});
        }
    }
}

module.exports = { signup, login }