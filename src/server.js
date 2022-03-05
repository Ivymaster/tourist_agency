const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socketio = require("socket.io"); // uvođenje modula za kreiranje webSocket veze
const { app } = require("./app");
let korisnici = [];
const { generateMessage } = require("./utils/socketPoruke");
const {
  addUser,
  removeUser,
  getUser,
  getAllUsers,
  addMessageToRoom,
  addZaposleniciToUser,
} = require("./utils/socketKorisnici");

// Za izuzetke koji nosu nastali unutar Express aplikacije, proces emituje dogadjaj "unhandledRejection"

process.on("uncaughtException", (err) => {
  console.log("NEUHVACEN IZUZETAK!  Gasenje aplikacije...");
  console.log(err.name, err.message);
  process.exit(1); // Naglo gasenje aplikacije, jer je ista u necistom stanju
});

dotenv.config({ path: "../config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Uspostavljena konekcija sa bazom podataka!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Aplikacija je pokrenuta na portu ${port}...`);
});

// Za odbitke koji nosu nastali unutar Express aplikacije, proces emituje dogadjaj "unhandledRejection"
process.on("unhandledRejection", (err) => {
  console.log("NEUHVACEN ODBITAK!  Gasenje aplikacije...");
  console.log(err.name, err.message);
  // Graciozno gašenje servera, nije naglo gasenje
  server.close(() => {
    process.exit(1);
  });
});

const io = socketio(server, {
  pingTimeout: 100000,
}); //povezivanje socket.io sa serverom

io.on("connection", (socket) => {
  //osluškivanje za prisustvo nove konekcije na Socket.io
  socket.on("join", (statusKorisnika, callback) => {
    let status = "";

    if (statusKorisnika == "ovaj_korisnik_je_admin") {
      status = "zaposlenik";

      io.emit("roomData", {
        rooms: getAllUsers(),
      });
    } else {
      status = "korisnik";
      socket.emit(
        "message",
        generateMessage("Admin", "Dobrodoši, ako imate pitanje tu smo za Vas!")
      );
      socket.join(`${socket.id}-korisnik`);
    }
  });

  socket.on("clientMessage", (message) => {
    // primanje klijentove poruke
    let user = getUser(socket.id);

    if (!user) {
      return;
    }
    //message =  generateMessage(user.status, message)
    addMessageToRoom(socket.id, generateMessage(user.status, message));
    user = getUser(socket.id);
    console.log(user.popisPoruka);

    io.to(`${socket.id}-korisnik`).emit("serverMessage", {
      messages: user.popisPoruka,
    });

    io.emit("newMessageSound", {});
    user.zaposleniciId.forEach((element) => {
      io.to(`${element}-korisnik`).emit("messagesAll", {
        popisPoruka: user.popisPoruka,
      });
    });
  });

  socket.on("zaposlenikMessage", ({ message, id }) => {
    // primanje klijentove poruke
    let user = getUser(id);
    if (!user) {
      return;
    }
    //message =  generateMessage(user.status, message)
    addMessageToRoom(id, generateMessage("zaposlenik", message));
    user = getUser(id);

    io.to(`${id}-korisnik`).emit("serverMessage", {
      messages: user.popisPoruka,
    });
    io.to(`${socket.id}-korisnik`).emit("serverMessage", {
      messages: user.popisPoruka,
    });
  });

  socket.on("startedTyping", (statusKorisnika) => {
    let status;
    if (statusKorisnika == "ovaj_korisnik_je_admin") {
      status = "zaposlenik";
    } else {
      status = "korisnik";
      addUser({ id: socket.id, status });
    }
    io.emit("roomData", {
      rooms: getAllUsers(),
    });
  });

  socket.on("roomSelection", (room) => {
    // primanje klijentove poruke
    let user = getUser(room);
    console.log("TOOOM");

    if (user) {
      addZaposleniciToUser(room, socket.id);
      socket.join(`${socket.id}-korisnik`);

      user = getUser(room);
      console.log(user.popisPoruka);

      io.to(`${socket.id}-korisnik`).emit("messagesAll", {
        popisPoruka: user.popisPoruka,
      });
    }
    console.log("TOOOM");
  });

  socket.on("refresher", () => {
    // događaj pri prekidanju povezanosti

    io.emit("serverRefresher", {
      beat: 1,
    });
  });

  socket.on("disconnect", () => {
    // događaj pri prekidanju povezanosti
    const user = removeUser(socket.id);
    if (user) {
      io.emit("roomData", {
        rooms: getAllUsers(),
      });
    }
  });
});
