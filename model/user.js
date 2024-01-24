let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let { usersDB } = require('../dbConnections');

let UserSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user'}
}, { versionKey: false });

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = usersDB.model('User', UserSchema);
