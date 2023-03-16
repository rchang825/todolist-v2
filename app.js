//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://rchang825:R9r8SqtLQFTtc7FN@cluster0.7kewmwq.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item ({
  name: "Study on udemy"
});
const item2 = new Item ({
  name: "Practice on leetcode"
});
const item3 = new Item ({
  name: "Make dinner"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);


async function clearAll() {
  try {
    await Item.deleteMany({});
  }
  catch(e) {
    console.log(e);
  } 
}
//clearAll(); 

app.get("/", function(req, res) {
  async function findItems() {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }
  findItems();
});

app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);
  async function checkOrCreateList() {
    const foundList = await List.findOne({name: listName});
    if(foundList) {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    else {
      const list = new List({
      name: listName,
      items: defaultItems
      }); 

      list.save();
      res.redirect("/" + listName);
    }
    

    }
  checkOrCreateList();
});


app.post("/", async (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");    
  } else {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
  }
});

app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    
    console.log("removed successfully");
    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    }
  }
  catch(e) {
    console.log(e);
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
