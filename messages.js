import { socket,updateMatchGrid,updateInvitationsList,
  updatePendingInvitations,updateactiveGames,updatecompletedGames } from "./script.js"

const MSG_MOVED='MSG_MOVED'
const MSG_OFFERED='MSG_OFFERED'
const MSG_ACCEPTED='MSG_ACCEPTED'

const sendMessageMoved = (playerid,opponentid,matchid)=>{
  let lastTime=0
  const currTime = (new Date()).valueOf()
  if(currTime-lastTime>500){
    socket.emit(MSG_MOVED,{
      playerid,
      opponentid,
      matchid
    }) 
  }
  console.log(`Diff in sendMessageMoved: ${currTime-lastTime}`)
  lastTime=currTime 
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
        
    if(data.playerid == playerid){
      await updateMatchGrid(data.matchid,playerid)
    }
    if(data.playerid == playerid || data.opponentid == playerid)
    await updateactiveGames(playerid)
    await updatecompletedGames(playerid)
  })
  socket.on(MSG_OFFERED,async (data)=>{
    //do something when the message offred is received back
    // console.log(`message offered received: ${JSON.stringify(data)}`)
    if(data.fromplayer == playerid || data.toplayer == playerid){
      await updateInvitationsList(playerid)
      await updatePendingInvitations(playerid)
    }
  })
  socket.on(MSG_ACCEPTED,async (data)=>{
    //do something when the message is received back
    // console.log(`message accepted received by playerid:${playerid}: ${JSON.stringify(data)}`)
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