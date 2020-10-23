// Modulos
const express = require('express'); // Framework del servidor
const app = express(); // Iniciamos el framework
const morgan = require('morgan'); // Muestra por consola las peticiones
const cors = require('cors'); // Maneja las cabeceras de las peticiones
const bodyParser = require('body-parser'); // Da formato al body de las peticiones
const dotenv = require('dotenv'); // Uso de variables de entorno
const mongoose = require('mongoose'); // BBDD
const cron = require('node-cron'); // Tareas programadas

// Route imports
const routerEmpleados = require('./routes/empleado');
const routerRegistros = require('./routes/registro');
const routerAuth = require('./routes/auth');
const functionController = require('./utils/functions');

// Settings
dotenv.config();
app.set('port', process.env.PORT || process.env.PUERTO_SERVIDOR);

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/empleados', routerEmpleados);
app.use('/registros', routerRegistros);
app.use('/auth', routerAuth);

// Cron task test
cron.schedule('* * * * *', () => {
    console.log('Enviando mensajes...');
    functionController.notify();
});

/*
// Cron task programada (todos los días a las 18:00)
cron.schedule('0 18 * * *', () => {
    functionController.notify();
});
*/

// Iniciamos el servidor
const run = async () => {
    await mongoose.connect(process.env.URL_DDBB, {
        useFindAndModify: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    app.listen(app.get('port'));
    console.log('Servidor arrancado en el puerto: ' + app.get('port') + '.');
    console.log('BBDD inicializada.')
}

run().catch(err => console.log('Fallo al arrancar: ' + err))