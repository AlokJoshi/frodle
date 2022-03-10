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
    console.log(`users returned by createUserIfNeeded:${JSON.stringify(users)}`)
    if (users.length == 0) {
      //user does not exist
      const response = await fetch(`api/users`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          nickname: nickname
        })
      })
      const json = await response.json()
      console.log(`json returned when a new user is added:${json}`)
      return json[0].playerid
    } else {
      //user exists
      console.log(`when user exists in createUserIfNeeded: ${JSON.stringify(users)}`)
      return users[0].playerid
    }
  } catch (err) {
    console.log(`Error in createUserIfNeeded:${err}`)
    //new Error(`Error in createUserIfNeeded`)
  }
}
async function getTries(matchid, playerid) {
  try {
    const response = await fetch(`/api/tries/${matchid}/${playerid}`)
    const json = await response.json()
    return json
  } catch (err) {
    console.log(`Error in getTries`)
    new Error(`Error in getTries`)
  }
}
async function getPlayers(playerid) {
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
async function submitTry(matchid, playerid, atry, trynumber,opponentid) {
  try {

    const response = await fetch(`/api/tries/guess`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchid: matchid,
        playerid: playerid,
        trynumber: trynumber,
        guess: atry,
        opponentid: opponentid
      })
    })
    const json = await response.json()
    return json[0]

  } catch (err) {
    console.log(`Error in submitTry`)
    new Error(`Error in submitTry`)
  }
}
async function existsWord(word) {
  // console.log(`Player id being sent to /api/users/other/${playerid}`)
  try {
    const response = await fetch(`/api/exists/${word}`)
    //const json = response.json()
    //console.log(`json.status:${json.status}`)
    console.log(`response.status:${response.status}`)
    return response.status
  } catch (err) {
    console.log(`Error in existsWord`)
    new Error(`Error in existsWord`)
  }
}
async function sendAnOffer(fromplayer, toplayer, wordoffer) {
  console.log(fromplayer, toplayer, wordoffer)
  try {
    const response = await fetch('/api/createoffer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromplayer: fromplayer,
        toplayer: toplayer,
        wordoffer: wordoffer
      })
    })
    const json = await response.json()
    return json

  } catch (err) {
    console.log(`Error in sendAnOffer`)
    new Error(`Error in sendAnOffer`)
  }
}
async function acceptAnOffer(playerid, offerid, wordaccept) {
  console.log(playerid, offerid, wordaccept)
  try {
    const response = await fetch('/api/acceptoffer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerid: playerid,
        offerid: offerid,
        wordaccept: wordaccept
      })
    })
    // const json = await response.json()
    // return json
    return response.status == 200

  } catch (err) {
    console.log(`Error in acceptAnOffer`)
    new Error(`Error in acceptAnOffer`)
  }
}
async function getInvitations(playerid) {
  try {
    const response = await fetch(`/api/offers/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in getInvitations`)
    new Error(`Error in getInvitations`)
  }
}
async function getPendingInvitations(playerid) {
  try {
    const response = await fetch(`/api/offers/pending/${playerid}`)
    const json = response.json()
    return json
  } catch (err) {
    console.log(`Error in getPendingInvitations`)
    new Error(`Error in getPendingInvitations`)
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
  getInvitations,
  getPendingInvitations,
  acceptAnOffer
}