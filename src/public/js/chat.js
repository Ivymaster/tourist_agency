const socket = io(); //povratna vrijednost se čuva u varijabli const

const autoscroll = () => {
  console.log("pocetak");
  const newMessage = document.querySelector("#message-board").lastElementChild; // dobijanje elmenta poruka
  console.log("pocetak");

  const newMessageStyles = getComputedStyle(newMessage); // dobijanje CSS  poruka
  const newMessageMargin = parseInt(newMessageStyles.marginBottom); //Dobijanje velicine zadnje margine
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin; // dobijanje ukupne visine poruka
  console.log("pocetak");

  const visibleHeight = document.querySelector("#message-board").offsetHeight; // vidljiva visina poruka
  const containerHeight = document.querySelector("#message-board").scrollHeight; // velicina cijelog kontenera poruka
  console.log("pocetak", containerHeight, visibleHeight);

  const scrollOffset =
    document.querySelector("#message-board").scrollTop + visibleHeight; //podatak koji pokazuje koliko je skrolovano od pocetka kontenera poruka
  console.log(scrollOffset);

  // ukoliko je pozicija bliza dnu, desit ce se automatsko scrollovanje
  document.querySelector("#message-board").scrollTop = document.querySelector(
    "#message-board"
  ).scrollHeight;
};

function foo() {

  socket.emit("refresher", {
    beat: 1,
  })

   setTimeout(foo, 500);
}

foo();

socket.on("serverMessage", (messages) => {
  document.querySelector("#message-board").innerHTML = "";

  for (let i = 0; i < messages.messages.length; i++) {
    const html = Mustache.render(
      document.querySelector("#message-template").innerHTML,
      {
        // pozivanje predloška, i predavanje podataka
        username: messages.messages[i].username,
        text: messages.messages[i].text,
        createdAt: moment(messages.messages[i].createdAt).format("HH:mm "),
      }
    );
    document
      .querySelector("#message-board")
      .insertAdjacentHTML("beforeend", html); //stavljanje dobijenog HTML koda unutar elementa
    autoscroll();
  }
});

socket.on("serverRefresher", (data) => {
  console.log(data);

});
socket.on("message", (message) => {
  const html = Mustache.render(
    document.querySelector("#message-template").innerHTML,
    {
      username: message.username,
      text: message.text,
      createdAt: moment(message.createdAt).format("HH:mm "),
    }
  );
  document
    .querySelector("#message-board")
    .insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("messagesAll", (messages) => {
  document.querySelector("#message-board").innerHTML = "";

  for (let i = 0; i < messages.popisPoruka.length; i++) {
    const html = Mustache.render(
      document.querySelector("#message-template").innerHTML,
      {
        username: messages.popisPoruka[i].username,
        text: messages.popisPoruka[i].text,
        createdAt: moment(messages.popisPoruka[i].createdAt).format("HH:mm "),
      }
    );
    document
      .querySelector("#message-board")
      .insertAdjacentHTML("beforeend", html);
    autoscroll();
  }
});

socket.on("roomData", ({ rooms }) => {
  document.querySelector("#sidebar").innerHTML = "";
  const html = Mustache.render(
    document.querySelector("#sidebar-template").innerHTML,
    {
      rooms,
      createdAt: moment(message.createdAt).format("HH:mm "),
    }
  );
  document.querySelector("#sidebar").insertAdjacentHTML("beforeend", html);
  const liveChatKorisnici = $(".liveChatKorisnici");

  if (liveChatKorisnici)
    liveChatKorisnici.on("click", (e) => {
      e.preventDefault();
      const id = e.currentTarget.value;
      $("#socket-id").data("socketId", id);
      $("#socket-id").html(`<h3>${id}</h3>`);
      socket.emit("roomSelection", id, (error) => {
        if (error) {
          alert(error);
          location.href = "/";
        }
      });
    });
});

document.querySelector("#submit").addEventListener("click", () => {
  //uzimanje elemnta sa id="submit"
  socket.emit("zaposlenikMessage", {
    message: document.querySelector("#message").value,
    id: $("#socket-id").data("socketId"),
  }); // slanje događaja, i sadržaja poruke
  document.querySelector("#message").value = ""; // brisanje sadržaja unesenog u <input> element
  document.querySelector("#message").focus(); //automatsko vraćanje kursora na početak input elementa
});

/*document.querySelector("#send-location").addEventListener("click", () => {
  console.log("loakcija");
  if (!navigator.geolocation) {
    // uslov za podržanost geolokacije pretrazitelja
    return alert("Geolokacija nije podrzana");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    //callback funkcija za dobijanje lokacije, uz potrebnu saglasnost
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        // dodavanje callback fje radi potvrđivanja događaja
        console.log("Lokacija poslana");
      }
    );
  });
});*/

//let {username, room} = qs.parse(location.search, {ignoreQueryPrefix: true})
socket.emit("join", "ovaj_korisnik_je_admin", (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
