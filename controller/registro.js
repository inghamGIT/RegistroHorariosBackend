const RegistroHoras = require('../models/RegistroHoras');
var ObjectId = require('mongodb').ObjectId;

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

async function getAll (req, res) {
    try {
        const registros = await RegistroHoras.find();
        res.status(200).json({accion: 'get all', datos: manageDates(registros)});
    }
    catch {
        res.status(500).json({accion: 'get all', mensaje: 'Error al obtener los registros.'})
    }
}

async function getByDate (req, res) {
    try {
        const userId = req.params.id;
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

        const regExists = await RegistroHoras.find({ fecha: {$lt: new Date(fin), $gte: new Date(inicio)}, user: userId });        
        res.status(200).json({accion: 'get by date', datos: manageDates(regExists)});
    }
    catch {
        res.status(500).json({accion: 'get by date', mensaje: 'Error al obtener el registro.'})
    }
}

async function getByUserId (req, res) {
    try {
        const userId = req.params.userId;
        let registros = await RegistroHoras.find({ user: userId }); 
        res.status(200).json({accion: 'get by userId', datos: manageDates(registros)});
    }
    catch {
        res.status(500).json({accion: 'get by userId', mensaje: 'Error al obtener el registro.'})
    }
}

async function getThisWeek (req, res) {
    try {
        const userId = req.params.id;
        const vacio = {
            horaEntrada: null,
            horaSalida: null,
            fecha: null,
            user: userId,
            descripcion: null
        }
        let registrosSalida = [];
        while (registrosSalida.length < 7) {
            registrosSalida.push(vacio);
        }

        let date = new Date();
        let diaSemana;
        if (date.getDay() === 0) diaSemana = 7; //Cambiamos a semana española [l-d]
        else diaSemana = date.getDay();

        let registros = await RegistroHoras
            .find({fecha: {$gte: new Date(date - diaSemana * 60 * 60 * 24 * 1000)}, user: userId})
            .sort({fecha: 1})
            .limit(8);
        
        if (registros.length > 0) {
            if (registros[0].fecha.getDay() === 0) registros.shift(); //Eliminamos el domingo
        }
        
        for (let registro of registros) {
            switch (registro.fecha.getDay()) {
                case 0: registrosSalida[6] = registro;
                    break;
                case 1: registrosSalida[0] = registro;
                    break;
                case 2: registrosSalida[1] = registro;
                    break;
                case 3: registrosSalida[2] = registro;
                    break;
                case 4: registrosSalida[3] = registro;
                    break;
                case 5: registrosSalida[4] = registro;
                    break;
                case 6: registrosSalida[5] = registro;
                    break;
            }
        }
        res.status(200).json({accion: 'get last week', datos: manageDates(registrosSalida)});
    }
    catch {
        res.status(500).json({accion: 'get last week', mensaje: 'Error al obtener el registro.'})
    }
}

async function insert (req, res) {
    try {
        let { horaEntrada, horaSalida, fecha, user, descripcion } = req.body;

        if (!fecha) fecha = new Date();

        let nuevaHoraEntrada = new Date(fecha);
        nuevaHoraEntrada.setUTCHours(parseInt(horaEntrada.split(':')[0]));
        nuevaHoraEntrada.setMinutes(parseInt(horaEntrada.split(':')[1]));

        let nuevaHoraSalida = new Date(fecha);
        nuevaHoraSalida.setUTCHours(parseInt(horaSalida.split(':')[0]));
        nuevaHoraSalida.setMinutes(parseInt(horaSalida.split(':')[1]));

        const reg = new RegistroHoras({ 
            horaEntrada: nuevaHoraEntrada,
            horaSalida: nuevaHoraSalida,
            fecha: fecha,
            user: user,
            descripcion: descripcion
        });
        const regGuardado = await reg.save();
        res.status(200).json({accion: 'Registro guardado con éxito', datos: regGuardado});
    }
    catch (error) {
        if (error.isJoi === true) {
            res.status(422).json({accion: 'Error en la validación del registro', mensaje: error});
        }
        else {
            res.status(500).json({accion: 'save', mensaje: 'Error al guardar el registro.'});
        }
    }
}

async function update (req, res) {
    try {
        let { horaEntrada, horaSalida, fecha, user, descripcion } = req.body;

        if (!fecha) fecha = new Date();

        const registroId = req.params.id;
        console.log([registroId, horaEntrada, horaSalida, user, descripcion]);
        let o_id = new ObjectId(registroId);
        const oldReg = await RegistroHoras.findById(registroId);

        let nuevaHoraEntrada;
        if (!horaEntrada) nuevaHoraEntrada = oldReg.horaEntrada;
        else {
            nuevaHoraEntrada = new Date(fecha);
            nuevaHoraEntrada.setUTCHours(parseInt(horaEntrada.split(':')[0]));
            nuevaHoraEntrada.setMinutes(parseInt(horaEntrada.split(':')[1]));
        }

        let nuevaHoraSalida;
        if (!horaSalida) nuevaHoraSalida = oldReg.horaSalida;
        else {
            nuevaHoraSalida = new Date(fecha);
            nuevaHoraSalida.setUTCHours(parseInt(horaSalida.split(':')[0]));
            nuevaHoraSalida.setMinutes(parseInt(horaSalida.split(':')[1]));
        }

        if (!descripcion) descripcion = oldReg.descripcion;

        const regActualizado = await RegistroHoras.updateOne(
            { _id: o_id },
            { $set: {
                horaEntrada: nuevaHoraEntrada,
                horaSalida: nuevaHoraSalida,
                fecha: fecha,
                user: user,
                descripcion: descripcion
            }}
        );
        res.status(200).json({accion: 'Registro actualizado con éxito', datos: regActualizado});
    }
    catch {
        res.status(500).json({accion: 'update', mensaje: 'Error al actualizar el registro.'})
    }
}

async function remove (req, res) {

}

function manageDates(registros) {
    var registrosSalida = [];
    for (let r of registros) {
        let nuevaFecha;
        let minutosEntrada;
        let nuevaEntrada;
        let minutosSalida;
        let nuevaSalida;

        if (!r.fecha) {
            nuevaFecha = 'N/A';
        }
        else {
            nuevaFecha = dias[r.fecha.getDay()] + ', ' + r.fecha.getDate().toString() + ' de ' + meses[r.fecha.getMonth()] + ' de ' + r.fecha.getFullYear().toString();
        }

        if (r.horaEntrada === null || !r.horaEntrada) {
            nuevaEntrada = 'N/A';
        }
        else {
            if (r.horaEntrada.getMinutes() === 0) minutosEntrada = '00';
            else minutosEntrada = r.horaEntrada.getMinutes().toString();
            nuevaEntrada = r.horaEntrada.getUTCHours().toString() + ":" + minutosEntrada;
        }

        if (r.horaSalida === null || !r.horaSalida) {
            nuevaSalida = 'N/A';
        }
        else {
            if (r.horaSalida.getMinutes() === 0) minutosSalida = '00';
            else minutosSalida = r.horaSalida.getMinutes().toString();
            nuevaSalida = r.horaSalida.getUTCHours().toString() + ":" + minutosSalida;
        }

        registrosSalida.push({
            id: r._id,
            horaEntrada: nuevaEntrada,
            horaSalida: nuevaSalida,
            fecha: nuevaFecha,
            user: r.user,
            descripcion: r.descripcion
        });
    }
    return registrosSalida;
}

module.exports = { getAll, getByDate, getByUserId, getThisWeek, insert, update, remove }
