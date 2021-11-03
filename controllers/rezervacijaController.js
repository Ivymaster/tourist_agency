const Rezervacija = require('../models/rezervacijaModel');
const Ponuda = require('../models/ponudaModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
 const stripe = require('stripe')('sk_test_51HftM2Hr1ZCotBHuIRN77jUjC4CIr2W6foPrVDo576MOZOgjtaTSGjbEtuohXkfjVRVcPpPppdD8xzJhB4Zo7m8w00GJEjtJ64');
const Korisnik = require('../models/korisnikModel');
const Email = require('./../utils/email');


// Middleware za dobijanje svih, ikada kreiranih, rezervacija. Namjenjeno ADMINU
exports.getSveRezervacije = catchAsync(async (req, res, next) => {
    const rezervacije = await Rezervacija.find().sort([ ['datumKreacije', -1], ["datumPocetkaPonude", -1]]).populate("recenzija");
    let totalnaCijena;
    if(rezervacije.length>0){
      totalnaCijena = rezervacije.map(el=>{
        return el.cijena+el.dodatak;
      })
      totalnaCijena = totalnaCijena.reduce((a, b) => a + b);
    }
       res.status(200).render('rezervacije', {
        rezervacije,
        totalnaCijena,
        status: req.status

    });
  });

// Middleware za dobijanje rezervacija za prijavljenog korisnika, koje nisu statusa "obrisano"
  exports.getMojeRezervacije = catchAsync(async (req, res, next) => {
    const rezervacije = await Rezervacija.find({korisnik: req.user.id}).sort([['datumPocetkaPonude', -1], ["datumKreacije", -1]]).populate("recenzija");
    let totalnaCijena;
    if(rezervacije.length>0){
      totalnaCijena = rezervacije.map(el=>{
        return el.cijena+el.dodatak;
      })
      totalnaCijena = totalnaCijena.reduce((a, b) => a + b);
    }
    res.status(200).render('personalneRezervacije', {
        rezervacije,
        totalnaCijena,
        status: req.status

    });
  });
 
// Middleware za kreiranje STRIPE sesije, koja se preda Front end dijelu aplikacije 
  exports.getProdajnaSesija = catchAsync(async (req, res, next) => {
    let podatci = req.params.podatciKupovine.replace(/<%20>/gi, "");
     podatci = podatci.split("--");
 
    podatci[4] = new Date(podatci[4]).toISOString();
 
    req.params.podatciKupovine = podatci.join("--")
      const ponuda = await Ponuda.findById(podatci[0]);
    // Kreiranje STRIPE sesije
      const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      /*success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        req.params.ponudaId
      }&user=${req.user.id}&price=${ponuda.cijena}`,*/
      success_url: `${req.protocol}://${req.get('host')}/rezervacije/mojeRezervacije`,
      cancel_url: `${req.protocol}://${req.get('host')}/ponude/${ponuda.id}`,
      customer_email: req.user.email,
      client_reference_id: req.params.podatciKupovine,
      line_items: [
        {
          name: `${ponuda.naziv} - Ponuda`,
          description: `${ponuda.dodatakNaCijenu.toString()} € dodatka za jednokrevetne sobe`,
          //images: [`https://https://turist-app-diplomski.herokuapp.com/img/ponude/deafult.jpg`],
          amount: (ponuda.krajnjaCijena + parseInt(podatci[2])) * 100,
          currency: 'eur',
          quantity: parseInt(podatci[1])
        }
      ]
    });
 
    // slanje sesije u odgovoru
    res.status(200).json({
      status: 'success',
      session
    });
  });

// Middleware za parsiranje podataka, provjeru broja slobodnih karata, postavljanja objekta req.body za kreiranje nove rezervacije
exports.podatciZaKreacijuRezervacije = catchAsync(async (req, res, next) => {
  const brojKarata =  parseInt(req.body.brojKarata); 

  let ponuda = await Ponuda.find({_id: req.params.id, status: "aktivno"});
  ponuda = ponuda[0];

  if(!ponuda){
    return next(new AppError('Ponuda je obrisana!',400));
  }
  for(let el in ponuda.pocetniDatumi){ 
    if(new Date(ponuda.pocetniDatumi[el]) > new Date() && new Date(ponuda.pocetniDatumi[el]).toString() == new Date(req.body.datum).toString()){
  
      ponuda.brojSlobodnih[el] = ponuda.brojSlobodnih[el] - brojKarata;
    }
     if(ponuda.brojSlobodnih[el]<0){
      return next(new AppError('Broj karata premašuje ponuđene vrijednosti!',400));
    }
  } 
  if (ponuda.pocetniDatumi[ponuda.pocetniDatumi.length-1] <= new Date()) {
    return next(new AppError('Ponuda je istekla!',400));
  }

  for(let el in ponuda.pocetniDatumi){
      if(new Date(ponuda.pocetniDatumi[el]).toString() === new Date(req.body.datum).toString()){
        break;
      }
      if(el==ponuda.pocetniDatumi.length-1){
        return next(new AppError('Ponuda ne sadrzi odabrani datum!',400));
      }
  }
  // Azuriranje slobodnih mjesta ponude
  await Ponuda.findByIdAndUpdate(ponuda.id, ponuda);

  req.body.ponuda = req.params.id;
  req.body.korisnik = req.user.id;
  req.body.cijena = parseInt(ponuda.krajnjaCijena*req.body.brojKarata+req.body.dodatak);
  req.body.brojKarata = brojKarata;
  req.body.status = "rezervirano"; 
  req.body.datumPocetkaPonude = req.body.datum,
  next();
});

