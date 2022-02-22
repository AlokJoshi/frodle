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
    const response = await fetch(`api/users/${email}`)
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
      return users[0].playerid
    }
  } catch (err) {
    console.log(`Error in createUserIfNeeded`)
    new Error(`Error in createUserIfNeeded`)
  }
}

export {
  getactiveGames,
  getcompletedGames,
  getUser,
  createUserIfNeeded
}