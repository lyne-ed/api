let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let assignment = require('./routes/assignments');
let user = require('./routes/users');
let { assignmentsDB, usersDB, dbConnectionEmitter } = require('./dbConnections');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('debug', true);


const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify:false
};

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Pour les formulaires
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

// les routes
const prefix = '/api';

app.route(prefix + '/assignments')
  .get(assignment.getAssignments);

app.route(prefix + '/assignments/:id')
  .get(assignment.getAssignment)
  .delete(assignment.deleteAssignment);

app.route(prefix + '/assignments')
  .post(assignment.postAssignment)
  .put(assignment.updateAssignment);

app.route(prefix + '/users/register')
  .post(user.registerUser)

app.route(prefix + '/users/login')
  .post(user.logInUser)

app.route(prefix + '/users/role')
  .post(user.getRole)

app.put(prefix + '/users/update', user.authenticateToken, user.updateUser);

app.route(prefix + '/users')
  .get(user.getAllUsers);

// Démarrage du serveur après la connexion à la base de données
dbConnectionEmitter.once('ready', () => {
  let port = process.env.PORT || 8010;
  app.listen(port, "0.0.0.0", () => {
      console.log('Serveur démarré sur http://localhost:' + port);
      console.log("Vérifiez with http://localhost:8010/api/assignments que cela fonctionne")
      console.log("Vérifiez with http://localhost:8010/api/users que cela fonctionne")
  });
});

module.exports = app;