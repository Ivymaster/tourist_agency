const multer = require('multer');
const sharp = require('sharp');
const Korisnik = require('../models/korisnikModel');
const Ponuda = require('../models/ponudaModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Recenzija = require('../models/recenzijaModel');
const Rezervacija = require('../models/rezervacijaModel');

// cuvanje predane datoteke u obliku bitnog zapisa, ne direktno u direktorij
const multerStorage = multer.memoryStorage();

// Filter za odbacivanje datoteka koje nisu tipa "image", kao što su pdf, word.....
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Dopustene su samo slike.', 400), false);
  }
};

// kreiranje funkcije modula multer, preko kojeg je definiran nacina spremanja, i filtracija, predanih datoteka
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// Middleware za omogucavanje fajlova predanih putem forme
exports.ucitavanjeSlikePonude = upload.fields([
  { name: 'pocetnaSlika', maxCount: 1 },
  { name: 'slike' }
]);


// Middleware za redimenzionisanje predanih slika, kreiranje imena datoteka i spremanje istih u direktorij
// Predavanje imena slika req objektu, radi spremanja oznaka u bazu ponuda
exports.redimenzionisanjeSlikaPonude = catchAsync(async (req, res, next) => {

  if (req.files.pocetnaSlika){
      // proces za glavnu sliku, kreiranje imena na osnovu ID ponude, i datuma
    req.body.pocetnaSlika = `tour-${req.params.id}-${Date.now()}-pocetnaSlika.jpeg`;
    await sharp(req.files.pocetnaSlika[0].buffer)
      .toFormat('jpeg')
      .resize(545, 360)
      .jpeg({ quality: 100 })
      .toFile(`public/img/ponude/${req.body.pocetnaSlika}`);
  }

  if(req.files.slike){
    // proces za sporedne sliku, kreiranje imena na osnovu ID ponude, i datuma
    req.body.slike = [];
    await Promise.all(
    req.files.slike.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .toFormat('jpeg')
        .resize(545, 360)
        .jpeg({ quality: 90 })
        .toFile(`public/img/ponude/${filename}`);

      req.body.slike.push(filename);
    })
    );
  }
  
   next();
});


exports.ponudaForma = catchAsync(async (req, res, next) => {
    
  const vodici = await Korisnik.find({uloga:'zaposlenik'});
  res.status(200).render('kreiranjePonudeForma', {
    vodici,
    status: req.status

  });
});

// Middleware za izmjenu ponude, uz parsiranje postojecih ponuda i predavanja istih formi za izmjenu 
exports.izmjenaPonudeForma = catchAsync(async (req, res, next) => {
 
   const ponuda = await Ponuda.findById(req.params.id);
  let vodici = await Korisnik.find({uloga: "zaposlenik"});

   //Izbacivanje trenutnih vodica, iz popisa svih vodica
  let slobodniVodici = [];
  
  if(ponuda.vodici.length == 0){
    slobodniVodici = vodici;
  }else{
    for(let i=0;i<vodici.length;i++){
      for(let j=0;j<ponuda.vodici.length;j++){  
        if(vodici[i].id==ponuda.vodici[j].id){
          continue;
        }
        if(j==ponuda.vodici.length-1){
           slobodniVodici.push(vodici[i])
        }
      }
    }
  }
 
  //Dobijanje yyyy-mm-dd iz Date zapisa
   let datumi = ponuda.pocetniDatumi.map(e => {
    return e.toISOString().split("T")[0].replace(/-/g,"/")
  });
  datumi = datumi.join(", ");

  let lokacije = [];
  lokacije[ponuda.lokacije[0].dan-1] = ponuda.lokacije[0].adresa;

  for(let i = 1; i<ponuda.lokacije.length;i++){
    lokacije[ponuda.lokacije[i].dan-1] = lokacije[ponuda.lokacije[i].dan-1] + "," + ponuda.lokacije[i].adresa;
   }
   
   lokacije = lokacije.map(el=>{
     return el.replace("undefined,","");
   });

    res.status(200).render('izmjenaPonudeForma', {
    ponuda,
    duljinaKljucnihRijeci: ponuda.kljucneRijeci.length-1,
    datumi,
    lokacije,
    slobodniVodici,
    status: req.status

  });
});

