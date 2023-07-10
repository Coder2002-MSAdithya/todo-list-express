const express = require('express')
const mongoose = require('mongoose')
const lodash = require('lodash')

const app = express()
const date = require(__dirname + "/date.js")

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

const port = 3000
const url = "mongodb+srv://adithya_ms:root@cluster0.fucyp0u.mongodb.net/todolistDB"

mongoose.connect(url)

const itemSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemSchema]
}

const Item = mongoose.model("item", itemSchema)
const List = mongoose.model("list", listSchema)

app.get("/", (req, res) => {
    Item.find({})
    .then(items => {
       res.render('list', {listTitle: "Today", listItems: items})
    }).catch(err => console.log(err))
})

app.get("/:customListName", (req, res) => {
    const listName = lodash.capitalize(req.params.customListName)
    List.findOne({name: listName})
    .then(foundList => {
        if(foundList)
        {
           res.render('list', {listTitle: listName, listItems: foundList.items})
        }
        else
        {
            const newList = new List({name: listName, items: []})
            newList.save()
            res.redirect(`/${listName}`)
        }
    })
    .catch(err => console.log(err))
})

app.post("/", (req, res) => {
    const newItemName = req.body.newItem
    const listName = req.body.list
    const newItem = new Item({name: newItemName})
    
    if(listName === "Today")
    {
        newItem.save()
        .then(() => console.log("List successfully saved to default list."))
        .catch(err => console.log(err))
        res.redirect("/")
    }
    else
    {
        List.findOne({name: listName})
        .then(list => {
            list.items.push(newItem)
            list.save().then(() => {
               res.redirect(`/${listName}`)
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }
})

app.post("/delete", (req, res) => {
    const deleteItemId = req.body.checkedItem
    const listName = req.body.listName
    
    if(listName === "Today")
    {
        Item.findByIdAndRemove(deleteItemId)
        .then(() => {
            console.log("Item successfully removed from List")
            res.redirect("/")
        })
        .catch(err => console.log(err))
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}})
        .then(() => {
            console.log("Item successfully deleted from custom list")
            res.redirect(`/${listName}`)
        })
        .catch(err => console.log(err))
    }
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`)
})

module.exports = app