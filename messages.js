import { socket,updateMatchGrid,updateInvitationsList,
  updatePendingInvitations,updateactiveGames } from "./script.js"

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
  socket.emit(MSG_ACCEPTED,{
    offerid,
    fromplayer,
    toplayer
  })  
}
const setUpSocketListeners=(playerid)=>{
  socket.on(MSG_MOVED,async (data)=>{
    //do something when the message is received back
    console.log(`message moved ${JSON.stringify(data)}`)
    if(data.playerid == playerid){
      await updateMatchGrid()
    }
  })
  socket.on(MSG_OFFERED,async (data)=>{
    //do something when the message offred is received back
    console.log(`message offered received: ${JSON.stringify(data)}`)
    if(data.fromplayer == playerid || data.toplayer == playerid){
      await updateInvitationsList(playerid)
      await updatePendingInvitations(playerid)
    }
  })
  socket.on(MSG_ACCEPTED,async (data)=>{
    //do something when the message is received back
    console.log(`message accepted received: ${JSON.stringify(data)}`)
    if(data.fromplayer == playerid || data.toplayer == playerid){
      await updateInvitationsList(playerid)
      await updatePendingInvitations(playerid)
      await updateactiveGames(playerid)
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