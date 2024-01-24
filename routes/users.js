let User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = 'secretKeyLyneElDada@E&*-.#7410';
const mongoose = require('mongoose');

function getAllUsers(req, res) {
    var query = User.find({});
    
    query.exec(function (err, users) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(users));
            console.log(users);
        }
    });
}


function registerUser(req, res) {
    const { username, password, role } = req.body;
  
    User.findOne({ username: username }, (err, existingUser) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (existingUser) {
        res.status(400).send({ message: "Login already exists" });
        return;
      }
  
      // Hacher le mot de passe
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          res.status(500).send(hashErr);
          return;
        }
  
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          username: username,
          password: hashedPassword,
          role
        });
  
        newUser.save((saveErr, user) => {
          if (saveErr) {
            res.status(500).send(saveErr);
            return;
          }
          res.status(201).json({ message: "User registered successfully" });
        });
      });
    });
}
  

function verifyPassword(enteredPassword, hashedPassword, callback) {
    bcrypt.compare(enteredPassword, hashedPassword, (err, result) => {
      if (err) {
        callback(err, false);
        return;
      }
      callback(null, result);
    });
}


function logInUser(req, res) {
    console.log(req.body);
  
    const { username, password } = req.body;
    console.log("username: " + username);
  
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (!user) {
        res.status(401).send({ message: "Invalid login or password" });
        return;
      }
  
      verifyPassword(password, user.password, (verifyErr, isPasswordValid) => {
        if (verifyErr) {
          res.status(500).send(verifyErr);
          return;
        }
  
        if (!isPasswordValid) {
          res.status(401).send({ message: "Invalid login or password" });
          return;
        }
  
        const token = jwt.sign(
          { id: user._id, username: user.username, role: user.role },
          secretKey,
          { expiresIn: '72h' }
        );
  
        res.json({ message: "Login successful", token: token, role: user.role });
      });
    });
}

function getRole(req, res) {
    const { username, password } = req.body;

    User.findOne({ username: username }, (err, user) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (!user || !verifyPassword(password, user.password)) {
            res.status(401).send({ message: "Invalid login or password" });
            return;
        }

        res.json({ role: user.role });
    });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);

        console.log("Decoded JWT:", user);
        req.user = user;
        next();
    });
}

function updateUser(req, res) {
    let userId;
    userId = req.user._id;
    if (!userId)
        userId = req.user.id;

    const { password, role } = req.body;

    User.findById(userId, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Error finding the user" });
            return;
        }

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        if (password) user.password = password;
        if (role) user.role = role;

        user.save((err) => {
            if (err) {
                res.status(500).send({ message: "Error updating the user" });
                return;
            }
            res.status(200).send({ message: "User updated successfully" });
        });
    });
}

module.exports = { getAllUsers, registerUser, logInUser, getRole, updateUser, authenticateToken };
