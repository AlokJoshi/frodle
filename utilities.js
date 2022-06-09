const md5 = require("md5")
const knex = require('./dbservice')

const utilities = {}

utilities.getImage = (email) => {
  const hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}?s=30&d=robohash`
}

utilities.updateAllImages = () => {
  knex('fr_players')
    .then(data => {
      try{
        data.forEach(player => {
          if(!player.picture)  {
            knex(`fr_players`)
            .update('picture',utilities.getImage(player.email))
            .then((data)=>console.log(data))
            .catch(err => console.log(`Error in updating the picture`))
          }
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