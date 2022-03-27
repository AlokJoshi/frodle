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
  .where(knex.raw('(("myMatch".playerdone = false and "myMatch".trynumber<6) or ("oppMatch".playerdone = false and "oppMatch".trynumber<6))'))
  .andWhere(knex.raw('(("myMatch".playerdone = true and "oppMatch".playerdone = false and "myMatch".trynumber > "oppMatch".trynumber))'))
  .andWhere(knex.raw('(("myMatch".playerdone = false and "oppMatch".playerdone = true and "myMatch".trynumber < "oppMatch".trynumber))'))
  .andWhere('myMatch.playerid',playerid)
  .andWhere(knex.raw(`"myMatch"."matchdetailsid" <> "oppMatch"."matchdetailsid"`))
  .select('myMatch.*','oppMatch.*','nickname as opponent')
  .orderBy('myMatch.matchid','desc')
  // .on('query',(q)=>console.log(q.sql))
  .then(data=>{
    //console.log(`in getAllActiveMatches, data returned to clieent: ${JSON.stringify(data)}`)
    res.json(data)
  })
  .catch(err=>{
    console.error(`Error in getAllActiveMatches: ${err}`)
    res.sendStatus(500)  
  })
}

function getAllCompletedMatches(req,res){
  let playerid = req.params.playerid
  let query = `
    WITH matches (id) AS (
      select matchid from fr_match_details where playerid=?
    )
    Select matches.id , 
    "myMatch"."trynumber" as mytries,
    "oppMatch"."trynumber" as opptries,
    "myMatch"."playerdone" as medone,
    "oppMatch"."playerdone" as oppdone,
    "oppPlayer"."nickname"
    from "matches"
            inner join "fr_match_details" as "myMatch" on "matches"."id" = "myMatch"."matchid"
            inner join "fr_match_details" as "oppMatch" on "matches"."id" = "oppMatch"."matchid"
            inner join "fr_players"  as "mePlayer" on "mePlayer"."playerid" = "myMatch"."playerid"
            inner join "fr_players"  as "oppPlayer" on "oppPlayer"."playerid" = "oppMatch"."playerid"
    where "myMatch"."matchdetailsid" <> "oppMatch"."matchdetailsid" and "myMatch"."playerid" = ? and (
          ("myMatch".playerdone = true and "oppMatch".playerdone = true)
      OR ("myMatch".playerdone = true and "oppMatch".playerdone = false and "myMatch".trynumber <= "oppMatch".trynumber)
      OR ("myMatch".playerdone = false and "oppMatch".playerdone = true and "myMatch".trynumber >= "oppMatch".trynumber)
      OR ("myMatch".playerdone = true and "oppMatch".playerdone = true and "myMatch".trynumber = "oppMatch".trynumber)
      OR ("myMatch".playerdone = false and "oppMatch".playerdone = false and "myMatch".trynumber = 6 and
          "oppMatch".trynumber = 6))
  `
  knex.raw(query,[playerid,playerid])
  .on('query',q=>console.log(q.sql))
  .then(data=>{
      res.json(data.rows)
  })
  .catch(err=>{
      console.error(`Error in getAllCompletedMatches: ${err}`)
      res.sendStatus(500)  
  })

}
function getAllMatchIds(playerid){
  knex('fr_match_details')
  .select(`matchid`)
  .where('playerid',playerid)
  .then(data=>{
    console.log(data)
  })
  .catch(err=>{
    console.log(`Error in getAllMatchIds: ${err}`)
  })
}

module.exports = {
  updatePlayerWord,
  getAllMatches,
  getAllActiveMatches,
  getAllCompletedMatches,
  // getMatch
}