let auth0 = null;
let currentRow = 1
let currentCol = 1
//set the picture, nickname and playerid as soon as the player logs in
let picture = ''
let nickname = ''
let playerid = 0
//set the matchid as soon as the match is selected
let matchid
import {
  getactiveGames, createUserIfNeeded,
  getcompletedGames, getTries, submitTry,
  getPlayers, existsWord, getInvitations,
  getPendingInvitations, getUser, sendAnOffer,
  acceptAnOffer
} from './data.js'

/**
 * Starts the authentication flow
 */
const login = async () => {
  try {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    });
  } catch (err) {
    console.log("Log in failed", err)
  }
};

/**
 * Executes the logout flow
 */
const logout = () => {
  try {
    console.log("Logging out");
    auth0.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

const updateactiveGames = async (playerid) => {
  const games = await getactiveGames(playerid)
  // console.log(`Active games:${games}`)
  const activegameslist = document.getElementById('activegameslist')
  if (activegameslist.children.length > 0) {
    activegameslist.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    let opponent = games[i].opponent.length > 15 ? games[i].opponent.substring(0, 12) + '...' : games[i].opponent
    el.innerHTML = `Match :${games[i].matchid} vs ${opponent}`
    el.setAttribute('data-matchid', games[i].matchid)
    el.classList.add('activegame')
    el.addEventListener('click', async e => {
      // console.log(e.target.dataset.matchid)
      //get the match data
      matchid = e.target.dataset.matchid
      await updateMatchGrid(matchid)
      // document.getElementById('onlyinputs').style="visibility:visible"
      // matchid = e.target.dataset.matchid
      // const tries = await getTries(matchid, playerid)
      // //console.log(JSON.stringify(tries))
      // for (let atry = 0; atry < tries.length; atry++) {
      //   // console.log(tries[atry].result)
      //   // console.log(typeof (tries[atry].result))
      //   let row = document.querySelector(`#row${atry + 1}`)
      //   let wordArray = tries[atry].try.split('')
      //   for (let ch = 0; ch < wordArray.length; ch++) {
      //     //identify the column
      //     row.childNodes[ch].value = wordArray[ch]
      //     if (tries[atry].result != null) {
      //       // console.log(tries[atry].result[ch])
      //       row.childNodes[ch].classList.add(`t${tries[atry].result[ch]}`)
      //     }
      //   }
      // }
      // currentRow = tries.length+1
      // updateActiveCell()
    })
    activegameslist.append(el)
  }

}
const clearMatchGrd = ()=>{
for (let row = 1; row<7; row++) {
  // console.log(typeof (tries[atry].result))
  let rowEl = document.querySelector(`#row${row}`)
  for (let ch = 0; ch < 5; ch++) {
    //identify the column
    rowEl.childNodes[ch].value =""
    rowEl.childNodes[ch].classList.remove('t0')
    rowEl.childNodes[ch].classList.remove('t1')
    rowEl.childNodes[ch].classList.remove('t2')
  }
}
}

const updateMatchGrid = async (matchid) => {

  //clear the old grid
  clearMatchGrd()

  currentRow=1
  document.getElementById('onlyinputs').style = "visibility:visible"
  //returns an array of all the tries
  const tries = await getTries(matchid, playerid)
  console.log(JSON.stringify(tries))
  for (let atry = 0; atry < tries.length; atry++) {
    console.log(tries[atry].result)
    // console.log(typeof (tries[atry].result))
    let row = document.querySelector(`#row${atry + 1}`)
    let wordArray = tries[atry].try.split('')
    for (let ch = 0; ch < wordArray.length; ch++) {
      //identify the column
      row.childNodes[ch].value = wordArray[ch]
      if (tries[atry].result != null) {
        // console.log(tries[atry].result[ch])
        row.childNodes[ch].classList.add(`t${tries[atry].result[ch]}`)
      }
    }
  }
  currentRow = tries.length + 1
  updateActiveCell()
}
const updatecompletedGames = async (playerid) => {
  const games = await getcompletedGames(playerid)
  //console.log(games)
  const completedgames = document.getElementById('completedgameslist')

  if (completedgames.children.length > 0) {
    completedgames.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    //decide on text
    let txt = ''
    if (games[i].mytrynumber < games[i].opptrynumber) {
      txt = `Match# ${games[i].matchid} You won: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
    } else if (games[i].mytrynumber > games[i].opptrynumber) {
      txt = `Match# ${games[i].matchid} You lost: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
    } else {
      txt = `Match# ${games[i].matchid} You drew: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
    }

    el.innerHTML = txt
    completedgames.append(el)
  }

}
const updatePlayersList = async (playerid) => {
  const plrs = await getPlayers(playerid)
  //console.log(plrs)
  const playerslist = document.getElementById('playerslist')

  if (playerslist.children.length > 0) {
    playerslist.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < plrs.length; i++) {
    let el = document.createElement('div')
    let nickname = plrs[i].nickname.length > 15 ? plrs[i].nickname.substring(0, 12) + '...' : plrs[i].nickname
    el.innerHTML = nickname
    el.setAttribute('data-playerid', plrs[i].playerid)
    playerslist.append(el)
  }

}
const updateInvitationsList = async (playerid) => {
  const plrs = await getInvitations(playerid)
  //console.log(plrs)
  const invitationslist = document.getElementById('invitationslist')

  if (invitationslist.children.length > 0) {
    invitationslist.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < plrs.length; i++) {
    let el = document.createElement('div')
    let nickname = plrs[i].nickname.length > 15 ? plrs[i].nickname.substring(0, 12) + '...' : plrs[i].nickname
    el.innerHTML = `Offer#:${plrs[i].offerid} from ${nickname}`
    el.setAttribute('data-playerid', plrs[i].fromplayer)
    el.setAttribute('data-offerid', plrs[i].offerid)
    el.setAttribute('data-nickname', plrs[i].nickname)
    invitationslist.append(el)
  }
}
const updatePendingInvitations = async (playerid) => {
  const invitations = await getPendingInvitations(playerid)
  // console.log(invitations)
  const pendinginvitations = document.getElementById('pendinginvitations')

  if (pendinginvitations.children.length > 0) {
    pendinginvitations.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < invitations.length; i++) {
    let el = document.createElement('div')
    let nickname = invitations[i].nickname.length > 15 ? invitations[i].nickname.substring(0, 12) + '...' : invitations[i].nickname
    el.innerHTML = `Offer#:${invitations[i].offerid} to ${nickname}`
    pendinginvitations.append(el)
  }
}

let kb_buttons = document.querySelectorAll('.key-row button')
// console.log(kb_buttons)
kb_buttons = [...kb_buttons]
for (let i = 0; i < kb_buttons.length; i++) {
  let kb_button = kb_buttons[i]
  kb_button.addEventListener('click',async (e) => {
    let row = document.getElementById(`row${currentRow}`)
    switch (e.target.innerText) {
      case 'ENTER':
        //submit the currentRow and move to the next row
        let guess = ''
        for (let ch = 0; ch < row.childNodes.length; ch++) {
          guess += row.childNodes[ch].value
        }
        console.log(matchid, playerid, guess, currentRow)
        submitTry(matchid, playerid, guess, currentRow)
        await updateMatchGrid(matchid)
        break;
      case 'BACK':

        break;
      default:
        //identify the input element for entering the clicked letter
        let input = Array.from(row.childNodes)[currentCol - 1]
        console.log(e.target.innerText)
        input.value = e.target.innerText
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell()
        break;
    }
  })
}
window.addEventListener('load', async () => {
  document.getElementById('btn-login').addEventListener('click', login)
  document.getElementById('btn-logout').addEventListener('click', logout)
  document.getElementById('btn-invite').addEventListener('click', async () => {
    let toPlayer = document.querySelector('.selectedopponent').dataset.playerid * 1
    let word = document.querySelector('#challengeword').value.toUpperCase()
    console.log(playerid, toPlayer, word)
    let response = await sendAnOffer(playerid, toPlayer, word)
    console.log(`Response after sending an offer: ${JSON.stringify(response)}`)
  })
  document.getElementById('btn-accept').addEventListener('click', async () => {
    let offerid = document.querySelector('.selectedinvitation').dataset.offerid * 1
    let word = document.querySelector('#challengeword2').value.toUpperCase()
    console.log(offerid, word)
    let response = await acceptAnOffer(playerid, offerid, word)
    console.log(`Response after accepting an offer: ${JSON.stringify(response)}`)
    updateactiveGames(playerid)
    updateInvitationsList(playerid)
  })
  document.getElementById('background').addEventListener('click', () => {
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })
  document.getElementById('challengeword').addEventListener('keyup', async e => {
    console.log(`Challenge word: ${e.target.value}`)
    if (e.target.value.length != 5) {
      e.target.classList.add('invalid')
      document.querySelector('#btn-invite').setAttribute('disabled', true)
      return
    }
    let status = await existsWord(e.target.value)
    console.log(`Challenge word exists:${status}`)
    if (status == 200) {
      e.target.classList.remove('invalid')
      document.querySelector('#btn-invite').removeAttribute('disabled')
    } else {
      e.target.classList.add('invalid')
      document.querySelector('#btn-invite').setAttribute('disabled', true)
    }
  })
  document.getElementById('challengeword2').addEventListener('keyup', async e => {
    console.log(`Challenge word2: ${e.target.value}`)
    if (e.target.value.length != 5) {
      e.target.classList.add('invalid')
      document.querySelector('#btn-accept').setAttribute('disabled', true)
      return
    }
    let status = await existsWord(e.target.value)
    console.log(`Challenge word exists:${status}`)
    if (status == 200) {
      e.target.classList.remove('invalid')
      document.querySelector('#btn-accept').removeAttribute('disabled')
    } else {
      e.target.classList.add('invalid')
      document.querySelector('#btn-accept').setAttribute('disabled', true)
    }
  })
  document.getElementById('invitationslist').addEventListener('click', e => {
    let invitationsArray = [...document.querySelectorAll("#invitationslist>div")]
    let nickname = e.target.dataset.nickname.length > 15 ? e.target.dataset.nickname.substring(0, 12) + '...' : e.target.dataset.nickname
    invitationsArray.forEach(element => element.classList.remove('selectedinvitation'))
    e.target.classList.add('selectedinvitation')
    document.getElementById("acceptancemessage").innerText = `Word for offer#: ${e.target.dataset.offerid} from ${nickname}`
    console.log(e.target)
  });
  document.getElementById('playerslist').addEventListener('click', e => {
    let opponentsArray = [...document.querySelectorAll("#playerslist>div")]
    opponentsArray.forEach(element => element.classList.remove('selectedopponent'))
    e.target.classList.add('selectedopponent')
    document.getElementById("invitationmessage").innerText = `Word for ${e.target.innerText}`
    console.log(e.target)
  });
  document.addEventListener('keydown', (e) => {
    if (e.target == document.getElementById('challengeword') ||
      e.target == document.getElementById('challengeword2')) {
      return
    }
    e.preventDefault()
    let key = e.key.toUpperCase()
    console.log(e.key)
    switch (key) {
      case 'ARROWRIGHT':
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell()
        break;
      case 'ARROWLEFT':
        currentCol--
        if (currentCol == 0) currentCol = 5
        updateActiveCell()
        break;
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
      case 'J':
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'O':
      case 'P':
      case 'Q':
      case 'R':
      case 'S':
      case 'T':
      case 'U':
      case 'V':
      case 'W':
      case 'X':
      case 'Y':
      case 'Z':
        //identify the input element for entering the clicked letter
        let row = document.getElementById(`row${currentRow}`)
        let input = Array.from(row.childNodes)[currentCol - 1]
        console.log(key)
        input.value = key
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell()
        //input.focus()
        break;
      default:

        break;
    }
  })


  await configureClient()
  updateUI()

  const isAuthenticated = await auth0.isAuthenticated()

  if (isAuthenticated) {
    //show the gated content
    return
  }

  //check for code and state parameters
  const query = window.location.search
  if (query.includes("code=") && query.includes("state=")) {

    //process the login state
    await auth0.handleRedirectCallback()

    updateUI()

  }
  // Use replaceState to redirect the user away and remove the querystring parameters
  window.history.replaceState({}, document.title, "/");

})

const updateUI = async () => {
  const isAuthenticated = await auth0.isAuthenticated()
  document.getElementById(`btn-logout`).disabled = !isAuthenticated
  document.getElementById(`btn-login`).disabled = isAuthenticated
  let user = await auth0.getUser()
  if (user) {
    // console.log(JSON.stringify(user))
    playerid = await createUserIfNeeded(user.name, user.nickname)
    nickname = user.nickname
    updateactiveGames(playerid)
    updatecompletedGames(playerid)
    updatePlayersList(playerid)
    updateInvitationsList(playerid)
    updatePendingInvitations(playerid)
    updateActiveCell()
    document.querySelector('#title span').innerText = `${nickname}'s Murdle`
  }
}

const updateActiveCell = () => {
  //remove the active class from all the tiles
  let tiles = document.querySelectorAll('.tile')
  tiles.forEach(tile => tile.classList.remove('active'))

  //here we should set the currentRow and currentCol after the user
  //clicks or otherwise starts a new game
  let row = document.getElementById(`row${currentRow}`)
  let input = Array.from(row.childNodes)[currentCol - 1]

  input.classList.toggle('active')
  input.focus()
}

/*
Original location of login and logout functions
*/

/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch(`/auth_config.json`)

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  const response = await fetchAuthConfig()
  const config = await response.json()
  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  })
}

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn) => {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login();
};