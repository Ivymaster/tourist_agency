const nodemailer = require("nodemailer");

//Klasa za slanje mailova, s funkcijama koje definiraju tipove mailova
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.ime;
    this.url = url;
    this.from = `Turist agencija <${process.env.EMAIL_FROM}>`;
    if (user.message) {
      this.message = user.message;
      this.tel = user.tel;
      this.mail = user.email2;
    }
  }

  newTransport() {
    // Sendgrid
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async slanjeDobrodosliceMaila() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Welcome",
      html:
        "<p>Hvala Vam, " +
        this.firstName +
        ", što ste postali korisnik naše turističke aplikacije. Sa nama je putovanje lakse nego ikad! Hvala Vam na ukazanom povjerenju!</p>",
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async slanjeSpecificnogOglasa() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Novi Oglas",
      html:
        '<h1>Oglas samo za vas</h1><br><br><p>Imate novi <b>SPECIFIČNI</b> oglas namijenjen samo Vama na stranici "TURIST", pogledajte ga što brže</p>'+'Link:  ' + this.url,
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async slanjeAgencijskogOglasa() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Agencijski Oglas",
      html:
        '<h1>Agencijski oglas</h1><br><br>' + 
        '<p>Imate novi <b>AGENCIJSKI<b/> oglas  na stranici "TURIST", pogledajte ga što brže</p>' +
        'Link:  ' + this.url,
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async slanjeGeneralnogOglasa() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Novi Oglas",
      html:
        '<h1>Oglas TURIST agencije</h1><br><br><p>Imate novi oglas  na stranici "TURIST", pogledajte ga što brže</p><br>Link:  ' + this.url,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async slanjePriBrisanjuRezervacije() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Obrisana Rezervacija",
      html:
        '<h1>Obrisana rezervacija</h1><br><br><p>Obrisana Vam je rezervacija na stranici "Turist". Za više pitanja'+
        ' kontaktirajte naš ured.</p><br>Link:  ' + this.url,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendFormMail() {
    const mailOptions = {
      from: this.from,
      to: this.from,
      subject: "UPIT",
      html:
        "<p>Pošiljaoc: " +
        this.firstName +
        "</p><br> <p>Message: " +
        this.message +
        "</p><br> <p>Email: " +
        this.mail +
        "</p><br> <p>Tel: " +
        this.tel +
        "</p><br>",
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async slanjeSifraResetMaila() {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Reset Šifre",
      html:
        "<p>Zaboravili ste sifru? Unesite je na sljedecem linku:" +
        this.url +
        ".\n</p>",
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async novaPlacenaRzervacija() {

    const mailOptions = {
      from: this.from,
      to: this.from,
      subject: "Nova plaćena razervacija",
      html:
        `<h1>Nova uplata</h1><br><br><p>Imate novu uplatu od korisnika po imenu "${this.firstName}", email adrese "${this.to}".</p> <br> <p>Link za pregled rezervacija: ${this.url}</p>`,
    };
    await this.newTransport().sendMail(mailOptions);
  }
};
