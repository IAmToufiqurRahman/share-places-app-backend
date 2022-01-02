const express = require('express')
const bodyParser = require('body-parser') // bodyParser ensures that we parse the request bodies of incoming request
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const app = express()

// first parse the body then reach the routes; This will parse any incoming request body and extract any JSON data which is in there, convert it to regular js data structure and then call next automatically which is the custom route in the next line.
app.use(bodyParser.json())

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

// error handling for unsupported route
app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404)
})

// error handling middleware
app.use((error, req, res, next) => {
  // res.headerSent ensures a response has already been sent
  if (res.headerSent) {
    return next(error)
  }

  // no response has been sent yet
  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occured!' })
})

mongoose
  .connect('mongodb+srv://ankan0_0:aws1jio00321&@cluster0.mcerz.mongodb.net/places?retryWrites=true&w=majority')
  .then(() => {
    app.listen(5000)
  })
  .catch((error) => console.log(error))
