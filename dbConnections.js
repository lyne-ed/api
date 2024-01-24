const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('debug', true);
const EventEmitter = require('events');
class DBConnectionEmitter extends EventEmitter {}
const dbConnectionEmitter = new DBConnectionEmitter();

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

let connectionsEstablished = 0;

function checkConnections() {
    connectionsEstablished++;
    if (connectionsEstablished === 2) {
        dbConnectionEmitter.emit('ready');
    }
}

const uriAssignments = 'mongodb+srv://le:lyneeldada@m1-miage.bmepxvg.mongodb.net/assignments?retryWrites=true&w=majority';
const uriUsers = 'mongodb+srv://le:lyneeldada@m1-miage.bmepxvg.mongodb.net/users?retryWrites=true&w=majority';

const assignmentsDB = mongoose.createConnection(uriAssignments, options);
const usersDB = mongoose.createConnection(uriUsers, options);

assignmentsDB.on('error', console.error.bind(console, 'Erreur de connexion MongoDB assignments:'));
usersDB.on('error', console.error.bind(console, 'Erreur de connexion MongoDB users:'));

assignmentsDB.once('connected', checkConnections);
usersDB.once('connected', checkConnections);

module.exports = { assignmentsDB, usersDB, dbConnectionEmitter  };
