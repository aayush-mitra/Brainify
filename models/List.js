const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ListSchema = new Schema({
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  description: String,
  organization: String,
  cards: [
    {
      term: String,
      definition: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

module.exports = List = mongoose.model('lists', ListSchema)