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
    el.addEventListener('click', async e => {
      // console.log(e.target.dataset.matchid)
      //get the match data
      matchid = e.target.dataset.matchid
      opponentid = e.target.dataset.opponentid * 1
      //remove selectedgama class from all
      const games = [...document.querySelectorAll(`#activegameslist > div`)]
      games.forEach(game => game.classList.remove(`selectedgame`))
      e.target.classList.add('selectedgame')
      await updateMatchGrid(matchid, playerid)
      const title = document.querySelector('#currentgame > h2')
      title.textContent = `Current Game (${e.target.innerHTML})`
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
      rowEls[ch].classList.remove('t0', 't1', 't2', 'flip')
    }
  }
}
const updateMatchGrid = async (matchid, playerid) => {

  //clear the old grid
  clearMatchGrid()
  resetKeyBoard()

  document.getElementById('onlyinputs').style = "visibility:visible"
  //returns an array of all the tries
  const tries = await getTries(matchid, playerid)
  let movesPlayed = tries.length >= 6 ? 6 : tries.length
  let numCorrect = 0
  for (let atry = 0; atry < movesPlayed; atry++) {
    let row = document.querySelectorAll(`#row${atry + 1} > div`)
    let wordArray = tries[atry].try.split('')
    for (let ch = 0; ch < wordArray.length; ch++) {
      //identify the column
      row[ch].innerText = wordArray[ch]
      if (tries[atry].result != null) {
        if (atry == (movesPlayed - 1)) {
          numCorrect += tries[atry].result[ch] == 2 ? 1 : 0
          setTimeout(() => {
            row[ch].classList.add(`flip`)
            row[ch].classList.add(`t${tries[atry].result[ch]}`)
          }, ch * 1000)
        } else {
          row[ch].classList.add(`t${tries[atry].result[ch]}`)
        }
      }
    }
    // setUsedClass(tries[atry].try)
    setUsedClassNew(row)
  }
  currentRow = (movesPlayed == 6 || numCorrect == 5) ? 0 : movesPlayed + 1
  // console.log(`Tries made by playerid:${playerid}:${JSON.stringify(tries)},Current Row: ${currentRow}`)
  document.querySelector('.key-container').display = matchid == 0 ? 'none' : 'block'
  updateActiveCell(currentRow)
  updateKeyBoard(currentRow, matchid)
}
const updatecompletedGames = async (playerid) => {
  const games = await getcompletedGames(playerid)
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
    let id = games[i].id
    let myTries = games[i].mytries
    let oppTries = games[i].opptries
    let myword = games[i].myword
    let oppword = games[i].oppword
    let meDone = games[i].medone
    let oppDone = games[i].oppdone
    let nickname = games[i].nickname

    let completedclass = ""
    if (meDone && oppDone) {
      if (myTries < oppTries) {
        txt = `#${id} You (${myword}) won: ${myTries} to ${oppTries} vs ${nickname} (${oppword})`
        completedclass = "won"
      } else if (myTries > oppTries) {
        txt = `#${id} You (${myword}) lost: ${myTries} to ${oppTries} vs ${nickname} (${oppword})`
        completedclass = "lost"
      } else {
        txt = `#${id} You (${myword}) drew: ${myTries} to ${oppTries} vs ${nickname} (${oppword})`
        completedclass = "drew"
      }
    }
    if (meDone && !oppDone && (myTries <= oppTries)) {
      txt = `#${id} You (${myword}) won: ${myTries} to +${oppTries} vs ${nickname} (${oppword})`
      completedclass = "won"
    }
    if (oppDone && !meDone && (myTries >= oppTries)) {
      txt = `#${id} You (${myword}) lost: +${myTries} to ${oppTries} vs ${nickname} (${oppword})`
      completedclass = "lost"
    }
    if (!oppDone && !meDone && (myTries == 6) && (oppTries == 6)) {
      txt = `#${id} You (${myword}) drew: ${myTries} to ${oppTries} vs ${nickname} (${oppword})`
      completedclass = "drew"
    }

    el.innerHTML = txt
    el.classList.add(completedclass)
    completedgames.append(el)
  }

}
const updatePlayersList = async (playerid) => {
  const searchtext = document.getElementById("searchtext").value.toLowerCase()
  const plrs = await getPlayers(playerid)
  //console.log(plrs)
  const playerslist = document.getElementById('playerslist')
  playerslist.innerHTML = ""
  let template = document.querySelector('[data-template]')
  for (let i = 0; i < plrs.length; i++) {
    if (searchtext == '' || (plrs[i].nickname.toLowerCase().includes(searchtext))) {
      let player = template.content.cloneNode(true).children[0]
      let nickname = plrs[i].nickname.length > 15 ? plrs[i].nickname.substring(0, 12) + '...' : plrs[i].nickname
      player.querySelector(`[player-name]`).innerText = nickname
      player.setAttribute('data-playerid', plrs[i].playerid)
      //add an event listener on the invite button
      player.querySelector(`[player-invite]`).addEventListener('click', (e) => {
        //hide invite button
        e.target.classList.add('hidden')
        //unhide the word and send
        player.querySelector('[player-word-and-send').classList.remove('hidden')
        player.querySelector('[player-word-and-send').classList.add('playerandword-initiator')
        //add event listener to the Send button
        player.querySelector('[player-button-send]').addEventListener('click', async () => {
          let toPlayer = plrs[i].playerid
          let word = player.querySelector('[player-word]').value.trim().toUpperCase()
          if(word.length==5){
            console.log(playerid, toPlayer, word)
            let response = await sendAnOffer(playerid, toPlayer, word)
            console.log(`Response after sending an offer: ${JSON.stringify(response)}`)
            updatePendingInvitations(playerid)
            sendMessageOffered(response[0].offerid, playerid, toPlayer)
            //show the invite button
            e.target.classList.remove('hidden')
            //unhide the word and send
            player.querySelector('[player-word-and-send').classList.add('hidden')
            player.querySelector('[player-word-and-send').classList.remove('playerandword-initiator')
          }else{
            alert('Please note that the word should be of 5 characters')
          }
        })
      })
      playerslist.append(player)
    }
  }

}
const updateInvitationsList = async (playerid) => {
  const invs = await getInvitations(playerid)
  //console.log(invs)
  const invitationslist = document.getElementById('invitationslist')
  // const invitationslist_els = [...invitationslist.children]
  // if (invitationslist_els.length > 0) {
  //   invitationslist_els.forEach(child => {
  //     child.remove()
  //   });
  // }
  invitationslist.innerHTML = ""
  let template = document.querySelector('[data-template]')
  for (let i = 0; i < invs.length; i++) {
    // let el = document.createElement('div')
    // let nickname = invs[i].nickname.length > 15 ? invs[i].nickname.substring(0, 12) + '...' : invs[i].nickname
    // el.innerHTML = `#${invs[i].offerid} from ${nickname}`
    // el.setAttribute('data-playerid', invs[i].fromplayer)
    // el.setAttribute('data-offerid', invs[i].offerid)
    // el.setAttribute('data-nickname', invs[i].nickname)
    // invitationslist.append(el)
    let player = template.content.cloneNode(true).children[1]
    let nickname = invs[i].nickname.length > 15 ? invs[i].nickname.substring(0, 12) + '...' : invs[i].nickname
    let invitationText = `#${invs[i].offerid} from ${nickname}`
    player.querySelector('[invitation-text]').innerText = invitationText
    player.querySelector('[player-accept]').addEventListener('click', (e) => {
      //hide accept button
      e.target.classList.add('hidden')
      //unhide the word and send
      player.querySelector('[player-word-and-send').classList.remove('hidden')
      player.querySelector('[player-word-and-send').classList.add('playerandword-acceptor')
      //add event listener to the Send button
      player.querySelector('[player-button-send]').addEventListener('click', async () => {
        let word = player.querySelector('[player-word]').value.trim().toUpperCase()
        if(word.length==5){
          console.log(playerid, invs[i].offerid, word)
          let response = await acceptAnOffer(playerid, invs[i].offerid, word)
          console.log(`Response after accepting an offer: ${JSON.stringify(response)}`)
          updateactiveGames(playerid)
          updateInvitationsList(playerid)
          sendMessageAccepted(invs[i].offerid, playerid, invs[i].fromplayer)
          //show the invite button
          e.target.classList.remove('hidden')
          //unhide the word and send
          player.querySelector('[player-word-and-send').classList.add('hidden')
          player.querySelector('[player-word-and-send').classList.remove('playerandword-acceptor')
        }else{
          alert('Please note that the word should be of 5 characters')
        }
      })
    })
    invitationslist.append(player)
  }
}
const updatePendingInvitations = async (playerid) => {
  const invitations = await getPendingInvitations(playerid)
  // console.log(invitations)
  const pendinginvitationslist = document.getElementById('pendinginvitationslist')
  const pendinginvitations_els = [...pendinginvitationslist.children]
  if (pendinginvitations_els.length > 0) {
    pendinginvitations_els.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < invitations.length; i++) {
    let el = document.createElement('div')
    let nickname = invitations[i].nickname.length > 15 ? invitations[i].nickname.substring(0, 12) + '...' : invitations[i].nickname
    el.innerHTML = `#${invitations[i].offerid} ${invitations[i].wordoffer} to ${nickname}`
    pendinginvitationslist.append(el)
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
        let guess = ''
        for (let ch = 0; ch < row.length; ch++) {
          guess += row[ch].innerText
        }
        if (guess.trim().length == 5) {
          const status = await existsWord(guess)
          if (status == 200) {
            // console.log(matchid, playerid, guess, currentRow)
            await submitTry(matchid, playerid, guess, currentRow, opponentid)
            sendMessageMoved(playerid, opponentid, matchid)
            // setUsedClass(guess)
          } else {
            alert(`${guess} is not a valid word.`)
          }
        } else {
          alert(`Please select a 5 letter word.`)
        }
        break;
      case 'BACK':
        currentCol = currentCol == 1 ? currentCol : currentCol - 1
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
  document.getElementById('searchtext').addEventListener('input', async (e) => {
    updatePlayersList(playerid)
  })
  document.getElementById('btn-login').addEventListener('click', login)
  document.getElementById('btn-logout').addEventListener('click', logout)
  // document.getElementById('btn-invite').addEventListener('click', async () => {
  //   let toPlayer = document.querySelector('.selectedopponent').dataset.playerid * 1
  //   let word = document.querySelector('#challengeword').value.toUpperCase()
  //   console.log(playerid, toPlayer, word)
  //   let response = await sendAnOffer(playerid, toPlayer, word)
  //   console.log(`Response after sending an offer: ${JSON.stringify(response)}`)
  //   updatePendingInvitations(playerid)
  //   sendMessageOffered(response[0].offerid, playerid, toPlayer)
  // })
  // document.getElementById('btn-accept').addEventListener('click', async () => {
  //   let offerid = document.querySelector('.selectedinvitation').dataset.offerid * 1
  //   let word = document.querySelector('#challengeword2').value.toUpperCase()
  //   let opponentid = document.querySelector('.selectedinvitation').dataset.playerid * 1
  //   console.log(offerid, word)
  //   let response = await acceptAnOffer(playerid, offerid, word)
  //   console.log(`Response after accepting an offer: ${JSON.stringify(response)}`)
  //   updateactiveGames(playerid)
  //   updateInvitationsList(playerid)
  //   sendMessageAccepted(offerid, playerid, opponentid)
  // })
  document.getElementById('background').addEventListener('click', () => {
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })

  // document.getElementById('challengeword2').addEventListener('keyup', async e => {
  //   //console.log(`Challenge word2: ${e.target.value}`)
  //   if (e.target.value.length != 5) {
  //     e.target.classList.add('invalid')
  //     document.querySelector('#btn-accept').setAttribute('disabled', true)
  //     return
  //   }
  //   let status = await existsWord(e.target.value)
  //   //console.log(`Challenge word exists:${status}`)
  //   if (status == 200) {
  //     e.target.classList.remove('invalid')
  //     document.querySelector('#btn-accept').removeAttribute('disabled')
  //   } else {
  //     e.target.classList.add('invalid')
  //     document.querySelector('#btn-accept').setAttribute('disabled', true)
  //   }
  // })
  // document.getElementById('invitationslist').addEventListener('click', e => {
  //   let invitationsArray = [...document.querySelectorAll("#invitationslist>div")]
  //   let nickname = e.target.dataset.nickname.length > 15 ? e.target.dataset.nickname.substring(0, 12) + '...' : e.target.dataset.nickname
  //   invitationsArray.forEach(element => element.classList.remove('selectedinvitation'))
  //   e.target.classList.add('selectedinvitation')
  //   document.getElementById("acceptancemessage").innerText = `Word for offer#: ${e.target.dataset.offerid} from ${nickname}`
  //   // console.log(e.target)
  // });

  document.addEventListener('keydown', (e) => {
    if (e.target == document.getElementById('challengeword') ||
      e.target == document.getElementById('challengeword2') ||
      e.target == document.getElementById('searchtext') ||
      e.target.classList.contains('challengeword')) {
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
      case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
      case 'G': case 'H': case 'I': case 'J': case 'K': case 'L':
      case 'M': case 'N': case 'O': case 'P': case 'Q': case 'R':
      case 'S': case 'T': case 'U': case 'V': case 'W': case 'X':
      case 'Y': case 'Z':
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

    try {
      //process the login state
      await auth0.handleRedirectCallback()
    } catch (err) {
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
    updateKeyBoard(currentRow, matchid)
    document.querySelector('#title span').innerText = `${nickname}'s Murdle`
  }
}

const updateActiveCell = (row) => {
  //remove the active class from all the tiles
  let tiles = document.querySelectorAll('.tile')
  tiles.forEach(tile => tile.classList.remove('active'))

  //here we should set the currentRow and currentCol after the user
  //clicks or otherwise starts a new game
  if (row != 0) {
    let rowEls = document.querySelectorAll(`#row${row} > div`)
    let input = rowEls[currentCol - 1]
    input.classList.toggle('active')
  }
}
const updateKeyBoard = (currentRow, matchid) => {
  //if moves played is 6 then disable ENTER on keyboard
  const kbEls = [...document.querySelectorAll(`.key-board button`)]
  if (currentRow == 0 || !matchid) {
    kbEls.forEach(kbEl => kbEl.classList.add('disabled'))
  } else {
    kbEls.forEach(kbEl => kbEl.classList.remove('disabled'))
  }
}
const resetKeyBoard = () => {
  //if moves played is 6 then disable ENTER on keyboard
  const kbEls = [...document.querySelectorAll(`.key-board button`)]
  kbEls.forEach(kbEl => kbEl.classList.remove('used','t1','t2'))
}
const setUsedClass = (word) => {
  //set class for each key to indicate that the key has been used
  const buttons = [...document.querySelectorAll('.key-board  button')]
  const chars = word.split('')
  chars.forEach(ch => {
    const button = buttons.findIndex(e => e.innerText == ch)
    buttons[button].classList.add('used')
  })
}
const setUsedClassNew = (row) => {
  //row passed is an array of 5 div elements with innerText and classList properties
  //set class for each key to indicate that the key has been used
  // const counts={}
  // row.forEach(rowEl=>{
  //   counts[rowEl.innerText]=counts[rowEl.innerText]?0:counts[rowEl.innerText]+1
  // })
  const buttons = [...document.querySelectorAll('.key-board  button')]
  
  row.forEach(rowEl => {
    const button = buttons.findIndex(e => e.innerText == rowEl.innerText)
    if(button>-1){
      if(rowEl.classList.contains('t0')){
        buttons[button].classList.add('used')
      }else if(rowEl.classList.contains('t1') && !buttons[button].classList.contains('t2')){
        buttons[button].classList.add('t1')
      }else if(rowEl.classList.contains('t2')){
        buttons[button].classList.add('t2')
      }
    }
  })
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
export {
  socket,
  updateMatchGrid,
  updateInvitationsList,
  updateactiveGames,
  updatePendingInvitations,
  updatecompletedGames
}
