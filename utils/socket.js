const {
    generateMessage,
    generateLocationMessage,
  } = require("./socketPoruke");
  const {
    addUser,
    removeUser,
    getUser,
    getAllUsers,
    getUsersInRoom,
  } = require("./socketKorisnici");
  
  
module.exports = class chatUzivo {

    constructor(io, req) {
        io.on("connection", (socket) => {
            //osluškivanje za prisustvo nove konekcije na Socket.io
          
            socket.on("join", (locString, callback) => {
              addUser(socket.id, req.user.korisnickoIme)
              if(req.user.status=="admin"){

              }
          
              socket.join(req.user.korisnickoIme); //kreiranje sobe, specificirane od strane korisnika
          
              socket.emit("message", generateMessage("Admin", "Welcome!"));
              socket.broadcast
                .to(req.user.korisnickoIme)
                .emit("message", generateMessage("Admin", req.user.korisnickoIme + " joined")); // slanje događaja tipa "broadcast"
              io.to(req.user.korisnickoIme).emit("PodatciSobe", {
                rooms: getAllUsers(),
                users: getUsersInRoom(user.room),
              });
            });
   /*       
            socket.on("clientMessage", (message) => {
              // primanje klijentove poruke
              const user = getUser(socket.id);
              io.to(user.room).emit(
                "serverMessage",
                generateMessage(user.username, message)
              );
              console.log(message);
            });
          
            socket.on("sendLocation", (coords, callback) => {
              // funkcija za primanje događaja slanja pozicije
              const user = getUser(socket.id);
              io.to(user.room).emit(
                "locationMessage",
                generateLocationMessage(
                  user.username,
                  "https://google.com/maps?q=" + coords.latitude + "," + coords.longitude
                )
              ); //Krerianje poveznice sa primljenim podacima
              callback(); // pozivanje callback fje
            });
   */       
            socket.on("disconnect", () => {
              // događaj pri prekidanju povezanosti
              const user = removeUser(socket.id);
              if (user) {
                io.to(user.room).emit(
                  "message",
                  generateMessage("Admin", user.username + " disconnected")
                );
                io.to(user.room).emit("roomData", {
                  room: user.room,
                  users: getUsersInRoom(user.room),
                });
              }
            });
          });
      }
    
} 