const express = require('express')
const path = require('path')
const superagent = require('superagent')
const users = require('./route_user')
const offers = require('./route_offers')
const matches = require('./route_matches')
const tries = require('./route_tries')
const app = express()
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const port = process.env.PORT || 5500

//Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(path.join(__dirname, "auth_config.json"));
});
//using post for adding a new resource
//using patch for updating an existing resource
//using put for replacing an existing resource
//using delete for deleting a resouce
app.use(express.static('.'))
app.get(`/api/users`, users.getAllUsers)
app.post(`/api/users`, users.addUser)
app.delete(`/api/users/:playerid`, users.deleteUser)
app.get(`/api/offers/:playerid`, offers.getAllOffers)
app.post(`/api/offers`, offers.createAnOffer)
app.patch(`/api/offer/accept/:offerid`, offers.acceptAnOffer)
app.get('/api/initiatormatches/:playerid', matches.getAllMatchesAsInitiator)
app.get('/api/respondermatches/:playerid', matches.getAllMatchesAsResponder)
app.patch('/api/matches/:matchid/:playernum/:playerid/:word',matches.updatePlayerWord)
app.get('/api/matches/:playerid',matches.getAllMatches)
app.get('/api/tries/:playerid/:matchid', tries.getAllTries)
app.post(`/api/tries`,tries.addTry)
app.post(`/api/tries/guess`,tries.makeAGuess)
app.get('/api/exists/:word', (req, res) => {
  let word = req.params.word
  console.log(word)
  superagent
    .get(`http://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(
      res2 => {
        //console.log(res2)
        if (res2.status == 200) {

          console.log(res2.body);
          const word = res2.body[0].word
          if (word) res.sendStatus(200)
          else
            res.sendStatus(500)
        }
      },
      err => {
        console.log(err)
        res.sendStatus(500)
      },
    );

})

const server = app.listen(port, () => console.log(`Frodle app listening on port ${port}!`))