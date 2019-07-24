const mongojs = require('mongojs')
const cheerio = require('cheerio')
const axios = require('axios')
const express = require('express')
const exphbs = require('express-handlebars')

const app = express()
let PORT = process.env.PORT || 3000
app.use(express.static("public"))

app.engine("handlebars", exphbs({ defaultLayout: "main"}))
app.set("view engine", "handlebars")

let collections = ["scrapedDate"]

let db = mongojs(process.env.MONGODB_URI || 'scraper', collections)
db.on("error", function (error){
    console.log("Database Error:", error)
})

app.get("/", function(req, res){
    res.render("index")
})

app.get("/scrape", function (req, res){
    db.scrapedData.drop()

    axios
        .get("https://espn.com")
        .then(function (response){
            let $ = cherrio.load(response.data)
            let results = []

            $("article").each(function (i, element){
                let title = $(element)
                    .find("h3")
                    .children("a")
                    .text()
                let link = $(element)
                    .find("h3")
                    .children("a")
                    .attr("href")
                let image = $(element)
                    .find("source")
                    .attr("data-srcset")
                let summary = $(element)
                    .find("p").text()
                
                if(title && link && image && summary) {
                    db.scrapedData.insert({
                        title: title,
                        link: link,
                        image: image,
                        summary: summary
                    },
                    function(err, inserted) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log("scrapedData")
                            console.log(inserted)
                        }
                    })
                }
            })
            console.log(results)
        })
})

app.get("/all", function (req, res) {
    db.scrapedData.find({}, function (err, found){
        if (err) {
            console.log(err)
        } else {
            res.json(found)
        }
    })
})

app.get("/title", function(req, res) {
    db.scrapedData.find().sort({ title:1 }, function(error, found){
        if (error) {
            console.log(error)
        } else {
            res.send(found)
        }
    })
})
app.listen(PORT, function (){
    console.log("App running on port 3000!")
})