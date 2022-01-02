const uuid = require('uuid').v4
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

exports.getPlaceById = (req, res, next) => {
  const placeId = req.params.pid // {pid: 'p1'}

  const place = DUMMY_PLACES.find((p) => p.id === placeId)

  if (!place) {
    throw (error = new HttpError('Could not find a place for the provided id', 404))
  }

  res.json({ place }) // => {place} => {place: place}
}

exports.getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid

  const places = DUMMY_PLACES.filter((p) => p.creator === userId)

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for the provided user id', 404))
  }

  res.json({ places })
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

  try {
    await createdPlace.save()
  } catch {
    const error = new HttpError('Creating place failed, please try again', 500)

    return next(error)
  }

  res.status(201).json({ place: createdPlace })
}

exports.updatePlace = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
    throw new HttpError('Invalid input passed, please check your data!', 422)
  }

  const { title, description } = req.body
  const placeId = req.params.pid

  // update in immutable way, that's why spread operator, it creates a new object and copies all the key-valye pairs of the old object as key-value pairs into the new object
  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }
  // index of the place to be updated
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId)
  updatedPlace.title = title
  updatedPlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace

  res.status(200).json({ place: updatedPlace })
}

exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id', 404)
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId)

  res.status(200).json({ message: 'Deleted place' })
}
