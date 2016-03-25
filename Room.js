// @flow

class Room {
  destroy: Function;
  constructor(room : string, io : any){
    var number = 0;
    const timer=setInterval((()=>io.to(room).emit('update', {
      room: room,
      value: number++})), 1000);
    this.destroy = ()=> clearInterval(timer);
  }
  
}

export default Room;