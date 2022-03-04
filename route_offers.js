const knex = require('./dbservice')

function getAllOffers(req, res) {
  //returns only those offers that have not been accepted
  let playerid = req.params.playerid
  console.log(`In getAllOffers playerid:${playerid}`)
  knex('fr_offers')
    .select('offerid','fromplayer','madeon','nickname')
    .innerJoin('fr_players',{'fr_players.playerid':'fr_offers.fromplayer'})
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

function getPendingOffers(req, res) {
  //returns only those offers that have not been made
  //by the player but not accepted by the opponent.
  let playerid = req.params.playerid
  console.log(`In getPendingOffers playerid:${playerid}`)
  knex('fr_offers')
    .select('offerid','toplayer','madeon','nickname')
    .innerJoin('fr_players',{'fr_players.playerid':'fr_offers.toplayer'})
    .where('fromplayer', playerid)
    .where('acceptedon',null)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getPendingOffers: ${err}`)
      res.sendStatus(500)
    })
}

function createAnOffer(req, res) {
  console.log(req.body)
  let fromplayer = req.body.fromplayer
  let toplayer = req.body.toplayer
  let wordoffer = req.body.wordoffer
  console.log(`In createAnOffer fromplayer:${fromplayer} toplayer:${toplayer} ${wordoffer}`)
  knex('fr_offers')
    .insert({ fromplayer, toplayer, wordoffer })
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
  let offerid = req.body.offerid
  let playerid = req.body.playerid
  let wordaccept = req.body.wordaccept
  console.log(`In acceptAnOffer offerid:${offerid}, playerid:${playerid}, wordaccept:${wordaccept}`)
  knex('fr_offers')
    .where('offerid', offerid)
    .update({ 'acceptedon': 'now','wordaccept' : wordaccept })
    .returning(['offerid', 'fromplayer', 'toplayer','wordoffer','wordaccept'])
    .then((data) => {
      console.log(`data returned in acceptAnOffer: ${JSON.stringify(data)}`)
      let offerid=data[0].offerid
      let fromplayer=data[0].fromplayer
      let toplayer=data[0].toplayer
      let wordoffer=data[0].wordoffer
      let wordaccept=data[0].wordaccept

      //first add a match in the fr_matches table
      knex('fr_matches')
      .insert({'done':false,'offerid':offerid})
      .returning('matchid')
      .then(data=>{
        let matchid = data[0].matchid
        console.log(`Matchid returned after adding a match:${matchid}`)
        knex('fr_match_details')
        .insert({'matchid':matchid, 
                 'playerid':toplayer, 
                 'playerword':wordoffer})
        .then(data => {
          console.log(`added player who accepted`)
          knex('fr_match_details')
          .insert({'matchid':matchid, 
                  'playerid':fromplayer, 
                  'playerword':wordaccept})
          .then(data => {
            console.log(`added player who offered`)
            res.sendStatus(200)
          })
          .catch(err=>{
            console.error(`Error in inserting into fr_match_details for second player: ${err}`)
            res.sendStatus(500)            
          })
        })
        .catch(err => {
          console.error(`Error in inserting into fr_match_details for first player: ${err}`)
          res.sendStatus(500)
        })

      })
      .catch(err=>{
        console.log(`Error in adding a record in fr_matches: ${err}`)
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
  acceptAnOffer,
  getPendingOffers
}