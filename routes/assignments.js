let Assignment = require('../model/assignment');

// Récupérer tous les assignments (GET)
function getAssignments(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    Assignment.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec((err, assignments) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            Assignment.countDocuments().exec((count_error, count) => {
                if (err) {
                    res.status(500).send(count_error);
                    return;
                }

                // Modify the response to include pagination details
                res.json({
                    total: count,
                    page,
                    pageSize: assignments.length,
                    assignments: assignments.map(({ _id, ...rest }) => ({ id: _id, ...rest }))
                });
            });
        });
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res){
    let assignmentId = req.params.id;

    let numericId = parseInt(assignmentId, 10); 

    if (isNaN(numericId)) {
        res.status(400).send({ error: "Invalid ID format" });
        return;
    }

    Assignment.findById(numericId, (err, assignment) => {
        if(err){
            res.status(500).send(err);
            return;
        }
        if (!assignment) {
            res.status(404).send({ message: "Assignment not found" });
            return;
        }
        const assignmentData = assignment.toObject();
        assignmentData.id = assignmentData._id;
        delete assignmentData._id;

        res.json(assignmentData);
    });
}

// Ajout d'un assignment (POST)
function postAssignment(req, res) {
    Assignment.find().sort({ _id: -1 }).limit(1).exec((err, lastAssignments) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error finding last assignment', error: err });
            return;
        }

        let maxId = 0;
        if (lastAssignments.length > 0 && !isNaN(lastAssignments[0]._id)) {
            maxId = lastAssignments[0]._id;
        }

        let assignment = new Assignment();
        assignment._id = maxId + 1;
        assignment.name = req.body.name;
        assignment.student = req.body.student;
        assignment.instructions = req.body.instructions;
        assignment.date = req.body.date;
        assignment.returned = req.body.returned;

        console.log("POST assignment reçu :");
        console.log(assignment);

        assignment.save((saveErr) => {
            if (saveErr) {
                console.log(saveErr);
                res.status(500).json({ message: 'cant post assignment', error: saveErr });
            } else {
                res.json({ message: `${assignment.name} saved!`, id: assignment._id });
            }
        });
    });
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);

    const assignmentId = parseInt(req.body.id); // Assurez-vous que c'est un nombre

    if (isNaN(assignmentId)) {
        res.status(400).send({ error: "Invalid ID format" });
        return;
    }

    const updateData = {
        name: req.body.name,
        date: req.body.date,
        returned: req.body.returned,
    };

    Assignment.findByIdAndUpdate(assignmentId, updateData, { new: true }, (err, assignment) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.json({ message: 'Assignment updated', assignment });
        }
    });
}

// suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {

    Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json({message: `${assignment.name} deleted`});
    })
}



module.exports = { getAssignments, postAssignment, getAssignment, updateAssignment, deleteAssignment };
