const express = require('express')
const socket = require('socket.io')
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
const port = process.env.PORT || 5000

//Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(path.join(__dirname, "auth_config.json"));
});
//using post for adding a new resource
//using patch for updating an existing resource
//using put for replacing an existing resource
//using delete for deleting a resouce
app.use(express.static('.'))
app.get(`/api/users/other/:playerid`, users.getAllUsers)
app.get(`/api/users/:email`, users.getUser)
app.post(`/api/users`, users.addUser)
app.delete(`/api/users/:playerid`, users.deleteUser)
app.get(`/api/offers/:playerid`, offers.getAllOffers)
app.get(`/api/offers/pending/:playerid`, offers.getPendingOffers)
app.post(`/api/createoffer`, offers.createAnOffer)
app.put(`/api/acceptoffer`, offers.acceptAnOffer)
app.patch('/api/matches/:matchid/:playerid/:word',matches.updatePlayerWord)
app.get('/api/matches/active/:playerid',matches.getAllActiveMatches)
app.get('/api/matches/completed/:playerid',matches.getAllCompletedMatches)
//app.get('/api/matches/:matchid/:playerid',matches.getMatch)
app.get('/api/tries/:matchid/:playerid', tries.getAllTries)
app.post(`/api/tries`,tries.addTry)
app.post(`/api/tries/guess`,tries.makeAGuess)
app.get('/api/exists/:word', (req, res) => {
  let word = req.params.word
  console.log(word)
  try{
    superagent
    .get(`http://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(
      res2 => {
        console.log(`Response status: ${res2.status}`)
        if (res2.status == 200) {
          console.log(`200 response status was receive and the word returned was ${res2.body[0].word}`);
          const word = res2.body[0].word
          if (word) {
            res.sendStatus(200)
            console.log(`200 was sent to the program`)
          }else{
            console.log(`200 was was received but word was not found hence 202 sent to the program.`)
            res.sendStatus(202)
          }
        }else{
          res.sendStatus(202)
        }
        console.log(`Finished checking word validity`)
      },
      err => {
        console.log(`Error response was received from the web site: ${err}`)
        res.sendStatus(202)
      },
      )
    }catch(err){
    console.log(`Try resulted in an error and a 202 response sent: ${err}`)
    res.sendStatus(202)
  }
})

const server = app.listen(port, () => console.log(`Murdle app listening on port ${port}!`))
const io = socket(server)
io.on('connection',(socket)=>{
  console.log(`The number of connected sockets:${+socket.adapter.sids.size}`)
  socket.on('MSG_MOVED',(data)=>{
    console.log(`player with socket.id of ${socket.id} has moved: data sent back:${JSON.stringify(data)}`)
    io.sockets.emit('MSG_MOVED',data)
  })
  socket.on('MSG_OFFERED',(data)=>{
    console.log(`player with socket.id of ${socket.id} has offered: data sent back:${JSON.stringify(data)}`)
    io.sockets.emit('MSG_OFFERED',data)
  })
  socket.on('MSG_ACCEPTED',(data)=>{
    console.log(`player with socket.id of ${socket.id} has accepted: data sent back:${JSON.stringify(data)}`)
    io.sockets.emit('MSG_ACCEPTED',data)
  })
  socket.on('disconnecting', () => {
    console.log(`user disconnected`)
    console.log(`The number of connected sockets:${+socket.adapter.sids.size}`)
  })
})
