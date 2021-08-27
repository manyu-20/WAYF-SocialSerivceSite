//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
var site = ["contact", "faq", "podcast", "videos", "quotes"];
var blogSite = ["inner happiness", "relationship", "mindfullness", "changeandchallenges", "more"];
var vid = ["happinessandfun", "loveandrelationship", "mindfullness", "changeandchallenges", "more"]
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wayf", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//TODO

//Schema design
///////////////////////////////////////////////////////////////
const quotesSchema = {
  title: String,
  content: String,
  by: String,
};
const Quotes = mongoose.model("Quotes", quotesSchema);

const blogs = {
  id: String,
  title: String,
  content: String,
  category: String,
  by: String,
  date: String
};
const AllBlogs = mongoose.model("AllBlogs", blogs);

const videosSchema = {
  type: String,
  intro: String,
  title: String,
  src: String,
  info: String
};
const Videos = mongoose.model("Videos", videosSchema);



///////////////////////////////////////////////////////////////

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/addQuotes", function(req, res) {
  res.render("addQuotes");
});

app.get("/addBlogs", function(req, res) {
  res.render("addBlogs");
});

app.get("/addVideos", function(req, res) {
  res.render("addVideos");
});

app.get("/deleteBlog", function(req, res) {
  res.render("deleteBlog");
});

app.post("/deleteBlog", function(req, res) {
  let idea = req.body.idea;
  console.log(idea);
  if (req.body.psw != "19CSU004") {
    res.render("failure");
  } else {
    AllBlogs.deleteOne({
      _id: idea
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("success");
      }
    })

  }
});



app.post("/addQuotes", function(req, res) {

  if (req.body.psw != "19CSU004" || !req.body.title === "Open this select menu" || req.body.content === "" || req.body.by === "") {
    res.render("failure");
  } else {
    const newQuote = new Quotes({
      title: req.body.title,
      content: req.body.content,
      by: req.body.by
    });
    newQuote.save();
    res.render("success");
  }
});

app.post("/addBlogs", function(req, res) {

  if (req.body.psw != "19CSU004") {
    res.render("failure");
  } else {
    const newBlog = new AllBlogs({
      id: "99",
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      by: req.body.by,
      date: req.body.date
    });
    newBlog.save();
    res.render("success");
  }
});

app.post("/addVideos", function(req, res) {


  if (req.body.psw != "19CSU004") {
    res.render("failure");
  } else {
    const newVid = new Videos({
      type: req.body.type,
      intro: req.body.intro,
      title: req.body.title,
      src: req.body.src,
      info: req.body.info
    });
    newVid.save();
    res.render("success");
  }
});




app.get("/blogs/:blogType", function(req, res) {







  const blogtype = _.lowerCase(req.params.blogType);
  console.log(blogtype);
  let doc = 0;
  AllBlogs.countDocuments({category:blogtype},function(err,size){
    console.log("size = " + size);
    doc = size;
  })
  let {page,size} = req.query;
  console.log({page,size});
  if(!page){
    page = 1;
  }
  if(!size){
    size = 4;
  }
  let limit = parseInt(size);
  let skip = (page - 1)* size;
  // console.log("total blogs = "+doc);
  if (blogSite.includes(blogtype)) {

    AllBlogs.find({category:blogtype}, function(err, bl) {
      if (err) {
        console.log(err);
      } else {
        // console.log(posts);
        console.log(blogtype);
        console.log(bl.length);
        let blogHeading = blogtype.charAt(0).toUpperCase() + blogtype.slice(1);
        // console.log(bl);
        res.render("blogs", {
          list: bl,
          blogt: blogtype,
          bh: blogHeading,
          size:doc,
        });
      }
    }).sort({_id:-1}).limit(limit).skip(skip);
  } else {
    res.render("nope");
  }

});

app.get("/blog/:blogtype/:blogid", function(req, res) {
  const ind = req.params.blogid;
  const blogType = req.params.blogtype;
  AllBlogs.find({
    _id: ind
  }, function(err, bl) {
    if (err) {
      res.render("nope");
    } else { // console.log(blogType);
      // console.log(ind);
      let blogHeading = blogType.charAt(0).toUpperCase() + blogType.slice(1);
      res.render("customblog", {
        list: bl,
        bt: blogType,
        bh: blogHeading
      });

    }
  })
});

app.get("/videos", function(req, res) {
  res.redirect("/");
})

app.get("/videos/:category", function(req, res) {
  let cat = _.lowerCase(req.params.category);


  if (vid.includes(cat)) {
    Videos.find({}, function(err, videosDic) {
      if (err) {
        console.log(err);
      } else {
        // console.log(posts);
        let catlower = cat;
        cat = cat.charAt(0).toUpperCase() + cat.slice(1);
        console.log(cat);
        console.log(catlower);
        console.log(videosDic);
        res.render("videos", {
          list: videosDic,
          category: cat,
          categorylow: catlower
        });
      }
    }).sort({_id:-1});
  } else {
    res.render("nope");
  }
});

app.get("/:postName", function(req, res) {
  const postName = _.lowerCase(req.params.postName);
  console.log(postName);
  if (postName === "quotes") {
    let {page,size} = req.query;
    console.log({page,size});
    if(!page){
      page = 1;
    }
    if(!size){
      size = 10;
    }
    let limit = parseInt(size);
    let skip = (page - 1)* size;
    // let find = Quotes.find({}).limit(limit).skip(skip);
    // console.log("*******************************************************");
    // console.log(find);
    // console.log("length = "+find.size());
    // console.log("***********************************************************");
    let doc = 10;
    Quotes.count({}, function(error, numOfDocs) {
    console.log('I have '+numOfDocs+' documents in my collection');
    doc = numOfDocs;

});
    Quotes.find({}, function(err, posts) {
      if (err) {
        console.log(err);
      } else {
        // console.log(posts);
        res.render(postName, {
          list: posts,
          total:doc
        });
      }
    }).limit(limit).skip(skip);
  } else if (site.includes(postName)) {
    res.render(postName);
  } else {
    res.render("nope");
  }


});









app.listen(3000, function() {
  console.log("Server started on port 3000");
});
