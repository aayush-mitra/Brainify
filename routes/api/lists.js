const express = require('express')

const User = require('../../models/User')
const List = require('../../models/List')

const shuffleArray = require('../../config/utils')

const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const router = express.Router()



router.post('/create', (req, res) => {
  const {name, userId, description} = req.body;

  User.findOne({_id: userId}, (err, user) => {
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
    } else {
      const newList = new List({
        name,
        userId,
        description,
        cards: []
      })

      newList.save((err, list) => {
        user.lists.push(list._id);
        user.save((err, user1) => {
          return res.json({
            success: true,
            message: 'list created',
            user: user1,
            list
          })
        })
      })
    }
  })
})

router.post('/delete', (req, res) => {
  const {listId, userId} = req.body;


  List.findOneAndDelete({_id: listId}, (err, list) => {
    
    if (err) {
      return res.json({
        success: false,
        message: 'server err',
      })
    } 

    if (!list) {
      return res.json({
        success: false,
        message: 'invalid list id'
      })
    }

    User.findOne({_id: userId}, (err, user) => {
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
      console.log(user)
      console.log(user.lists)
      let ind;
      user.lists.forEach((elem, i) => {
        if (elem.toString() === listId) {
          ind = i;
          user.lists.splice(ind, 1)
          user.save((err, user1) => {
            if (err) {
              return res.json({
                success: false,
                message: 'server err'
              })
            }

            if (!user1) {
              return res.json({
                success: false,
                message: 'invalid user'
              })
            }

            return res.json({
              success: true,
              message: 'list deleted',
              list,
              user: user1
            })
          })
        }
      })

      
    })
  })
})

router.post('/update', (req, res) => {
  const {name, description, listId} = req.body;

  List.findOne({_id: listId}, (err, list) => {
    if (err) {
      return res.json({
        success: false,
        message: 'servedr err',
      })
    }

    if (!list) {
      return res.json({
        success: false,
        message: 'invalid list Id'
      })
    }

    list.name = name;
    list.description = description;
    list.save((err, list1) => {
      if (err) {
        return res.json({
          success: false,
          message: 'server err'
        })
      }

      if (!list1) {
        return res.json({
          success: false,
          message: 'list error'
        })
      } else {
        User.findOne({_id: list1.userId}).then(user => {
          if (!user) {
            return res.json({
              success: false,
              message: 'user not found'
            })
          }

          return res.json({
            success: true,
            message: 'list updated',
            user,
            list: list1
          })
        }).catch(err => res.json({success: false, message: 'server err'}))
      }
      
    })
  })
})

router.post('/cards/update', (req, res) => {
  const {listId, cards} = req.body;

  List.findOne({_id: listId}, (err, list) => {
    if (err) {
      return res.json({
        success: false,
        message: 'servder err',
      })
    }

    if (!list) {
      return res.json({
        success: false,
        message: 'list not found'
      })
    }

    list.cards = cards;
    list.save((err, list1) => {
      if (err) {
        return res.json({
          success: false,
          message: 'server err'
        })
      }

      if (!list1) {
        return res.json({
          success: false,
          message: 'list error'
        })
      } else {
        User.findOne({_id: list1.userId}).then(user => {
          if (!user) {
            return res.json({
              success: false,
              message: 'user not found'
            })
          }

          return res.json({
            success: true,
            message: 'list updated',
            user,
            list: list1
          })
        }).catch(err => res.json({success: false, message: 'server err'}))
      }
      
    })
  })
})


router.post('/cards/create', (req, res) => {
  const {listId, term, definition} = req.body;

  List.findOne({_id: listId}, (err, list) => {
    if (err) {
      return res.json({
        success: false,
        message: 'servder err',
      })
    }

    if (!list) {
      return res.json({
        success: false,
        message: 'list not found'
      })
    }

    const newCard = {
      term,
      definition
    }

    list.cards.push(newCard);
    list.save((err, list1) => {
      if (err) {
        return res.json({
          success: false,
          message: 'server err'
        })
      } 

      if (!list1) {
        return res.json({
          success: false,
          message: 'list not found'
        })
      }

      return res.json({
        success: true,
        list: list1
      })
    })
  })
})

router.post('/cards/createmany', (req, res) => {
  const {listId, arr} = req.body;

  List.findOne({_id: listId}, (err, list) => {
    if (err) {
      return res.json({
        success: false,
        message: 'servder err',
      })
    }

    if (!list) {
      return res.json({
        success: false,
        message: 'list not found'
      })
    }

    arr.forEach(card => {
      const newCard = {
        term: card.term,
        definition: card.definition
      }

      list.cards.push(newCard);

    })

    
    list.save((err, list1) => {
      if (err) {
        return res.json({
          success: false,
          message: 'server err'
        })
      } 

      if (!list1) {
        return res.json({
          success: false,
          message: 'list not found'
        })
      }

      User.findOne({_id: list1.userId}).then(user => {
        if (!user) {
          return res.json({
            success: false,
            message: 'user not found'
          })
        }

        return res.json({
          success: true,
          message: 'list updated',
          user,
          list: list1
        })
      }).catch(err => res.json({success: false, message: 'server err'}))
      
    })
  })
})



router.get('/feed', (req, res) => {
  List.find({}).populate("userId").then(lists => {
    shuffleArray(lists)
    console.log(lists)
    return res.json({
      success: true,
      lists
    })
  }).catch(err => res.json({success: false, message: 'err'}))
})

router.get('/findById', (req, res) => {
  const {listId} = req.query;
  

  List.findOne({_id: listId}).populate("userId").exec((err, list) => {
    if (err) {
      return res.json({
        success: false,
        message: 'err'
      })
    }
  
    if (!list) {
      return res.json({
        success: false,
        message: 'list not found'
      })
    }

    return res.json({
      success: true,
      list
    })
  })
})
module.exports = router;