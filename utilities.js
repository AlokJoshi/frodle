const md5 = require("md5")
const knex = require('./dbservice')

const utilities = {}

utilities.getImage = (email) => {
  const hash = md5(email.toLowerCase().trim())
  const rnd = Math.random()
  let d = "robohash"
  if(rnd<0.25){
    d="identicon"
  }else if(rnd<0.5){
    d="monsterid"
  }else if(rnd<0.75){
    d="wavatar"
  }else if(rnd<1){
    d = "robohash" 
  }
  return `https://www.gravatar.com/avatar/${hash}?s=30&d=${d}`
}

utilities.updateAllImages = () => {
  knex('fr_players')
    .then(data => {
      try{
        data.forEach(player => {
          //console.log(player.email, player.picture)
          knex(`fr_players`)
          .update('picture',utilities.getImage(player.email))
          .where('email',player.email)
          .catch(err => console.log(`Error in updating the picture`))
        });
      }catch(err){
        console.log(`Error in updating`)
      }
    })
    .catch(err => {
      console.error(`Error in getAllUsers: ${err}`)
    })
}

module.exports = utilities