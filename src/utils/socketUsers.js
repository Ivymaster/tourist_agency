const users = [];

const addUser = ({ id, status }) => {
  if (status != "korisnik") {
    return;
  }

  const existingUser = users.find((user) => {
    return user.id === id;
  });

  if (existingUser) {
    return;
  }

  let personalMessages = [];
  let emplyeeIDs = [];

  const user = { id, status, personalMessages, emplyeeIDs };

  users.push(user);
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getAllUsers = () => {
  return users;
};

const getUser = (id) => {
  return users.find((user) => {
    return user.id === id;
  });
};

const addMessageToRoom = (id, message) => {
  users.find((user) => {
    if (user.id === id) {
      user.popisPoruka.push(message);
      return user.popisPoruka;
    }
  });
};

const addZaposleniciToUser = (id, userId) => {
  console.log(id, userId);
  return users.find((user) => {
    if (user.id === id) {
      user.zaposleniciId.push(userId);
      return user.zaposleniciId;
    }
  });
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getAllUsers,
  addMessageToRoom,
  addZaposleniciToUser,
};
