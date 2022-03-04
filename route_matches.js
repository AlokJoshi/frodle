const knex = require('./dbservice')

function updatePlayerWord(req,res){
  let matchid = req.params.matchid
  let playerid = req.params.playerid
  let word = req.params.word
  knex('fr_match_details')
  .where('matchid',matchid)
  .andWhere(`playerid`,playerid)
  .update(`playerword`,word)
  .then(() => {
    res.sendStatus(200)
  })
  .catch(err => {
    console.error(`Error in updatePlayerWord: ${err}`)
    res.sendStatus(500)
  })
}

function getAllMatches(req, res) {
  let playerid = req.params.playerid
  //console.log(`In getAllMatches, playerid:${playerid}`)
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
  //.on('query',(q)=>console.log(q.sql))
  .then(data=>{
    res.json(data.rows)
  })
  .catch(err=>{
    console.error(`Error in getAllMatches: ${err}`)
    res.sendStatus(500)  
  })
}

function getAllActiveMatches(req, res) {
  let playerid = req.params.playerid
  //console.log(`In getAllActiveMatches, playerid:${playerid}`)
  knex('fr_match_details as myMatch')
  .innerJoin('fr_match_details as oppMatch',{'myMatch.matchid':'oppMatch.matchid'})
  .innerJoin('fr_players',{'oppMatch.playerid':'fr_players.playerid'})
  .where('myMatch.playerdone',false)
  .andWhere('myMatch.playerid',playerid)
  .andWhere(knex.raw(`"myMatch"."matchdetailsid" <> "oppMatch"."matchdetailsid"`))
  .select('myMatch.*','oppMatch.*','nickname as opponent')
  // .on('query',(q)=>console.log(q.sql))
  .then(data=>{
    console.log(JSON.stringify(data))
    res.json(data)
  })
  .catch(err=>{
    console.error(`Error in getAllActiveMatches: ${err}`)
    res.sendStatus(500)  
  })
}

function getAllCompletedMatches(req, res) {
  let playerid = req.params.playerid
  // console.log(`In getAllCompletedMatches, playerid:${playerid}`)
  knex('fr_matches')
  .select('myMatch.matchid as matchid','myMatch.trynumber as mytrynumber','oppMatch.trynumber as opptrynumber','nickname')
  .innerJoin('fr_match_details as myMatch',{'fr_matches.matchid':'myMatch.matchid'})
  .innerJoin('fr_match_details as oppMatch',{'fr_matches.matchid':'oppMatch.matchid'})
  .innerJoin('fr_players',{'fr_players.playerid':'oppMatch.playerid'})
  .where('myMatch.playerid',playerid)
  .andWhere('myMatch.playerdone',true)
  .andWhere('oppMatch.playerdone',true)
  .andWhere(knex.raw(`"myMatch"."matchdetailsid" <> "oppMatch"."matchdetailsid"`))
  // .on('query',q=>console.log(q.sql))
  .then(data=>{
    res.json(data)
  })
  .catch(err=>{
    console.error(`Error in getAllCompletedMatches: ${err}`)
    res.sendStatus(500)  
  })
}

// This is not needed
// function getMatch(req,res){
//   let matchid = req.params.matchid
//   let playerid = req.params.playerid
//   knex('fr_matches')
//   .where('matchid',matchid)
//   .then((data) => {
//     if(data[0].player1id==playerid){
//       res.json(data[0].player1word)
//     }else if(data[0].player2id==playerid){
//       res.json(data[0].player2word)
//     }
//   })
//   .catch(err => {
//     console.error(`Error in getMatch: ${err}`)
//     res.sendStatus(500)
//   })
// }
module.exports = {
  updatePlayerWord,
  getAllMatches,
  getAllActiveMatches,
  getAllCompletedMatches,
  // getMatch
}