const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));

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

//delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//update
app.post('/urls/:id', (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  //Use the id from the route parameter to lookup it's associated longURL from the urlDatabase
  // Original Template in M3W6
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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
