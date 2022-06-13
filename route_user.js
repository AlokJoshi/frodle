const knex = require('./dbservice')
const utilities = require('./utilities')

function getAllUsers(req, res) {
  //gets users other than the current user(playerid)
  const playerid = req.params.playerid
  knex('fr_players')
    .whereNot('playerid', playerid)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getAllUsers: ${err}`)
      res.sendStatus(500)
    })
}
function getUser(req, res) {
  const email = req.params.email
  knex('fr_players')
    .where('email', email)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getUser: ${err}`)
      res.sendStatus(500)
    })
}
function addUser(req, res) {
  let { email, nickname, picture } = req.body
  console.log(`Before:${picture}`)
  if (!picture) picture = utilities.getImage(email)
  console.log(`After:${picture}`)
  knex('fr_players')
    .insert({ email, nickname, picture })
    .returning('playerid')
    .then((data) => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in addUser: ${err}`)
      res.sendStatus(500)
    })
}
function deleteUser(req, res) {
  let playerid = req.params.playerid
  knex('fr_players')
    .where('playerid', playerid)
    .delete()
    .then(() => {
      res.sendStatus(200)
    })
    .catch(err => {
      console.error(`Error in deleteUser: ${err}`)
      res.sendStatus(500)
    })
}










module.exports = {
  getAllUsers,
  addUser,
  deleteUser,
  getUser
}