// Middleware za azuriranje slobodnih mjesta, nakon brisanja rezervacije
exports.azuriranjeSlobodnihMjestaPonude = catchAsync( async (req,res,next)=>{
  
  const rezervacija = await Rezervacija.findById(req.params.id);
  if(rezervacija.status=="obrisano"){
    return next(new AppError('Rezervacija je vec obrisana!', 400));
  }
  if(rezervacija.status=="placeno"){
    return next(new AppError('Rezervacija je vec placena, brisanje je onemoguceno!', 400));
  }
  let ponuda = await Ponuda.findById(rezervacija.ponuda.id,);

  for(let el in ponuda.brojSlobodnih){
    if(new Date(rezervacija.datumKreacije) < new Date(ponuda.pocetniDatumi[el])){
      ponuda.brojSlobodnih[el] = ponuda.brojSlobodnih[el] + rezervacija.brojKarata;
      break;
    }
  }
 
  await Ponuda.findByIdAndUpdate(
    rezervacija.ponuda.id, 
    {
      brojSlobodnih: ponuda.brojSlobodnih
    }
  );
  const rezervacijaURL = `${req.protocol}://${req.get(
    'host'
  )}/rezervacije/mojeRezervacije`;

  await new Email(rezervacija.korisnik, rezervacijaURL).slanjePriBrisanjuRezervacije();

  
  next();
});


const kreiranjePlaceneRezervacije = async (session, req) => {
  // Podatci kupovine: ponudaID, beoj karata, dodatak, sobe, datum
 
  const podatci = session.client_reference_id.split("--");
 
  const ponudaID = podatci[0];
  const brojKarata = parseInt(podatci[1]);
  const dodatak = parseInt(podatci[2]);
  const sobe = podatci[3];
  const datum = podatci[4];
  const rezervacijaId = podatci[5];
 
  if(rezervacijaId != "undefined"){
 
    let rezervacija = await Rezervacija.findById(rezervacijaId);
    if(rezervacija){
      await Rezervacija.findByIdAndUpdate(rezervacijaId, {
        status: "placeno",
        datumPlacanja: new Date()
      })
       const noviKorisnik = await Korisnik.findOne({ email: session.customer_email });
       let kontakt = {
        email: noviKorisnik.email,
        ime: noviKorisnik.korisnickoIme
      };
       const novaRezervacijaURL = `${req.protocol}://${req.get(
        'host'
      )}/rezervacije`;
 
      await new Email(kontakt, novaRezervacijaURL).novaPlacenaRzervacija();
           return;
        }
  }
 
 
  let ponuda = await Ponuda.find({_id: ponudaID, status: "aktivno"});
  ponuda = ponuda[0];
 
  const korisnikId = (await Korisnik.findOne({ email: session.customer_email })).id;
  const cijena = session.amount_total / 100;

 
  if(!ponuda){
    //return new AppError('Ponuda je obrisana!',400);
    return;
  }
 
  for(let el in ponuda.pocetniDatumi){
    if(new Date(ponuda.pocetniDatumi[el]) > new Date()){
        ponuda.brojSlobodnih[el] = ponuda.brojSlobodnih[el] - brojKarata;
    }
    if(ponuda.brojSlobodnih[el]<0){
      return;
      //return new AppError('Broj karata premašuje ponuđene vrijednosti!',400);
    }
  }
 
  if (ponuda.pocetniDatumi[ponuda.pocetniDatumi.length-1] <= new Date()) {
    return;
    //return new AppError('Ponuda je istekla!',400);
  }
 
  for(let el in ponuda.pocetniDatumi){
 
      if(new Date(ponuda.pocetniDatumi[el]).toString() === new Date(datum).toString()){
 
        break;
      }
      if(el==ponuda.pocetniDatumi.length-1){
 
        //return new AppError('Ponuda ne sadrzi odabrani datum!',400);
        return;
      }
  }
 
  // Azuriranje slobodnih mjesta ponude
  await Ponuda.findByIdAndUpdate(ponuda.id, ponuda);

 
  const rezervacijaNova = await Rezervacija.create({ 
    brojKarata: brojKarata,
    dodatak: dodatak,
    ponuda: ponudaID,
    korisnik: korisnikId,
    cijena,
    status: "placeno",
    sobe: sobe ,
    datumPlacanja: new Date(),
    datumPocetkaPonude: datum
  });
 
  const noviKorisnik = await Korisnik.findOne({ email: session.customer_email });
 
  let kontakt = {
    email: noviKorisnik.email,
    ime: noviKorisnik.korisnickoIme
  };
 
  const novaRezervacijaURL = `${req.protocol}://${req.get(
    'host'
  )}/rezervacije`;
 
  await new Email(kontakt, novaRezervacijaURL).novaPlacenaRzervacija();
 
  return;
 };

