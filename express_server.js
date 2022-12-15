const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers.js");

const app = express();
const PORT = 8080; // default port 8080

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

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("You are not Logged In");
  }
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
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.send("Please enter valid Email and Password");
  }
  if (getUserByEmail(email, users)) {
    return res.send("User already exists please login");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newID = generateRandomString();
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
  const userUrls = urlsForUser(userID, urlDatabase);
  if (!userUrls[req.params.id]) {
    return res.send("This url does not belong to you");
  }
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
  const userID = req.session.user_id;

  if (!userID) {
    return res.send("You are not Logged In");
  }
  const userUrls = urlsForUser(userID, urlDatabase);
  if (!userUrls[req.params.id]) {
    return res.send("This url does not belong to you");
  }
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide longURL");
  }

  const validURL = longURL.startsWith("http");
  if (!validURL) {
    return res.send("Please provide valid URL that starts with http");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("URL doesn't exist");
  }

  urlDatabase[req.params.id].longURL = longURL;
  res.redirect("/urls");
});

//cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.send("No Email Found");
  }
  const givenPassword = req.body.password;
  const hashedPassword = user.password;

  if (!bcrypt.compareSync(givenPassword, hashedPassword)) {
    return res.send("Password Does Not Match");
  }

  req.session.user_id = user.id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.redirect("/login");
  }
  const user = users[userID];
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
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

  if (!userID) {
    return res.send("You are not Logged In");
  }

  const userUrls = urlsForUser(userID, urlDatabase);
  if (!userUrls[shortUrl]) {
    return res.send("This url does not belong to you");
  }

  const newLongURL = urlDatabase[shortUrl];
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
  if (!urlDatabase[req.params.id]) {
    return res.send("URL does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
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
