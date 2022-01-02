const uuid = require('uuid').v4
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid // {pid: 'p1'}

  let place
  try {
    place = await Place.findById(placeId)
  } catch {
    const error = new HttpError('Somwthing went wrong, could not find the place', 500)

    return next(error)
  }

  if (!place) {
    const error = new HttpError('Could not find a place for the provided id', 404)

    return next(error)
  }

  res.json({ place: place.toObject({ getters: true }) }) // => {place} => {place: place}
}

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid

  let userWithPlaces
  try {
    userWithPlaces = await User.findById(userId).populate('places')
  } catch {
    const error = new HttpError('Fetching places failed, please try again', 500)

    return next(error)
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('Could not find places for the provided user id', 404))
  }

  res.json({ places: userWithPlaces.map((place) => place.toObject({ getters: true })) })
}

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input passed, please check your data', 422))
  }

  const { title, description, address, creator } = req.body

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://media.istockphoto.com/photos/the-city-of-dreams-new-york-citys-skyline-at-twilight-picture-id599766748?k=20&m=599766748&s=612x612&w=0&h=lZ8gpCQQifxd0V7zOwFFkFym9bnZ6TBQkWafAHnc-D4=',
    creator
  })

  let user // we should be allowed to create place if corresponing user id is valid
  try {
    user = await User.findById(creator) // check for existing user
  } catch {
    const error = new HttpError('Creating place failed, please try again', 500)

    return next(error)
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404)

    return next(error)
  }

  try {
    // initialize session
    const sessn = await mongoose.startSession()

    // transaction
    sessn.startTransaction()

    await createdPlace.save({ session: sessn })
    // push is mongoose method which establish the connection between the two models
    user.places.push(createdPlace)

    // save updated user
    await user.save({ session: sessn })

    await sessn.commitTransaction()
  } catch {
    const error = new HttpError('Creating place failed, please try again', 500)

    return next(error)
  }

  res.status(201).json({ place: createdPlace })
}

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
    return next(new HttpError('Invalid input passed, please check your data!', 422))
  }

  const { title, description } = req.body
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
  } catch {
    const error = new HttpError('Something went wrong, could not update place', 500)

    return next(error)
  }

  place.title = title
  place.description = description

  // store the updated place
  try {
    await place.save()
  } catch {
    const error = new HttpError('Something went wrong, could not update place', 500)

    return next(error)
  }

  res.status(200).json({ place: place.toObject({ getters: true }) })
}

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId).populate('creator') // used polulate to get access to the entire content of a document stored in a different collection
  } catch {
    const error = new HttpError('Something went wrong, could not delete place.', 500)

    return next(error)
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id', 401)

    return next(error)
  }

  try {
    // initialize session
    const sessn = await mongoose.startSession()

    // transaction
    sessn.startTransaction()

    await place.remove({ session: sessn })
    // pull is mongoose method which which will automatically remove the id
    place.creator.places.pull(place)

    // save updated user
    await place.creator.save({ session: sessn })

    await sessn.commitTransaction()
  } catch {
    const error = new HttpError('Something went wrong, could not delete place.', 500)

    return next(error)
  }

  res.status(200).json({ message: 'Deleted place' })
}
