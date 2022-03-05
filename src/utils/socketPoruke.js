const generateMessage = (username, text) => { // funkcija koja vraća objekt sa navedenim atributima
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {// funkcija koja vraća objekt sa navedenim atributima, za poruku o lokaciji
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = { // obje funkcije su dostupne kreiranjem objekta
    generateMessage,
    generateLocationMessage
}