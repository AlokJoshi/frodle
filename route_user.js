const knex = require('./dbservice')

function getAllUsers(req, res) {
  knex('fr_players')
  .then(data => {
    res.json(data)
  })
  .catch(err => {
    console.error(`Error in getAllUsers: ${err}`)
    res.sendStatus(500)
  })
}
function addUser(req, res) {
  let email=req.body.email
  let pwd=req.body.pwd
  let nickname=req.body.nickname
  knex('fr_players')
  .insert({email,pwd,nickname})
  .then(() => {
    res.sendStatus(200)
  })
  .catch(err => {
    console.error(`Error in addUser: ${err}`)
    res.sendStatus(500)
  })
}
function deleteUser(req, res) {
  let playerid=req.params.playerid
  knex('fr_players')
  .where('playerid',playerid)
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
  deleteUser
  
}