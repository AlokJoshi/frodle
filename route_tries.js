const knex = require('./dbservice')

function getAllTries(req, res) {
  let playerid = req.params.playerid
  let matchid = req.params.matchid
  knex('fr_tries')
    .where('playerid', playerid)
    .andWhere('matchid', matchid)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getAllTries: ${err}`)
      res.sendStatus(500)
    })
}
function addTry(req, res) {
  let playerid = req.body.playerid
  let matchid = req.body.matchid
  let atry = req.body.try

  knex('fr_tries')
    .insert({ playerid, matchid, 'try': atry, 'triedon': 'now' })
    .returning('triesid')
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.error(`Error in getAllTries: ${err}`)
      res.sendStatus(500)
    })
}
function makeAGuess(req, res) {
  let matchid = req.body.matchid
  let playernum = req.body.playernum
  let playerid = req.body.playerid
  let guess = req.body.guess

  /* 
  this will return an array
  [%,%,%,%,%]
  where % is 
  0 = letter not there in word
  1 = letter present but not in right position
  2 = letter present and in right position

  Also this will update the fr_tries table
  Also this will update the playerxtries and playerxdone fields in matches table
  */

  //first get the word
  knex('fr_matches')
    .select(`player${playernum}word`)
    .where('matchid',matchid)
    .where(`player${playernum}id`,playerid)
    .then(data => {
      let word = data[0][`player${playernum}word`]
      let wordArray = word.split('')
      let guessArray = guess.split('')
      console.log(wordArray,guessArray)
      //now we check how guess matches up to it
      let result = []
      let numCorrect = 0
      for(let i=0;i<5;i++){
        if(guessArray[i]==wordArray[i]){
          numCorrect++
          result.push(2)
        }else if(wordArray.includes(guessArray[i])){
          result.push(1)
        }else{
          result.push(0)
        }
      }
      res.json(result)
      //do additional processing. Enter the guess in the tries table
      knex('fr_tries')
      .insert({playerid,matchid,'try':guess})
      .returning('triesid')
      .then(data=>{
        console.log(JSON.stringify(data))
      })
      .catch(err=>{
        console.log(`Error in MakeAGuess while adding a try to the tries table: ${err}`)
      })
      //do additional processing. Update the playerxdone to true
      if(numCorrect==5){
        knex.raw(`Update fr_matches set ${playernum==1?'player1done':'player2done'} = true
                  where matchid = ?`,[matchid])
        .on('query',q=>console.log(q.sql))
        .then(()=>{
          console.log(JSON.stringify(data))
        })
        .catch(err=>{
          console.log(`Error in MakeAGuess while updating playerxdone: ${err}`)
        })
      }

    })
    .catch(err => {
      console.error(`Error in makeAGuess: ${err}`)
      res.sendStatus(500)
    })
}




module.exports = {
  getAllTries,
  addTry,
  makeAGuess
}