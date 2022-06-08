// const { isObject } = require('superagent/lib/utils')
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
  let opponentid = req.body.opponentid
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
      let remainingChars = [...wordArray]
      let guessArray = guess.split('')
      console.log(wordArray, guessArray,remainingChars)
      //now we check how guess matches up to it
      let result = [0,0,0,0,0]
      let numCorrect = 0
      //first identify only complete matches
      for (let i = 0; i < 5; i++) {
        if (guessArray[i] == wordArray[i]) {
          numCorrect++
          result[i] = 2
          //also remove one occurence of this character from remaining chars array
          const index = remainingChars.findIndex((v)=>v==guessArray[i])
          remainingChars.splice(index,1)
        } 
      }
      //now handle the other characters in the guessArray
      for (let i = 0; i < 5; i++) {
        if(result[i]!=2 && remainingChars.includes(guessArray[i])){
          result[i] = 1
        }
      }
      // for (let i = 0; i < 5; i++) {
      //   if (guessArray[i] == wordArray[i]) {
      //     numCorrect++
      //     result.push(2)
      //   } else if (wordArray.includes(guessArray[i])) {
      //     result.push(1)
      //   } else {
      //     result.push(0)
      //   }
      // }
      
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
          .update({ 'trynumber': trynumber, 'playerdone': numCorrect == 5 })
          .where('matchid', matchid)
          .andWhere('playerid', playerid)
          .then(data => {
            console.log(`Updated fr_match_details for matchid: ${matchid} and playerid: ${playerid}`)
            res.json(result)
            //if the num correct is 5 or if trynumber is 6 then we may have to evaluate
            //if the match is over and if it is we have to send a special message
            //to both the players
            let playerfailedtocompete=(trynumber==6 && numCorrect<5)
            if(playerfailedtocompete || numCorrect == 5){
              //check opponent status
              knex('fr_match_details')
              .where('matchid',matchid)
              .andWhere('playerid',opponentid)
              .select('trynumber','playerdone')
              .then(data => {
                let opptrynumber=data[0].trynumber
                let oppdone = data[0].playerdone
                if(playerfailedtocompete && (opptrynumber==6 && !oppdone)){
                  //it is draw
                  console.log(`emit a results message with draw: both players could not do it`)
                }else if((numCorrect == 5) && oppdone){
                  //both players have finished
                  console.log(`emit a results message: both players have finished`)
                  if(trynumber<opptrynumber){
                    //player has won
                    console.log(`emit a results message: player has won`)
                  }else if(trynumber>opptrynumber){
                    //opponent has won
                    console.log(`emit a results message: opponent has won`)
                  }else{
                    //it is a draw
                    console.log(`emit a results message with draw`)
                  }
                }else if((numCorrect==5) && ((opptrynumber==6) && !oppdone)){
                  //opponent waas not able to complete in 6 tries while player was
                  //player has won
                  console.log(`emit a results message: player has won`)
                }else if (oppdone && ((trynumber==6) && numCorrect<5)){
                  //opponent has won
                  console.log(`emit a results message: opponent has won`)
                }
              })
            }
          })
          .catch(err => {
            console.log(`Error in updating fr_match_details with trynumber and playerdone:${err}`)
            res.sendStatus(500)
          })
        })
        .catch(err => {
          console.log(`Error in MakeAGuess while adding a try to the tries table: ${err}`)
          res.sendStatus(500)
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