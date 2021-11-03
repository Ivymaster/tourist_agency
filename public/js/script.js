$(document).ready(function () {
  var nazivDatoteke = location.href.split("/").slice(-1);
  var homeStrelica = $("#home-strelica");
  var homeStrelica2 = $("a.glatki-prijelaz");

  var brojPredanihPonuda = parseInt($("#broj-predanih-ponuda").text());
  var brojPredanihKorisnika = parseInt($("#broj-predanih-korisnika").text());
  var brojPredanihRecenzija = parseInt($("#broj-predanih-recenzija").text());
  var brojPonuda = 0;
  var brojKorisnika = 0;
  var brojRecenzija = 0;

    //Promjena dizajna navigacije u odnosu na polozaj na stranici
  // Zeleni dizajn konstantan za sve stranice osim pocetne
  if (nazivDatoteke != "") {
    $("nav").addClass("green-navbar");
  } else {
    $(window).scroll(() => {
      if ($(window).scrollTop() > 100) {
        $("nav").addClass("green-navbar");
      } else {
        $("nav").removeClass("green-navbar");
      }
    });
  }

  //////////////////Link prikaz trenutne ///////////
  
    var navigacijskiLinkovi = $("ul.nav li");
    for(let i=0; i<navigacijskiLinkovi.length;i++){   
         if($(navigacijskiLinkovi[i]).find('a').attr("value") == nazivDatoteke){
             $(navigacijskiLinkovi[i]).find("a").css("color", "#ECF39E");
        }else{
          $(navigacijskiLinkovi[i]).find("a").css("color", "white");
        }
     }


  ///////////////////////

  // Glatki prijelaz klikom na homeStrelicu, ka about
  homeStrelica.on("click", function (e) {
    e.preventDefault();
    let homeSekcija = $(this).attr("href");
    $("body").animate(
      {
        scrollTop: $(homeSekcija).offset().top-80,
      },
      900
    );
  });

  //Karouseli za top ponude i clanove tima
  $(".prikaz-top-ponuda").owlCarousel({
    loop:true,
    margin:30,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
          items:2,
          nav:true
      },
      700:{
        items:2,
        nav:true
    },
    }
});

 $(".zaposlenici-prikaz").owlCarousel({
  loop:true,
  margin:30,
  responsiveClass:true,
  nav:true,
  responsive:{
      0:{
          items:2,
          nav:true
      }, 
       
  }
});

  //Funkcija za animaciju brojanja podataka
  var brojkeAnimacija = function (ponude, korisnici, recenzije){
    $("#broj-ponuda").html(ponude);
    $("#broj-korisnika").html(korisnici);
    $("#broj-recenzija").html(recenzije);
  }
  window.setInterval(function(){
    if(brojPonuda<=brojPredanihPonuda){
      brojPonuda++;
    }
    if(brojKorisnika<=brojPredanihKorisnika){
      brojKorisnika++;
    }
    if(brojRecenzija<=brojPredanihRecenzija){
      brojRecenzija++;
    }
     brojkeAnimacija(brojPonuda, brojKorisnika, brojRecenzija);
    if(brojPonuda>=brojPredanihPonuda && brojKorisnika>=brojPredanihKorisnika && brojRecenzija>=brojPredanihRecenzija){
      clearInterval() 
    }
  }, 40);

});
 