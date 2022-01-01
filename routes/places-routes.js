const express = require('express')
const { check } = require('express-validator')

const placesContoller = require('../controllers/places-controller')

const router = express.Router()

router.get('/:pid', placesContoller.getPlaceById)

router.get('/user/:uid', placesContoller.getPlacesByUserId)

router.post('/', [check('title').not().isEmpty(), check('description').isLength({ min: 10 }), check('address').not().isEmpty()], placesContoller.createPlace)

router.patch('/:pid', [check('title').not().isEmpty(), check('description').isLength({ min: 10 })], placesContoller.updatePlace)

router.delete('/:pid', placesContoller.deletePlace)

module.exports = router
