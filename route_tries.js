const knex = require('./dbservice')

function getAllTries(req, res) {
  let playerid = req.params.playerid
  let matchid = req.params.matchid
  knex('fr_tries')
    .where('playerid', playerid)
    .andWhere('matchid', matchid)
    .orderBy('triesid')
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
    .insert({ playerid, matchid, 'try': atry })
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
  let playerid = req.body.playerid
  let guess = req.body.guess
  let trynumber = req.body.trynumber

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
  knex('fr_match_details')
    .select(`playerword`)
    .where('matchid', matchid)
    .where(`playerid`, playerid)
    .then(data => {
      let word = data[0][`playerword`]
      let wordArray = word.split('')
      let guessArray = guess.split('')
      console.log(wordArray, guessArray)
      //now we check how guess matches up to it
      let result = []
      let numCorrect = 0
      for (let i = 0; i < 5; i++) {
        if (guessArray[i] == wordArray[i]) {
          numCorrect++
          result.push(2)
        } else if (wordArray.includes(guessArray[i])) {
          result.push(1)
        } else {
          result.push(0)
        }
      }
      res.json(result)
      //do additional processing. Enter the guess in the tries table
      knex('fr_tries')
        .insert({ playerid, matchid, 'try': guess, result })
        .returning('triesid')
        .then(data => {
          console.log(JSON.stringify(data))
          //do additional processing. Update the playerdone to true
          //do additional processing. Update the fr_match_details.trynumber and 
          //fr_match_details.done 
          knex('fr_match_details')
          .update({ 'trynumber': trynumber , 'playerdone': numCorrect == 5 })
          .where('matchid', matchid)
          .andWhere('playerid', playerid)
          .then(data=>{
            console.log(`Updated fr_match_details with trynumber and playerdone: ${data}`)
            //res.json(data)
          })
          .catch(err=>{
            console.log(`Error in updating fr_match_details with trynumber and playerdone:${err}`)
            //res.sendStatus(500)
          })
        })
        .catch(err => {
          console.log(`Error in MakeAGuess while adding a try to the tries table: ${err}`)
          //res.sendStatus(500)
        })
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