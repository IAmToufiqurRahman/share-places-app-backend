const express = require('express')

const placesContoller = require('../controllers/places-controller')

const router = express.Router()

router.get('/:pid', placesContoller.getPlaceById)

router.get('/user/:uid', placesContoller.getPlaceByUserId)

router.post('/', placesContoller.createPlace)

router.patch('/:pid', placesContoller.updatePlace)

router.delete('/:pid', placesContoller.deletePlace)

module.exports = router
