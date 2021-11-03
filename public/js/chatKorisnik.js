const socket = io(); //povratna vrijednost se čuva u varijabli const
 const autoscroll = () => {
    const newMessage = document.querySelector("#message-board").lastElementChild // dobijanje elmenta poruka

    const newMessageStyles = getComputedStyle(newMessage)// dobijanje CSS  poruka
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)//Dobijanje velicine zadnje margine
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin // dobijanje ukupne visine poruka

    const visibleHeight = document.querySelector("#message-board").offsetHeight// vidljiva visina poruka
    const containerHeight = document.querySelector("#message-board").scrollHeight// velicina cijelog kontenera poruka

    const scrollOffset = document.querySelector("#message-board").scrollTop + visibleHeight//podatak koji pokazuje koliko je skrolovano od pocetka kontenera poruka

         document.querySelector("#message-board").scrollTop = document.querySelector("#message-board").scrollHeight
    

}

function foo() {

   socket.emit("refresher", {
       beat: 1
   })

    setTimeout(foo, 500);
}

foo();
 
socket.on("messagesAll", (messages) => {
    console.log("sdsdsdsdsdsd");
  
    document.querySelector("#message-board").innerHTML = "";
  
    console.log("sdsdsdsdsdsd", messages.popisPoruka);
    for (let i = 0; i < messages.popisPoruka.length; i++) {
      console.log("1213123")
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
socket.on("serverMessage", (messages) => {
    console.log("asdasdas",messages.messages)
    document.querySelector("#message-board").innerHTML = "";

    for(let i = 0; i<messages.messages.length; i++){

        const html = Mustache.render(document.querySelector("#message-template").innerHTML, {// pozivanje predloška, i predavanje podataka
            username: messages.messages[i].username,
            text: messages.messages[i].text,
            createdAt: moment(messages.messages[i].createdAt).format('HH:mm ')
        })
        document.querySelector("#message-board").insertAdjacentHTML('beforeend', html) //stavljanje dobijenog HTML koda unutar elementa
        autoscroll()
    }
    
});

socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(document.querySelector("#message-template").innerHTML, {
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('HH:mm ')
    })
    document.querySelector("#message-board").insertAdjacentHTML('beforeend', html)
    autoscroll()
});

socket.on("serverRefresher", (data) => {
    console.log(data);
});


socket.on("locationMessage", (url) => {
    const html = Mustache.render(document.querySelector("#location-template").innerHTML, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('HH:mm ')
    })
    document.querySelector("#message-board").insertAdjacentHTML('beforeend', html)
    autoscroll()
});

document.querySelector("#submit").addEventListener("click", () => { //uzimanje elemnta sa id="submit"
    console.log(document.querySelector("#message").value); // ispisivanje poprate poruke u konzolu
    socket.emit("clientMessage", document.querySelector("#message").value);// slanje događaja, i sadržaja poruke
    document.querySelector("#message").value = ""; // brisanje sadržaja unesenog u <input> element
    document.querySelector("#message").focus();  //automatsko vraćanje kursora na početak input elementa
})

document.querySelector("#send-location").addEventListener("click", () => {
    console.log("loakcija");
    if (!navigator.geolocation) { // uslov za podržanost geolokacije pretrazitelja
        return alert("Geolokacija nije podrzana");
    }
    navigator.geolocation.getCurrentPosition((position) => { //callback funkcija za dobijanje lokacije, uz potrebnu saglasnost
        socket.emit("sendLocation",
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            () => { // dodavanje callback fje radi potvrđivanja događaja
                console.log("Lokacija poslana");
            })
    });

})




let diconnectTrigger = document.querySelector("#zaposlenikDisconnectOkidac");
if(diconnectTrigger){
    socket.emit("disconnect",  (error) => {
        if (error) {
            alert(error)
            location.href = "/"
        }
    })
}



$('#message').keypress(function() {
    socket.emit("startedTyping", "korisnik", (error) => {
        if (error) {
            alert(error)
            location.href = "/"
        }
    })
});

//let {username, room} = qs.parse(location.search, {ignoreQueryPrefix: true})
socket.emit("join", "korisnik", (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})