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
const urlsForUser = function (userID, urlDatabase) {
  let userUrls = {};
  for (let shortUrl in urlDatabase) {
    const url = urlDatabase[shortUrl];
    if (url.userID === userID) {
      userUrls[shortUrl] = url;
    }
  }
  return userUrls;
};

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };
