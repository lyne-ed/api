let mongoose = require('mongoose');
let Schema = mongoose.Schema;

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
module.exports = mongoose.model('Assignment', AssignmentSchema);