exports.webhookNaplata = (req, res, next) => {
 
  // Cita tip eventa
  const signature = req.headers['stripe-signature'];
 
  let event;
  try {
 
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      "whsec_We20R0rRfYenfqLmklsyGfdV2tAV7hix"
    );
  } catch (err) {
 
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
   if (event.type === 'checkout.session.completed'){

    try {    
 
      kreiranjePlaceneRezervacije(event.data.object, req);


    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }}
  // ODgovore prima sami STRIPE
  res.status(200).json({ received: true });
};

// Middleware za postavljanje novog statusa rezervacije
 exports.podatciZaBrisanjeRezervacije = catchAsync( async (req,res,next)=>{
  const rezervacija = Rezervacija.find({
    id: req.params.id,
    korisnik: req.user.id
  })
  if(!rezervacija && req.user.status!="admin" && req.user.status!="zaposlenik"){
    return next(new AppError("Vama ne pripada ova rezervacija!", 400));
  }
  req.body.status = "obrisano";
 
  next();
 });
 
 // Middleware za postavljanje novog statusa rezervacije
 exports.podatciZaBKreiranje = catchAsync( async (req,res,next)=>{
  req.body.status = "obrisano";
  next();
 });

 exports.getPodatciRezervacije = catchAsync(async (req, res, next) => {
   const pocetniDatum = req.query.datumKreacije.gte;
  const krajnjiDatum = req.query.datumKreacije.lte;
  req.query.sort = "-datumKreacije,-datumPocetkaPonude";
   if(new Date(pocetniDatum) > new Date(krajnjiDatum)){
    return next(
      new AppError(
        'Pogreska pri unosu datuma.',
        400
      )
    );
    }
  req.query.korisnickoIme=undefined;
  req.query.ponuda=undefined;
  if(req.query.query!=""){
    req.query.korisnickoIme = req.query.query;
    req.query.ponuda = req.query.query;
  }else{
    req.query.query = undefined;
    return next();
  }
 
  const korisnik = await Korisnik.findOne({korisnickoIme: req.query.korisnickoIme});
  const ponuda = await Ponuda.findOne({naziv: req.query.ponuda});
  if(!korisnik && !ponuda){
  return next(new AppError('Ne postoji korisnik ili ponuda sa ovim imenom!', 400));
  }
 
  req.query.query = undefined;
  req.query.korisnickoIme=undefined;
   if(korisnik){
     req.query.korisnik = korisnik.id;
    req.query.ponuda=undefined;
  }
   if(ponuda){
    req.query.korisnik=undefined;
    req.query.ponuda = ponuda.id;
  }
    next();
});

exports.getPodatciPersonalneRezervacije = catchAsync(async (req, res, next) => {
    const pocetniDatum = req.query.datumKreacije.gte;
   const krajnjiDatum = req.query.datumKreacije.lte;
   req.query.korisnik = req.user._id;
   req.query.sort = "-datumPocetkaPonude";

    if(new Date(pocetniDatum) > new Date(krajnjiDatum)){
     return next(
       new AppError(
         'Pogreska pri unosu datuma.',
         400
       )
     );
     }
    req.query.ponuda=undefined;
    let ponuda;
   if(req.query.query!=""){
      req.query.ponuda = req.query.query;
      ponuda = await Ponuda.findOne({naziv: req.query.ponuda});

   }else{
     req.query.query = undefined;
     return next();
   }
  
   if(!ponuda){
   return next(new AppError('Ne postoji ponuda sa ovim imenom!', 400));
   }
  
   req.query.query = undefined;
    if(ponuda){
      req.query.ponuda = ponuda.id;
   }
     next();
 });
exports.getVlasnikRezervacije = catchAsync(async (req, res, next) => {
  const korisnik = await Korisnik.find({korisnickoIme: req.query.korisnickoIme});
 
  if(!korisnik){
    return next(new AppError("Ne postoji korisnik sa tim korisnickim imenom!", 400));
  }
   if(korisnik[0].korisnickoIme == req.user.korisnickoIme){
    return res.redirect("/mojProfil");
  }

  return res.redirect("/korisnici?korisnickoIme="+ req.query.korisnickoIme+"");

   
});
exports.getSpecificneRezervacije = factory.getAll(Rezervacija);
exports.kreirajRezervaciju = factory.createOne(Rezervacija);
exports.obrisiRezervaciju = factory.updateOne(Rezervacija);