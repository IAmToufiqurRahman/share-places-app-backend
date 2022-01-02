const mongoose = require('mongoose')

const uniqurValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, require: true, ref: 'Place' }]
})

userSchema.plugin(uniqurValidator)

module.exports = mongoose.model('User', userSchema)
