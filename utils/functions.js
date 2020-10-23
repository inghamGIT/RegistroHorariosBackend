const jwt = require('jsonwebtoken');
const RegistroHoras = require('../models/RegistroHoras');
const Empleado = require('../models/Empleado');
var FCM = require('fcm-node');
var ObjectId = require('mongodb').ObjectId;


function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Acceso no autorizado.');
    }
    const token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('Acceso no autorizado.');
    }
    const payload = jwt.verify(token, process.env.TOKEN_SECRETO);
    if (!payload) {
        return res.status(401).send('Acceso no autorizado.');
    }
    req.userId = payload._id;
    next();
}

async function notify() {
    const empleados = await Empleado.find();
    let fechaFin = new Date();
    let fechaInicio = new Date();
    fechaFin.setSeconds(86400); //añadimos un día
    let inicio = fechaInicio.toLocaleDateString()
    let fin = fechaFin.toLocaleDateString();
    
    let controlInicio = inicio.split('-');
    if (controlInicio[2].length !== 2) controlInicio[2] = '0' + controlInicio[2];
    if (controlInicio[1].length !== 2) controlInicio[1] = '0' + controlInicio[1];
    inicio = controlInicio[0] + '-' + controlInicio[1] + '-' + controlInicio[2];

    let controlFin = fin.split('-');
    if (controlFin[2].length !== 2) controlFin[2] = '0' + controlFin[2];
    if (controlFin[1].length !== 2) controlFin[1] = '0' + controlFin[1];
    fin = controlFin[0] + '-' + controlFin[1] + '-' + controlFin[2];

    var tokenList = [];
    var e;        
    for (e of empleados) {
        let o_id = new ObjectId(e._id);
        let regExists = await RegistroHoras.find({ fecha: {$lt: new Date(fin), $gte: new Date(inicio)}, user: o_id });
        if ((regExists.length === 0) && e.tokenFCM) {
            tokenList.push(e.tokenFCM)
        }
    }

    var fcm = new FCM(process.env.FIREBASE_SERVER);
 
    var token;
    for (token of tokenList) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token,
            
            notification: {
                title: 'IMPORTANTE:', 
                body: 'Aún no has actualizado tu registro de horas.' 
            }
        };
        
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent to: ", token);
            }
        });  

    }
}

module.exports = { verifyToken, notify }
