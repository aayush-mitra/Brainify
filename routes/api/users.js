const express = require('express')
const router = express.Router()

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const User = require("../../models/User")
const UserSession = require("../../models/UserSession")
const List = require('../../models/List')

router.get('/', (req, res) => res.send('hello world'))

router.post("/register", (req, res) => {
  let { name, username, email, password } = req.body;
  const errors = {};

  email = email.toLowerCase();
  username = username.toLowerCase();
 
  User.findOne({ email }).then((user) => {
    if (user) {
      errors.success = false;
      errors.message = "Email already registered.";
      return res.json(errors);
    } else {
      User.findOne({ username}).then((user2) => {
        if (user2) {
          errors.success = false;
          errors.message = "Username taken."
        }

        const newUser = new User({
          name,
          username,
          email,
          password
        })
        
        bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                   return res.json({
                     success: true,
                     user: user,
                     message: 'Success'
                   })
                  })
                  .catch((err) => {
                    res.json({
                      success: false,
                      message: "Server Error. 2",
                    });
                  });
              });
            });
      })
    }
  });
});

router.post('/login', (req, res) => {
  let {email, password} = req.body;
  email = email.toLowerCase()

  User.findOne({email}, (err, user) => {
    if (err) {
      return res.json({
        success: false,
        message: "Server Error"
      })
    }

    if (user === null) {
      return res.json({
        success: false,
        message: 'No user found with email'
      })
    }

    if (!user.validPassword(password)) {
      return res.json({
        success: false,
        message: "Invalid Password"
      })
    }

    const newUserSession = new UserSession()
    newUserSession.userId = user._id;
    newUserSession.save((err, doc) => {
      if (err) {
        return res.json({
          success: false,
          message: "server err"
        })
      }

      User.findOne({_id: doc.userId}, (err, user1) => {
        return res.json({
          success: true,
          message: 'Authenticated',
          token: doc._id,
          user: user1
        })
      })
    })
  })
})

router.get('/verify', (req, res) => {
  const {token} = req.query;

  UserSession.find({_id: token, isDeleted: false}, (err, sessions) => {
    if (err) {
      return res.json({
        success: false,
        message: 'error'
      })
    }

    if (sessions.length !== 1) {
      return res.json({
        success: false,
        message: 'invalid session id'
      })
    } else {
      User.findOne({_id: sessions[0].userId}, (err, user) => {
        return res.json({
          success: true,
          message: 'valid',
          user
        })
      })
    }

    
  })
})

router.get('/logout', (req, res) => {
  const {token} = req.query
  
  UserSession.findOneAndDelete({_id: token}, (err, session) => {
    if (err) {
      return res.json({
        success: false,
        message: 'server err'
      })
    }

    if (!session) {
      return res.json({
        success: false,
        message: 'invalid token'
      })
    }

    return res.json({
      success: true,
      message: 'logged out'
    })
  })
})

router.post('/delete', (req, res) => {
  const {userId} = req.body;

  User.findOneAndDelete({_id: userId}, (err, user) => {
    if (err) {
      return res.json({
        success: false,
        message: 'server err'
      })
    }

    if (!user) {
      return res.json({
        success: false,
        message: 'invalid user id'
      })
    }

    return res.json({
      success: true,
      message: 'user deleted'
    })
  })
})

router.get('/profile', (req, res) => {
  const {userId} = req.query;

  User.findOne({_id: userId}).populate('lists').exec((err, user) => {
    if (err) {
      return res.json({
        success: false,
        message: 'err'
      })
    }

    if (!user) {
      return res.json({
        success: false,
        message: 'user not found'
      })
    }

    return res.json({
      success: true,
      user
    })
  })
})
module.exports = router;