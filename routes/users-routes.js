const express = require('express')

const { check } = require('express-validator')

const usersContoller = require('../controllers/users-controller')

const router = express.Router()

router.get('/', usersContoller.getUsers)

router.post('/signup', [check('name').not().isEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({ min: 6 })], usersContoller.signup)

router.post('/login', usersContoller.login)

module.exports = router
