let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let { assignmentsDB } = require('../dbConnections');

let AssignmentSchema = Schema({
    _id: Number,
    id: Number,
    date: Date,
    name: String,
    student: String,
    instructions: String,
    returned: Boolean
}, { versionKey: false });

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = assignmentsDB.model('Assignment', AssignmentSchema);
