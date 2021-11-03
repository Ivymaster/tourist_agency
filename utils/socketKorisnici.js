const users = [] // popis svih korisnika

const addUser = ({id, status}) => { // dodavanje korisnika, sa ID, imenom, i nazivom sobe
    
    if (status!="korisnik") { // provjera postojanja istog imena korisnika, u određenoj sobi
        return 
    }

    const existingUser = users.find(user => { // provjera postojanja korisnika, u određenoj sobi
        return user.id === id  
    })

    if (existingUser) { // provjera postojanja istog imena korisnika, u određenoj sobi
        return  
    }
    let popisPoruka = [];
    let zaposleniciId = [];
    const user = { id, status, popisPoruka, zaposleniciId } // kreiranje objekta korisnika
    users.push(user) // dodavanje korisnika u niz svih korisnika
    
}



const removeUser = (id) => { //brisanje korisnika
    const index = users.findIndex((user) => user.id === id)//dobijanje indeksa korisnika sa predanim ID
    console.log(index)
    if (index !== -1) {//ako  je index validan, izbacuje se objekt na toj poziciji
        return users.splice(index, 1)[0]
    }
}

const getAllUsers = () => {

    return users;
}


const getUser = (id) => {

    return users.find((user) => {
        return user.id === id
    })
}

const addMessageToRoom = (id, message) => {

     users.find((user) => {
        if(user.id === id){
            user.popisPoruka.push(message)
            return user.popisPoruka;
        }
    })
 }

 const addZaposleniciToUser = (id, userId) => {
    console.log(id,userId)
    return users.find((user) => {
       if(user.id === id){
           user.zaposleniciId.push(userId)
           return user.zaposleniciId;
       }
   })
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllUsers,
    addMessageToRoom,
    addZaposleniciToUser
}