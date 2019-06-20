var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

//Scraping packages
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("/models");

var PORT = process.env.PORT || 3000;

var app = express();

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoscrapedb";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function(req, res) {
  db.Article.find()
    .then(function(dbResult) {
      var data = { result: dbResult };
      res.render("index", data);
    })
    .catch(function(error) {
      console.log(error);
    });
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/section/sports").then(function(response) {
    var $ = cheerio.load(response.data);

    $("div.css-10wtrbd").each(function(i, element) {
      var results = {};

      results.title = $(element)
        .children("h2")
        .children("a")
        .text();
      results.link =
        "https://www.nytimes.com" +
        $(element)
          .children("h2")
          .children("a")
          .attr("href");
      results.content = $(element)
        .children("p")
        .text();
      results.author = $(element)
        .children()
        .last()
        .children(".css-9voj2j")
        .children("span")
        .text();
      mongoose.connection.db.dropDatabase();

      db.Article.create(results)
        .then(function() {
          res.redirect("/");
        })
        .catch(function(error) {
          console.log(error);
        });
    });
  });
});
app.get("/saved/articles", function(req, res) {
  db.SavedArticle.find().then(function(dbResult) {
    var data = { result: dbResult };
    res.render("savedarticles", data);
  });
});

app.get("/save/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id }).then(function(result) {
    var saved = {
      title: result.title,
      link: result.link,
      content: result.content,
      author: result.author
    };
    db.SavedArticle.create(saved)
      .then(function() {
        db.Article.findOneAndRemove(req.params.id)
          .then(function() {
            res.redirect("/");
          })
          .catch(function(err) {
            console.log(err);
          });
      })
      .catch(function(error) {
        res.send(error);
      });
  });
});
app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
