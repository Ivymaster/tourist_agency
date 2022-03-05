/* eslint-disable */

import { showAlert } from './alerts.js';

const socket = io(); //povratna vrijednost se čuva u varijabli const
console.log($("#status-usera").val() == "admin")
if ($("#status-usera").val() == "admin" || $("#status-usera").val() == "zaposlenik") {
  
    socket.on("newMessageSound", () => {
        showAlert("success", "Nova poruka u live chatu");
        /*const a = $( "body" ).html('<audio controls autoplay>'+
        '<source src="https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3" type="audio/ogg">'+
        '</audio> '); */
        $( "#foo" ).on( "click", function() {
          let src = '/audio/alert.mp3';
        let audio = new Audio(src);
        audio.play();
        });
        $( "#foo" ).trigger( "click" );
        
        window.setTimeout(() => { 
          }, 1500);
     });
}