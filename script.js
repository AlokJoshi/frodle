let auth0 = null;
let socket = null;

let currentRow = 1
let currentCol = 1
//set the picture, nickname and playerid as soon as the player logs in
let picture = ''
let nickname = ''
var playerid = 0
var opponentid = 0
//set the matchid as soon as the match is selected
var matchid
import {
  getactiveGames, createUserIfNeeded,
  getcompletedGames, getTries, submitTry,
  getPlayers, existsWord, getInvitations,
  getPendingInvitations, getUser, sendAnOffer,
  acceptAnOffer,
} from './data.js'
import {
  MSG_MOVED,
  MSG_OFFERED,
  MSG_ACCEPTED,
  sendMessageMoved,
  sendMessageOffered,
  sendMessageAccepted,
  setUpSocketListeners
} from './messages.js'


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
  //console.log(`Active games:${JSON.stringify(games)}`)
  const activegameslist = document.getElementById('activegameslist')
  const activegameslist_els = [...activegameslist.children]
  if (activegameslist_els.length > 0) {
    activegameslist_els.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    let opponent = games[i].opponent.length > 15 ? games[i].opponent.substring(0, 12) + '...' : games[i].opponent
    el.innerHTML = `#${games[i].matchid} with ${opponent}`
    el.setAttribute('data-matchid', games[i].matchid)
    el.setAttribute('data-opponentid', games[i].playerid)
    el.classList.add('activegame')
    el.addEventListener('click', async e => {
      // console.log(e.target.dataset.matchid)
      //get the match data
      matchid = e.target.dataset.matchid
      opponentid = e.target.dataset.opponentid*1
      await updateMatchGrid(matchid,playerid)
    })
    activegameslist.append(el)
  }

}
const clearMatchGrid = () => {
  for (let row = 1; row < 7; row++) {
    // console.log(typeof (tries[atry].result))
    let rowEls = document.querySelectorAll(`#row${row} > div`)
    for (let ch = 0; ch < 5; ch++) {
      //identify the column
      rowEls[ch].innerText = ""
      rowEls[ch].classList.remove('t0')
      rowEls[ch].classList.remove('t1')
      rowEls[ch].classList.remove('t2')
    }
  }
}
const updateMatchGrid = async (matchid,playerid) => {

  //clear the old grid
  clearMatchGrid()

  currentRow = 1
  document.getElementById('onlyinputs').style = "visibility:visible"
  //returns an array of all the tries
  const tries = await getTries(matchid, playerid)
  console.log(`Tries made by playerid:${playerid}:${JSON.stringify(tries)}`)
  for (let atry = 0; atry < tries.length; atry++) {
    //console.log(tries[atry].result)
    // console.log(typeof (tries[atry].result))
    let row = document.querySelectorAll(`#row${atry + 1} > div`)
    let wordArray = tries[atry].try.split('')
    for (let ch = 0; ch < wordArray.length; ch++) {
      //identify the column
      row[ch].innerText = wordArray[ch]
      if (tries[atry].result != null) {
        // console.log(tries[atry].result[ch])
        row[ch].classList.add(`t${tries[atry].result[ch]}`)
      }
    }
  }
  if(tries.length>0 && tries.length<6){
    currentRow += 1
    updateActiveCell(currentRow)
    document.querySelector('.key-container').display='block'
  }else{
    document.querySelector('.key-container').display='none'
  }
}
const updatecompletedGames = async (playerid) => {
  const games = await getcompletedGames(playerid)
  //console.log(games)
  const completedgames = document.getElementById('completedgameslist')
  const completedgames_els = [...completedgames.children]
  if (completedgames_els.length > 0) {
    completedgames_els.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    //decide on text
    let txt = ''
    if (games[i].mytrynumber < games[i].opptrynumber) {
      txt = `Match# ${games[i].matchid} You won: ${games[i].mytrynumber}-${games[i].opptrynumber} against ${games[i].nickname}`
    } else if (games[i].mytrynumber > games[i].opptrynumber) {
      txt = `Match# ${games[i].matchid} You lost: ${games[i].mytrynumber}-${games[i].opptrynumber} against ${games[i].nickname}`
    } else {
      txt = `Match# ${games[i].matchid} You drew: ${games[i].mytrynumber}-${games[i].opptrynumber} against ${games[i].nickname}`
    }

    el.innerHTML = txt
    completedgames.append(el)
  }

}
const updatePlayersList = async (playerid) => {
  const plrs = await getPlayers(playerid)
  //console.log(plrs)
  const playerslist = document.getElementById('playerslist')
  const playerslist_els = [...playerslist.children]
  if (playerslist_els.length > 0) {
    playerslist_els.forEach(child => {
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
  const invitationslist_els = [...invitationslist.children]
  if (invitationslist_els.length > 0) {
    invitationslist_els.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < plrs.length; i++) {
    let el = document.createElement('div')
    let nickname = plrs[i].nickname.length > 15 ? plrs[i].nickname.substring(0, 12) + '...' : plrs[i].nickname
    el.innerHTML = `#${plrs[i].offerid} from ${nickname}`
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
  const pendinginvitations_els = [...pendinginvitations.children]
  if (pendinginvitations_els.length > 0) {
    pendinginvitations_els.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < invitations.length; i++) {
    let el = document.createElement('div')
    let nickname = invitations[i].nickname.length > 15 ? invitations[i].nickname.substring(0, 12) + '...' : invitations[i].nickname
    el.innerHTML = `#${invitations[i].offerid} ${invitations[i].wordoffer} to ${nickname}`
    pendinginvitations.append(el)
  }
}

let kb_buttons = document.querySelectorAll('.key-row button')
// console.log(kb_buttons)
kb_buttons = [...kb_buttons]
for (let i = 0; i < kb_buttons.length; i++) {
  let kb_button = kb_buttons[i]
  kb_button.addEventListener('click', async (e) => {
    let row = document.querySelectorAll(`#row${currentRow} > div`)
    switch (e.target.innerText) {
      case 'ENTER':
        //submit the currentRow and move to the next row
        let guess = ''
        //let els=(row.NodeList)
        console.log(row)
        for (let ch = 0; ch < row.length; ch++) {
          guess += row[ch].innerText
        }
        console.log(matchid, playerid, guess, currentRow)
        await submitTry(matchid, playerid, guess, currentRow,opponentid)
        sendMessageMoved(playerid,matchid)
        break;
      case 'BACK':
        currentCol = currentCol==1?currentCol:currentCol-1
        updateActiveCell(currentRow)
        break;
      default:
        //identify the input element for entering the clicked letter
        let input = row[currentCol - 1]
        // console.log(e.target.innerText)
        input.innerText = e.target.innerText
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell(currentRow)
        break;
    }
  })
}
window.addEventListener('load', async () => {
  document.getElementById('btn-results').addEventListener('click', () => {
    document.getElementById('results').style.display = "none"
  })
  document.getElementById('btn-login').addEventListener('click', login)
  document.getElementById('btn-logout').addEventListener('click', logout)
  document.getElementById('btn-invite').addEventListener('click', async () => {
    let toPlayer = document.querySelector('.selectedopponent').dataset.playerid * 1
    let word = document.querySelector('#challengeword').value.toUpperCase()
    console.log(playerid, toPlayer, word)
    let response = await sendAnOffer(playerid, toPlayer, word)
    console.log(`Response after sending an offer: ${JSON.stringify(response)}`)
    updatePendingInvitations(playerid)
    sendMessageOffered(response[0].offerid,playerid,toPlayer)
  })
  document.getElementById('btn-accept').addEventListener('click', async () => {
    let offerid = document.querySelector('.selectedinvitation').dataset.offerid * 1
    let word = document.querySelector('#challengeword2').value.toUpperCase()
    let opponentid = document.querySelector('.selectedinvitation').dataset.playerid * 1
    console.log(offerid, word)
    let response = await acceptAnOffer(playerid, offerid, word)
    console.log(`Response after accepting an offer: ${JSON.stringify(response)}`)
    updateactiveGames(playerid)
    updateInvitationsList(playerid)
    sendMessageAccepted(offerid,playerid,opponentid)
  })
  document.getElementById('background').addEventListener('click', () => {
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })
  document.getElementById('challengeword').addEventListener('keyup', async e => {
    //console.log(`Challenge word: ${e.target.value}`)
    if (e.target.value.length != 5) {
      e.target.classList.add('invalid')
      document.querySelector('#btn-invite').setAttribute('disabled', true)
      return
    }
    let status = await existsWord(e.target.value)
    //console.log(`Challenge word exists:${status}`)
    if (status == 200) {
      e.target.classList.remove('invalid')
      document.querySelector('#btn-invite').removeAttribute('disabled')
    } else {
      e.target.classList.add('invalid')
      document.querySelector('#btn-invite').setAttribute('disabled', true)
    }
  })
  document.getElementById('challengeword2').addEventListener('keyup', async e => {
    //console.log(`Challenge word2: ${e.target.value}`)
    if (e.target.value.length != 5) {
      e.target.classList.add('invalid')
      document.querySelector('#btn-accept').setAttribute('disabled', true)
      return
    }
    let status = await existsWord(e.target.value)
    //console.log(`Challenge word exists:${status}`)
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
    // console.log(e.target)
  });
  document.getElementById('playerslist').addEventListener('click', e => {
    let opponentsArray = [...document.querySelectorAll("#playerslist>div")]
    opponentsArray.forEach(element => element.classList.remove('selectedopponent'))
    e.target.classList.add('selectedopponent')
    document.getElementById("invitationmessage").innerText = `Word for ${e.target.innerText}`
    // console.log(e.target)
  });
  document.addEventListener('keydown', (e) => {
    if (e.target == document.getElementById('challengeword') ||
      e.target == document.getElementById('challengeword2')) {
      return
    }
    e.preventDefault()
    let key = e.key.toUpperCase()
    // console.log(e.key)
    switch (key) {
      case 'ARROWRIGHT':
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell(currentRow)
        break;
      case 'ARROWLEFT':
        currentCol--
        if (currentCol == 0) currentCol = 5
        updateActiveCell(currentRow)
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
        // console.log(key)
        input.value = key
        currentCol++
        if (currentCol > 5) currentCol = 1
        updateActiveCell(currentRow)
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
    updateUI()
    return
  }

  //check for code and state parameters
  const query = window.location.search
  if (query.includes("code=") && query.includes("state=")) {

    try{
      //process the login state
      await auth0.handleRedirectCallback()
    }catch(err){
      console.log(`Error in handle redirect: ${err}`)
    }

    updateUI()

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
  }
  //window.history.replaceState({}, document.title, "/");

})

const updateUI = async () => {
  const isAuthenticated = await auth0.isAuthenticated()
  document.getElementById(`btn-logout`).disabled = !isAuthenticated
  document.getElementById(`btn-login`).disabled = isAuthenticated
  let user = await auth0.getUser()
  if (user) {
    let server = window.location.origin
    console.log(`Server the socket is connecting to: ${server}`)
    socket = io.connect(server)
    console.log(`Auth0 returned a user:${JSON.stringify(user)}`)
    playerid = await createUserIfNeeded(user.name, user.nickname)
    nickname = user.nickname
    updateactiveGames(playerid)
    updatecompletedGames(playerid)
    updatePlayersList(playerid)
    updateInvitationsList(playerid)
    updatePendingInvitations(playerid)
    setUpSocketListeners(playerid)
    updateActiveCell(currentRow)
    document.querySelector('#title span').innerText = `${nickname}'s Murdle`
  }
}

const updateActiveCell = (row) => {
  //remove the active class from all the tiles
  let tiles = document.querySelectorAll('.tile')
  tiles.forEach(tile => tile.classList.remove('active'))

  //here we should set the currentRow and currentCol after the user
  //clicks or otherwise starts a new game
  let rowEls = document.querySelectorAll(`#row${row} > div`)
  let input = rowEls[currentCol - 1]

  input.classList.toggle('active')
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
const displayResults = (heading, details) => {
  const resultsEl = document.getElementById('results')
  resultsEl.style.top = window.innerHeight / 2
  resultsEl.style.left = window.innerWidth / 2

  const resultsheading = document.getElementById('resultsheading')
  resultsheading.innerText = heading
  const resultsdetails = document.getElementById('resultsdetails')
  resultsdetails.innerText = details

  resultsEl.style.display = 'block'

}
export{
  socket,
  updateMatchGrid,
  updateInvitationsList,
  updateactiveGames,
  updatePendingInvitations
}
