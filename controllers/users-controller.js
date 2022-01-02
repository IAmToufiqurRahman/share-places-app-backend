const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')

exports.getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch {
    const error = new HttpError('Fetching users failed, please try again later', 500)

    return next(error)
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) })
}

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input passed, please check your data', 422))
  }

  const { name, email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch {
    const error = new HttpError('Signing up failed, please try again', 500)

    return next(error)
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead', 422)

    return next(error)
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3SRuD6bspyBpE3NnN2w1P28-Df2HqVbz-sQ&usqp=CAU',
    password,
    places: []
  })

  try {
    await createdUser.save()
  } catch {
    const error = new HttpError('Signing up failed, please try again', 500)

    return next(error)
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) })
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch {
    const error = new HttpError('Loggin in failed, please try again', 500)

    return next(error)
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid creadentials, could not log you in', 401)

    return next(error)
  }

  res.json({ message: 'logged in!!!' })
}
