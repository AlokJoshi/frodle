let auth0 = null;
import {getactiveGames, createUserIfNeeded, getUser} from './data.js'
const updateactiveGames= async (playerid)=>{
  const games = await getactiveGames(playerid)
  console.log(games)
  const activegames = document.getElementById('activegameslist')
  for(let i = 0;i<games.length;i++){
    let el = document.createElement('div')
    el.innerHTML=`Match :${games[i].matchid} vs ${games[i].nickname}`
    activegames.append(el)
  }
}

window.addEventListener('load', async () => {
  document.getElementById('background').addEventListener('click', () => {
    debugger
    console.log(`Clicked on background element`)
    document.getElementById('backgroundinfo').classList.toggle('hidden')
  })

  
  await configureClient()
  updateUI()
  
  const isAuthenticated = await auth0.isAuthenticated()

  if(isAuthenticated){
    //show the gated content
    return
  }

  //check for code and state parameters
  const query = window.location.search
  if(query.includes("code=") && query.includes("state=")){

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
  console.log(JSON.stringify(auth0.getUser()))
  updateactiveGames(1)
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