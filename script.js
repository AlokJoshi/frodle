let auth0 = null;
let currentRow = 1
let currentCol = 1
let nickname=''
let userid=''
let picture=''
import { getactiveGames, createUserIfNeeded, getcompletedGames, getUser } from './data.js'

const updateactiveGames = async (playerid) => {
  const games = await getactiveGames(playerid)
  //console.log(games)
  const activegames = document.getElementById('activegameslist')

  activegames.children.forEach(child => {
    child.remove()
  });

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    el.innerHTML = `Match :${games[i].matchid} vs ${games[i].nickname}`
    activegames.append(el)
  }

}

const updatecompletedGames = async (playerid) => {
  const games = await getcompletedGames(playerid)
  //console.log(games)
  const completedgames = document.getElementById('completedgameslist')

  completedgames.children.forEach(child => {
    child.remove()
  });

  for (let i = 0; i < games.length; i++) {
    let el = document.createElement('div')
    el.innerHTML = `Match :${games[i].matchid} vs ${games[i].nickname}`
    completedgames.append(el)
  }

}

let kb_buttons = document.querySelectorAll('.key-row button')
console.log(kb_buttons)
kb_buttons = [...kb_buttons]
for (let i = 0; i < kb_buttons.length; i++) {
  let kb_button = kb_buttons[i]
  kb_button.addEventListener('click', (e) => {
    switch (e.target.innerText) {
      case 'ENTER':

        break;
      case 'BACK':

        break;
      default:
        //identify the input element for entering the clicked letter
        let row = document.getElementById(`row${currentRow}`)
        let input = Array.from(row.childNodes)[currentCol-1]
        console.log(e.target.innerText)
        input.value=e.target.innerText
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
    console.log(e.key)
    switch (e.key) {
      case 'ArrowRight':
        if(currentCol++>5) currentCol=1
        updateUI()
        break;
      case 'ArrowLeft':
        if(currentCol--==0) currentCol=5
        updateUI()
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

  let userid = await createUserIfNeeded(user.name,user.nickname)
  console.log(JSON.stringify(userid))
  updateactiveGames(userid)
  updatecompletedGames(userid)

  //remove the active class from all the tiles
  let tiles = document.querySelectorAll('.tile')
  tiles.forEach(tile=>tile.classList.remove('active'))


  //here we should set the currentRow and currentCol after the user
  //clicks or otherwise starts a new game
  let row = document.getElementById(`row${currentRow}`)
  let input = Array.from(row.childNodes)[currentCol-1]

  input.classList.toggle('active')
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