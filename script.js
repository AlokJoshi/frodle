let auth0 = null;
let currentRow = 1
let currentCol = 1
//set the picture, nickname and playerid as soon as the player logs in
let picture = ''
let nickname = ''
let playerid = 0
//set the playernum as soon as a match is decided.
let playernum = 0
//set the matchid as soon as the match is selected
let matchid
import {
  getactiveGames, createUserIfNeeded,
  getcompletedGames, getTries, submitTry,
  getPlayers, existsWord, getInvitations,getUser
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
  console.log(`Active games:${games}`)
  const activegameslist = document.getElementById('activegameslist')
  if (activegameslist.children.length > 0) {
    activegameslist.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    el.innerHTML = `Match :${games[i].matchid} vs ${games[i].opponent}`
    el.setAttribute('data-matchid', games[i].matchid)
    el.classList.add('activegame')
    el.addEventListener('click', async e => {
      // console.log(e.target.dataset.matchid)
      //get the match data
      document.getElementById('onlyinputs').style="visibility:visible"
      matchid = e.target.dataset.matchid
      const tries = await getTries(matchid, playerid)
      //console.log(JSON.stringify(tries))
      for (let atry = 0; atry < tries.length; atry++) {
        // console.log(tries[atry].result)
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
      currentRow = tries.length+1
      updateActiveCell()
    })
    activegameslist.append(el)
  }

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
    let txt=''
    if(games[i].mytrynumber<games[i].opptrynumber){
      txt=`Match# ${games[i].matchid} You won: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
    }else if(games[i].mytrynumber>games[i].opptrynumber){
      txt=`Match# ${games[i].matchid} You lost: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
    }else{
      txt=`Match# ${games[i].matchid} You drew: ${games[i].mytrynumber} vs ${games[i].opponent}'s ${games[i].opptrynumber}`
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
    el.innerHTML = `${plrs[i].nickname}`
    el.setAttribute('data-playerid',plrs[i].playerid)
    playerslist.append(el)
  }

}
const updateInvitationsList = async(playerid)=>{
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
    el.innerHTML = `${plrs[i].nickname}`
    el.setAttribute('data-playerid',plrs[i].fromplayer)
    invitationslist.append(el)
  }  
}

let kb_buttons = document.querySelectorAll('.key-row button')
// console.log(kb_buttons)
kb_buttons = [...kb_buttons]
for (let i = 0; i < kb_buttons.length; i++) {
  let kb_button = kb_buttons[i]
  kb_button.addEventListener('click', (e) => {
    let row = document.getElementById(`row${currentRow}`)
    switch (e.target.innerText) {
      case 'ENTER':
        //submit the currentRow and move to the next row
        let guess=''
        for(let ch=0;ch<row.childNodes.length;ch++){
          guess+=row.childNodes[ch].value
        }
        console.log(matchid,playerid,guess,currentRow)
        submitTry(matchid,playerid,guess,currentRow)
        break;
      case 'BACK':

        break;
      default:
        //identify the input element for entering the clicked letter
        let input = Array.from(row.childNodes)[currentCol - 1]
        console.log(e.target.innerText)
        input.value = e.target.innerText
        currentCol++
        if(currentCol>5)currentCol=1
        updateActiveCell()
        break;
    }
  })
}
window.addEventListener('load', async () => {
  document.getElementById('btn-login').addEventListener('click',login)
  document.getElementById('btn-logout').addEventListener('click',logout)
  document.getElementById('btn-invite').addEventListener('click',()=>{
    let playerid = document.querySelector('.selectedopponent').dataset.playerid
    let word = document.querySelector('#challengeword').innerText
    console.log(playerid,word)
  })
  document.getElementById('background').addEventListener('click', () => {
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })
  document.getElementById('challengeword').addEventListener('keyup', async e=>{
    console.log(`Challenge word: ${e.target.value}`)
      if(e.target.value.length!=5){
        e.target.classList.add('invalid')
        document.querySelector('#btn-invite').setAttribute('disabled',true)
        return
      }
    let status = await existsWord(e.target.value)
    console.log(`Challenge word exists:${status}`)
    if(status==200){
      e.target.classList.remove('invalid')
      document.querySelector('#btn-invite').removeAttribute('disabled')
    }else{
      e.target.classList.add('invalid')
      document.querySelector('#btn-invite').setAttribute('disabled',true)
    }
  })
  document.getElementById('playerslist').addEventListener('click', e=>{
    let opponentsArray = [...document.querySelectorAll("#playerslist>div")]
    opponentsArray.forEach(element => element.classList.remove('selectedopponent'))
    e.target.classList.add('selectedopponent')  
    document.getElementById("invitationmessage").innerText=`Word for ${e.target.innerText}`
    console.log(e.target)
  });
  document.addEventListener('keydown', (e) => {
    if(e.target==document.getElementById('challengeword')){
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
  if(user){
    console.log(JSON.stringify(user))
    playerid = await createUserIfNeeded(user.name, user.nickname)
    nickname = user.nickname
    // console.log(JSON.stringify(playerid))
    updateactiveGames(playerid)
    updatecompletedGames(playerid)
    updatePlayersList(playerid)
    updateInvitationsList(playerid)
    updateActiveCell()
    document.querySelector('#title span').innerText=`${nickname}'s Murdle`
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