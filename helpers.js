const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "a",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (email, users) => {
  for (let userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }

  return false;
};

module.exports = { getUserByEmail };
