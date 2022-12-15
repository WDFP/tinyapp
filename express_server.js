const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const { getUserByEmail } = require("./helpers.js");
const PORT = 8080; // default port 8080

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["MySecretKey"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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

const validatePassword = (user, givenPassword) => {
  return user.password === givenPassword;
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

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide longURL");
  }

  const validURL = longURL.startsWith("http");
  if (!validURL) {
    return res.send("Please provide valid URL that starts with http");
  }

  const userID = req.session.user_id;
  if (!userID) {
    return res.send("Must Be Logged In to use ShortURL");
  }

  const newId = generateRandomString();
  urlDatabase[newId] = {
    longURL,
    userID,
  };
  res.redirect(`/urls/${newId}`); // Respond with redirect to newID
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email.length === 0 || password.length === 0) {
    return res.send("Please enter valid Email and Password");
  }
  if (getUserByEmail(email, users)) {
    return res.send("Email Inputted Already");
  }
  users[newID] = {
    id: newID,
    email,
    password: hashedPassword,
  };
  req.session.user_id = newID;
  res.redirect("/urls");
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const newLongURL = urlDatabase[req.params.id];

  if (!userID) {
    return res.send("You are not Logged In");
  }
  if (!newLongURL) {
    return res.send("URL doesn't exist");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//update
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide longURL");
  }

  const validURL = longURL.startsWith("http");
  if (!validURL) {
    return res.send("Please provide valid URL that starts with http");
  }

  const userID = req.session.user_id;
  const newLongURL = urlDatabase[req.params.id];

  if (!userID) {
    return res.send("You are not Logged In");
  }
  if (!newLongURL) {
    return res.send("URL doesn't exist");
  }

  urlDatabase[req.params.id].longURL = longURL;
  res.redirect("/urls");
});

//cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  const givenPassword = req.body.password;
  const hashedPassword = user.password;
  if (!user) {
    res.send("No Email Found");
  }
  // else if (!validatePassword(user, givenPassword)) {
  //   res.send("Password Does Not Match");
  //   }
  else if (!bcrypt.compareSync(givenPassword, hashedPassword)) {
    res.send("Password Does Not Match");
  } else {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if (!userID) {
    return res.redirect("/login");
  }
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  const userIsLoggedIn = req.session.user_id;
  if (!userIsLoggedIn) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userID = req.session.user_id;
  const newLongURL = urlDatabase[shortUrl];

  if (!userID) {
    return res.send("You are not Logged In");
  }
  if (!newLongURL) {
    return res.send("URL doesn't exist");
  }

  const templateVars = {
    id: shortUrl,
    longURL: newLongURL.longURL,
    user: users[userID],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send("URL does not exist");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userIsLoggedIn = req.session.user_id;
  const templateVars = { user: users[req.session["user_id"]] };
  if (userIsLoggedIn) {
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userIsLoggedIn = req.session.user_id;
  const templateVars = { user: users[req.session["user_id"]] };
  if (userIsLoggedIn) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
