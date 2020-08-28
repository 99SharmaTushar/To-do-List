
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://Tushar_Sharma:hogakuch@cluster0.saijb.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model( "Item", itemsSchema );

const item1= new Item ({
  name: "Press ➕ button to add new task..."
});

const item2= new Item ({
  name: "⬅Check this to mark this task as completed..."
});

const item3= new Item ({
  name: "Live in the Moment!!🔥"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){

  const day = date.getDate();

  Item.find({},function(err, foundItems){

    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err){
        console.log(err);
      }else{
        console.log("Successfully saved default item to database!!");
         res.redirect("/");
        }
      });
    } else{
        res.render("list", {listType: day,newListItems: foundItems});
        }
 });

});

app.get("/aboutMe",function(req,res){
  res.render("aboutMe");
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  if(customListName!="Createlist" && customListName!="Howtouse")
  {

    List.findOne({name: customListName},function(err,foundList){
      if(!err)
      {
        if(!foundList){//create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }  else{//show an existing list
          res.render("list", {listType: foundList.name,newListItems: foundList.items});
        }
      }
    });
  }else if(customListName=="Howtouse"){
          res.render("howtouse.ejs");
        }
  else{
      res.render("createList");
  }

});

app.post("/newList",function(req,res){
  res.redirect("/"+req.body.listName);
})

app.post("/", function(req,res){
   const itemName = req.body.newItem;
   const listName = req.body.list;
   const dbItem = new Item({
     name: itemName
   });

   const day = date.getDate();
   if(listName==day)
    {
      dbItem.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName},function(err,foundList){
        if(!err){
          foundList.items.push(dbItem);
          foundList.save();
          res.redirect("/"+listName);
        }
      });
    }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  const day = date.getDate();
  if(listName==day)
  {
      Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId} } }, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server has started");
});
