const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

const getUserByEmail = (email) => {
  
  for (let userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  
  return false;
};

const validatePassword = (user, givenPassword) => {
  return user.password === givenPassword;
};

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide longURL");
  }

  const validURL = longURL.startsWith("http")
  if (!validURL) {
    return res.send("Please provide valid URL that starts with http");
  }

  const newId = generateRandomString();
  urlDatabase[newId] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${newId}`); // Respond with redirect to newID
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email.length === 0 || password.length === 0) {
    return res.status(400).send("Please enter valid Email and Password");
  };
  if (getUserByEmail(email)) {
    return res.status(400).send("Email Inputted Already");
  }
  users[newID] = {
    id: newID,
    email,
    password,
  };
  res.cookie("user_id", newID);
  res.redirect("/urls");
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//update
app.post('/urls/:id', (req, res) => {
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.send("Please provide longURL");
  }

  const validURL = longURL.startsWith("http")
  if (!validURL) {
    return res.send("Please provide valid URL that starts with http");
  }
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls');
});

//cookie
app.post('/login', (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email);
  const givenPassword = req.body.password;
  if (!user) {
    return res.status(403).send("No Email Found");
  }
  else if (!validatePassword(user, givenPassword)) {
      return res.status(403).send("Password Does Not Match");
    }
  else {
    res.cookie('user_id', user.id);
    return res.redirect('/urls');
}});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id' )
  res.redirect(`/login`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  console.log("userID", userID);
  console.log("user", user);
  const templateVars = { 
    urls: urlDatabase, 
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  // Original Template in M3W6
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
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
