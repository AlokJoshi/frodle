const knex = require('./dbservice')

function getAllMatchesAsInitiator(req, res) {
  let playerid = req.params.playerid
  knex('fr_matches')
  .where('player1id',playerid)
  .then(data => {
    res.json(data)
  })
  .catch(err => {
    console.error(`Error in getAllMatchesAsInitiator: ${err}`)
    res.sendStatus(500)
  })
}
function getAllMatchesAsResponder(req, res) {
  let playerid = req.params.playerid
  knex('fr_matches')
  .where('player2id',playerid)
  .then(data => {
    res.json(data)
  })
  .catch(err => {
    console.error(`Error in getAllMatchesAsResponder: ${err}`)
    res.sendStatus(500)
  })
}
function updatePlayerWord(req,res){
  let matchid = req.params.matchid
  let playernum = req.params.playernum
  let playerid = req.params.playerid
  let opponentnum = playernum==1?2:1
  let word = req.params.word
  knex('fr_matches')
  .where('matchid',matchid)
  .andWhere(`player${playernum}id`,playerid)
  .update(`player${opponentnum}word`,word)
  .then(() => {
    res.sendStatus(200)
  })
  .catch(err => {
    console.error(`Error in getAllMatchesAsResponder: ${err}`)
    res.sendStatus(500)
  })
}

function getAllMatches(req, res) {
  let playerid = req.params.playerid
  console.log(`In getAllMatches, playerid:${playerid}`)
  knex.raw(`
    select matches1.*,count(fr_tries.triesid) as player1tries, null as player2tries from fr_matches as matches1  
    inner join fr_tries on matches1.matchid = fr_tries."matchid" 
    where player1id = ? and fr_tries.playerid = ? 
    group by matches1.matchid
    union
    select matches2.*, null as player1tries, count(fr_tries.triesid) as player2tries from fr_matches as matches2 
    inner join fr_tries on matches2.matchid = fr_tries."matchid" 
    where player2id = ? and fr_tries.playerid = ? 
    group by matches2.matchid
  `,[playerid,playerid,playerid,playerid])
  .on('query',(q)=>console.log(q.sql))
  .then(data=>{
    res.json(data.rows)
  })
  .catch(err=>{
    console.error(`Error in getAllMatches: ${err}`)
    res.sendStatus(500)  
  })
}
module.exports = {
  getAllMatchesAsInitiator,
  getAllMatchesAsResponder,
  updatePlayerWord,
  getAllMatches
}