import { socket,updateMatchGrid,updateInvitationsList,updateactiveGames } from "./script.js"

const MSG_MOVED='MSG_MOVED'
const MSG_OFFERED='MSG_OFFERED'
const MSG_ACCEPTED='MSG_ACCEPTED'

const sendMessageMoved = (playerid,matchid)=>{
  socket.emit(MSG_MOVED,{
    playerid,
    matchid
  })  
}
const sendMessageOffered = (offerid,fromplayer,toplayer)=>{
  socket.emit(MSG_OFFERED,{
    offerid,
    fromplayer,
    toplayer
  })  
}
const sendMessageAccepted = (offerid,fromplayer,toplayer)=>{
  socket.emit(MSG_OFFERED,{
    offerid,
    fromplayer,
    toplayer
  })  
}
const setUpSocketListeners=(playerid)=>{
  socket.on(MSG_MOVED,(data)=>{
    //do something when the message is received back
    console.log(`message moved ${JSON.stringify(data)}`)
    if(data.playerid == playerid){
      updateMatchGrid()
    }
  })
  socket.on(MSG_OFFERED,(data)=>{
    //do something when the message is received back
    console.log(`message offered ${JSON.stringify(data)}`)
    if(data.toplayer == playerid){
      updateInvitationsList(playerid)
    }
  })
  socket.on(MSG_ACCEPTED,(data)=>{
    //do something when the message is received back
    console.log(`message offered ${JSON.stringify(data)}`)
    if(data.fromplayer == playerid){
      updateactiveGames(playerid)
    }
  })

}
export {
  socket,
  MSG_MOVED,
  MSG_OFFERED,
  MSG_ACCEPTED,
  sendMessageMoved,
  sendMessageOffered,
  sendMessageAccepted,
  setUpSocketListeners
}