// Middleware za prikaz ponude, uz predavanje parsiranih podataka lokacija, radi Mapbox API-ja
exports.getJednuPonudu = catchAsync(async (req, res, next) => {
   const ponuda = await Ponuda.findById(req.params.id).populate("recenzije");
   let ocjene = await Recenzija.aggregate([
     {
       $match:{
         ponuda: ponuda._id
       }
     },
     {
      $group: {
        _id: '$ocjena',
        procenatRecenzija: { $sum: 1 },
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
   ]);
   ocjene = ocjene.map(el=>{
      el.procenatRecenzija = el.procenatRecenzija*100/ponuda.brojRecenzija;
      return el;
   })
 
    for(let i=1; i<=5; i++){
       let ocjena = {
       _id: i,
       procenatRecenzija: 0
     };
     if(!ocjene[i-1]){
      ocjene[i-1] = ocjena; 
      continue;
     }
     if(ocjene[i-1]._id == i) continue;
     ocjene.splice(i-1,0,ocjena);
   
   }
   ocjene = ocjene.map(el=>{
     return el.procenatRecenzija;
 })
      res.status(200).render('prikazJednePonude', {
    ponuda,
    mapBoxPodatci: JSON.stringify(ponuda.lokacije),
    ocjene,
    status: req.status
  });
});


exports.getSvePonude = catchAsync(async (req, res, next) => {
  let filter = {
    status: "aktivno",
  };
   if(req.status != "turist" && req.status!="none"){
    filter = undefined
 
  }
  let ponude = await Ponuda.find(filter);

  if(req.status == "turist" || req.status=="none"){
    ponude = ponude.filter((el)=>{
      if(new Date(el.pocetniDatumi[el.pocetniDatumi.length-1]) > new Date()){
        return el;
      }
    })
  }
  
   res.status(200).render('ponude', {
    ponude,
    status: req.status
  });
});



exports.getPodudarnePonude = catchAsync(async (req, res, next) => {
    let ponudaPoNazivu = await Ponuda.find({
      naziv: req.query.query.trim()
    });
    if(ponudaPoNazivu[0]){
      return res.status(200).json({
        status: 'success',
        data: {
          data: ponudaPoNazivu
        }
      });
    }
    req.query.query = req.query.query.trim().toLowerCase().split(" ");
    let status = ["aktivno"];
     if(req.status == "admin" || req.status=="zaposlenik"){
      status = ["aktivno", "obrisano"]
    }
     let { 
      pocetnaCijena, 
      krajnjaCijena, 
      pocetniDatum, 
      krajnjiDatum, 
      query
    } = req.query;
    let datumKreacije = new Date("1990-12-21T23:00:00.000+00:00");
     var regex = query.map( function( val ){ 
      return new RegExp( '^'+val.substr(0,3)+'','i' ); 
  });      

  
  if(parseInt(pocetnaCijena) > parseInt(krajnjaCijena)){
    return next(
    new AppError(
      'Pogreska pri unosu cijene.',
      400
    )
  );
  }
  if(new Date(pocetniDatum) > new Date(krajnjiDatum)){
  return next(
    new AppError(
      'Pogreska pri unosu datuma.',
      400
    )
  );
  }
  if(req.status == "turist" || req.status=="none"){
    datumKreacije = new Date();
  }
 const ponude = await Ponuda.aggregate([
  {
    $match: {
      
      krajnjaCijena : {
        $gte: parseInt(pocetnaCijena), 
        $lte: parseInt(krajnjaCijena)
      },
      pocetniDatumi : {
        $gte: new Date(pocetniDatum), 
        $lte: new Date(krajnjiDatum)
      },
      status : {
        $in : status
      },
      datumKreacije: {
        $gte: datumKreacije
      }
      
      
  },
},
{
  $unwind: "$kljucneRijeci"
},
{
  $match: {
    kljucneRijeci: {
      $in: regex
    }
  }
},
{
  $group: {
    _id:  '$_id' ,
    naziv: {$first: "$naziv"},
    pocetniDatumi: {$first: "$pocetniDatumi"},
    opis: {$first: "$opis"},
    krajnjaCijena: {$first: "$krajnjaCijena"},
    duracija: {$first: "$duracija"},
    brojSlobodnih: {$first: "$brojSlobodnih"},
    pocetnaSlika: {$first: "$pocetnaSlika"},
    status: {$first: "$status"},
    
  },
},
{
  $sort:{
    datumKreacije: -1
  }
}

]);
 
  res.status(200).json({
    status: 'success',
    data: {
      data: ponude
    }
  });
});

exports.parsiranjeNovePonude = catchAsync(async (req, res, next) => {
    let {
    naziv, 
    duracija, 
    velicinaGrupe, 
    cijena, 
    dodatak,
    opis, 
    datumi, 
    lokacije, 
    adreseLokacija,
    vodici,
    kljucneRijeci
  } = req.body;
   let finalneLokacije = [];
  // Parsiranje dobivenih JSON podataka iz forme
  naziv = naziv.trim();
  datumi = JSON.parse(datumi);   
  vodici = JSON.parse(vodici);   
  kljucneRijeci = JSON.parse(kljucneRijeci); 
  console.log(kljucneRijeci)
   opis = opis.split("br>"); 
  datumi = datumi.map(element => {
    return new Date(element.trim());
  }); 
  lokacije = JSON.parse(lokacije);
  adreseLokacija = JSON.parse(adreseLokacija);
   lokacije = lokacije.slice(1); 
  let count = 0;
   for(let i = 0; i< adreseLokacija.length; i++){
    parserAdresa = adreseLokacija[i].split(",");
    for(let j=0; j<parserAdresa.length;j++){
      finalneLokacije.push({
        coordinates: [ parseFloat(lokacije[count].split(",")[0].trim()),parseFloat(lokacije[count].split(",")[1].trim())],
        adresa: parserAdresa[j],
        dan: i+1,
        redniBroj:count+1
      });
      count++;
    }
  }
  let pocetnaLokacija = {
    coordinates: finalneLokacije[0].coordinates,
    adresa: finalneLokacije[0].adresa,
    dan: finalneLokacije[0].dan,
    redniBroj: finalneLokacije[0].redniBroj,
    type: "Point"
  }
  let dodatakKljucnimRijecima = naziv.toLowerCase().split(" ");
 
  kljucneRijeci = kljucneRijeci.concat(dodatakKljucnimRijecima);
   let set_1 = new Set(kljucneRijeci);
  let kljucneRijeci2 = [...set_1];
 
 

  let brojSlobodnih = datumi.map((el)=>{
    return velicinaGrupe;
  })
  ///////////////////////////////////////////////////
  req.body = {
  naziv,
  duracija,
  velicinaGrupe,
  brojSlobodnih,
  pocetnaCijena: cijena,
  krajnjaCijena: cijena,
  dodatakNaCijenu: dodatak,
  opis,
  pocetniDatumi: datumi,
  pocetnaLokacija,
  lokacije: finalneLokacije,
  vodici,
  pocetnaSlika:req.body.pocetnaSlika,
  slike:req.body.slike,
  kljucneRijeci: kljucneRijeci2
  };

  if(req.body.pocetnaSlika == "undefined"){
  delete req.body.pocetnaSlika; 
  }
  if(req.body.slike == null){
  delete req.body.slike; 
  }
  next();
});

exports.parsiranjePonudeZaIzmjenu = catchAsync(async (req, res, next) => {
  let queringDate = "";
  const ponuda = await Ponuda.findById(req.params.id);
  for(let el in ponuda.pocetniDatumi){
    if(new Date(ponuda.pocetniDatumi[el]) > new Date()){
      if(el > 0){
        queringDate = ponuda.pocetniDatumi[el-1];
      }else{
        queringDate = undefined;       
      } 
      break;
    }
  }
  const rezervacijePonude = await Rezervacija.aggregate([
    {
      $match: {
        //id: req.params.id,
        status: {
          $ne: "placeno"
        },
        datumKreacije: {
           $gt: queringDate
        }
      },
    },
    {
      $sort: {
        datumKreacije: 1
      }
    }
  ]);

  for(let el in req.body.pocetniDatumi){
    if(new Date(req.body.pocetniDatumi[el]) >= new Date(queringDate)){
        for(let el2 in rezervacijePonude){
          if(new Date(rezervacijePonude[el2].datumKreacije) < new Date(req.body.pocetniDatumi[el])){
            req.body.brojSlobodnih[el] = req.body.brojSlobodnih[el] - 1;
          }
        }
    }
  }
 
  for(let el of req.body.brojSlobodnih){
    if(el<0){
      return next(new AppError("Broj novih mjesta je manji od broja novih rezervacija!", 400));
    }
  }

  next();
});


exports.parsiranjePonudeZaVracanje = catchAsync(async (req, res, next) => {
  
  req.body.status = "aktivno"
  next();
});
exports.kreiranjePodatakaZaBrisanje = catchAsync(async (req, res, next) => {
  req.body.status = "obrisano";
  next();
});

exports.kreiranjePonude = factory.createOne(Ponuda);
exports.izmjenaPonude = factory.updateOne(Ponuda);
exports.updatePonudu = factory.updateOne(Ponuda);

 