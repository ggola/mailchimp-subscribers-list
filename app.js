// jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/signup.html");
});

app.post("/failure", function(req, res){
  res.redirect("/");
});

app.post("/", function(req, res){

  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  // "members" comes from mailchimp
  var data = {
    // members has 2 mandatory fields: email_address and status
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };
  // Mailchimp requires JSON object as body
  var jsonData = JSON.stringify(data);

  var options = {
    url: "https://us4.api.mailchimp.com/3.0/lists/"+process.env.LIST_ID,
    method: "POST",
    // Basic Authorization with npm request: use headers + "Authorization" : "anyUserName APIKEY"
    headers: {
      "Authorization": process.env.MAILCHIMP_USERNAME+" "+process.env.MAILCHIMP_KEY,
    },
    // Post request body
    body: jsonData
  };

  request(options, function(error, response, body){

    if (error) {
      res.send("There was an error in signing up, please try again.");
    } else {
      if (response.statusCode == 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html");
      }
    }
  });

});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server running");
});
