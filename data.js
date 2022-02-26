async function getactiveGames(playerid) {
  try {
    const response = await fetch(`/api/matches/active/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in /api/matches/${playerid}`)
    new Error(`Error in /api/matches/${playerid}`)
  }
}
async function getcompletedGames(playerid) {
  try {
    const response = await fetch(`/api/matches/completed/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in /api/matches/${playerid}`)
    new Error(`Error in /api/matches/${playerid}`)
  }
}
async function getUser(email) {
  try {
    const response = await fetch(`/api/users/${email}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in /api/matches/${playerid}`)
    new Error(`Error in /api/matches/${playerid}`)
  }
}

async function createUserIfNeeded(email, nickname) {
  //returns userid/playerid of the active user or the new user 

  //check if the user already exists

  try {
    let users = await getUser(email)
    if (users.length == 0) {
      //user does not exist
      const response = await fetch({
        method:'POST',
        url: `api/users`,
        body: {
          email:email,
          nickname:nickname
        }  
      })
      const json = response.json()
      return json[0].playerid
    } else {
      //user exists
      // console.log(`createUserIfNeeded: ${users[0].playerid}`)
      return users[0].playerid
    }
  } catch (err) {
    console.log(`Error in createUserIfNeeded`)
    new Error(`Error in createUserIfNeeded`)
  }
}
async function getTries(matchid,playerid){
  try {
    const response = await fetch(`/api/tries/${matchid}/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in getTries`)
    new Error(`Error in getTries`)
  }
}
async function getPlayers(playerid){
  // console.log(`Player id being sent to /api/users/other/${playerid}`)
  try {
    const response = await fetch(`/api/users/other/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in getPlayers`)
    new Error(`Error in getPlayers`)
  }
}
async function submitTry(matchid,playerid,atry,trynumber){
  try {
    
      const response = await fetch({
        method:'POST',
        url: `/api/tries/guess`,
        body: {
          matchid:matchid,
          playerid:playerid,
          trynumber:trynumber,
          guess:atry
        }  
      })
      const json = response.json()
      return json[0].playerid
    
  } catch (err) {
    console.log(`Error in submitTry`)
    new Error(`Error in submitTry`)
  }
}
async function existsWord(word){
  // console.log(`Player id being sent to /api/users/other/${playerid}`)
  try {
    const response = await fetch(`/api/exists/${word}`)
    const json = response.json()
    //console.log(`json.status:${json.status}`)
    console.log(`response.status:${response.status}`)
    return response.status
  } catch (err) {
    console.log(`Error in existsWord`)
    new Error(`Error in existsWord`)
  }
}
async function sendAnOffer(myid,opponentid,word){

}
async function getInvitations(playerid){
  try {
    const response = await fetch(`/api/api/offers/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in getInvitations`)
    new Error(`Error in getInvitations`)
  }  
}
export {
  getactiveGames,
  getcompletedGames,
  getUser,
  createUserIfNeeded,
  getTries,
  submitTry,
  getPlayers,
  existsWord,
  sendAnOffer,
  getInvitations
}