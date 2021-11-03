# tourist_agency

Web aplikacija koja omogućuje rad fiktivne online turističke agencije "E-Turist". Kreirana putem Express razvojnog okvira i NodeJS serverske platforme. Korišteni 
API-i su: SendGrid API(posrednik pri slanju emaila), ZingChart API (za kreiranje grafova), Stripe API (pristup plaćanju - testni način), Google Map API i MapBox API (za 
dobivanje koordinatnih podataka i njihov prikaz). 

Aplikacija nudi administratoru (vlasniku agencije) mogućnost kreiranja i modificiranja ponuda, kreiranja i modificiranja oglasa, statusa registriranih korisnika. Korisnici imaju status "turista" ili "zaposlenika". Administrator je generalizacija zaposlenika, zaposlenik je generalizacija turiste, a turista predstavlja generalizaciju neregistriranog 
korisnika.

Neregistrirani korisnik ima uvid u naslovnu stranicu, uvid u aktivne ponude, generalne oglase, mogućnost komunikacije sa agencijom pomoću email upita ili putem realne "chat" komunikacije. Registriranjem dobija status "turist". Stiče mogućnost rezervacije ponude, modifikaciju iste, uvid u kreirane rezervacije. Dobija pristup svom profilu.

Administrator ima mogućnost mijenjanja statusa registriranom korisniku, čime nastaje korisnik statusa "zaposlenik". Dobija ovlaštenja uvida u rezervacije svih korisnika, mogućnost brisanja istih, ukoliko nisu plaćene. Zaposlenik ima uvid u chat sobu, preko koje odgovara na pitanja turista poslanih putem chat boxa.

Administrator može "zaposliti" i "otpustiti" korisnika, te mijenjati njihovu aktivnost (tj. brisati i vraćati obrisani profil). Dobija mogućnost kreiranja oglasa.
Oglas može biti "generalan", namijenjen svim registriranim korisnicima, "agencijski", namijenjen samo zaposlenicima agencije, te "specifični", namijenjen određenim zaposlenicima
koje selektira administrator. Admin ima uvid u statistiku poslovanja, koja je prikazana grafičkim putem. Zarada je grafirana prema danima, mjesecima i ponudama. Daje se uvid o zaradi i broju prodanih karata. 

Većina prikaza ima mogućnost određene pretrage, da li putem datuma, cijene, ili naziva. Većina akcija je popraćena prigodnim notifikacijama. Korištenjem treće partijskih modula omogućena je sanitizacija podataka.


Datum: 21/11/2020.g.
