const knex = require('./dbservice')

function getAllOffers(req, res) {
  //returns only those offers that have not been accepted
  let playerid = req.params.playerid
  console.log(`In getAllOffers playerid:${playerid}`)
  knex('fr_offers')
    .where('toplayer', playerid)
    .where('acceptedon',null)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getAllOffers: ${err}`)
      res.sendStatus(500)
    })
}

function createAnOffer(req, res) {
  let fromplayer = req.body.fromplayer
  let toplayer = req.body.toplayer
  console.log(`In createAnOffer fromplayer:${fromplayer} toplayer:${toplayer}`)
  knex('fr_offers')
    .insert({ fromplayer, toplayer })
    .returning('offerid')
    .then((data) => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in createAnOffer: ${err}`)
      res.sendStatus(500)
    })
}

function acceptAnOffer(req, res) {
  let offerid = req.params.offerid
  console.log(`In acceptAnOffer offerid:${offerid}`)
  knex('fr_offers')
    .where('offerid', offerid)
    .update({ 'acceptedon': 'now' })
    .returning(['offerid', 'fromplayer', 'toplayer'])
    .then((data) => {
      console.log(`data returned in acceptAnOffer: ${JSON.stringify(data)}`)
      knex('fr_matches')
        .insert({'offerid':data[0].offerid, 'player1id':data[0].fromplayer, 'player2id':data[0].toplayer })
        .returning('matchid')
        .then(data => {
          res.json(data)
        })
        .catch(err => {
          console.error(`Error in inserting into matches: ${err}`)
          res.sendStatus(500)
        })
    })
    .catch(err => {
      console.error(`Error in acceptAnOffer: ${err}`)
      res.sendStatus(500)
    })
}



module.exports = {
  getAllOffers,
  createAnOffer,
  acceptAnOffer

}