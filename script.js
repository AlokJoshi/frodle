let auth0 = null;
let currentRow = 1
let currentCol = 1
//set the picture, nickname and playerid as soon as the player logs in
let picture = ''
let nickname = ''
let playerid = ''
//set the playernum as soon as a match is decided.
let playernum = 0
import {
  getactiveGames, createUserIfNeeded,
  getcompletedGames, getTries, submitTry,
  getUser
} from './data.js'

const updateactiveGames = async (playerid) => {
  const games = await getactiveGames(playerid)
  //console.log(games)
  const activegames = document.getElementById('activegameslist')
  if (activegames.children.lenght > 0) {
    activegames.children.forEach(child => {
      child.remove()
    });
  }

  for (let i = 0; i < games.length; i++) {
    let pn=0
    if(games[i].player1id==playerid){
      pn=1
    }else{
      pn=2
    }
    let el = document.createElement('div')
    el.innerHTML = `Match :${games[i].matchid} vs ${games[i].nickname}`
    el.setAttribute('data-matchid', games[i].matchid)
    el.setAttribute('data-playernum', pn)
    el.classList.add('activegame')
    el.addEventListener('click', async e => {
      // console.log(e.target.dataset.matchid)
      //get the match data
      let matchid = e.target.dataset.matchid
      playernum = e.target.dataset.playernum
      const tries = await getTries(matchid, playerid)
      console.log(JSON.stringify(tries))
      for (let atry = 0; atry < tries.length; atry++) {
        console.log(tries[atry].result)
        console.log(typeof (tries[atry].result))
        let row = document.querySelector(`#row${atry + 1}`)
        let wordArray = tries[atry].try.split('')
        for (let ch = 0; ch < wordArray.length; ch++) {
          //identify the column
          row.childNodes[ch].value = wordArray[ch]
          if (tries[atry].result != null) {
            console.log(tries[atry].result[ch])
            row.childNodes[ch].classList.add(`t${tries[atry].result[ch]}`)
          }
        }
      }
      currentRow = tries.length+1
      updateActiveCell()
    })
    activegames.append(el)
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
    el.innerHTML = `Match :${games[i].matchid} vs ${games[i].nickname}`
    completedgames.append(el)
  }

}

let kb_buttons = document.querySelectorAll('.key-row button')
// console.log(kb_buttons)
kb_buttons = [...kb_buttons]
let row = document.getElementById(`row${currentRow}`)
for (let i = 0; i < kb_buttons.length; i++) {
  let kb_button = kb_buttons[i]
  kb_button.addEventListener('click', (e) => {
    switch (e.target.innerText) {
      case 'ENTER':
        //submit the currentRow and move to the next row
        let guess=''
        for(let ch=0;ch<row.childNodes.length;ch++){
          guess+=row.childNodes[ch].value
        }
        console.log(matchid,playerid,playernum,guess)
        submitTry(matchid,playerid,playernum,guess)
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
  document.getElementById('background').addEventListener('click', () => {
    debugger
    // console.log(`Clicked on background element`)
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })
  document.addEventListener('keydown', (e) => {
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

  playerid = await createUserIfNeeded(user.name, user.nickname)
  nickname = user.nickname
  console.log(JSON.stringify(playerid))
  updateactiveGames(playerid)
  updatecompletedGames(playerid)
  updateActiveCell()

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