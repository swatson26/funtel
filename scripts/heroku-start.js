// Create new file scripts/heroku-start.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
// Your static pre-build assets folder
app.use(express.static(path.join(__dirname, '..', 'build')));
// Root Redirects to the pre-build assets
app.get('/', function(req,res){
  res.sendFile(path.join(__dirname, '..', 'build'));
});
app.get('*', function(req, res, next) {
  if (!req.url.includes('/api')) {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  } else {
    next();
  }
});
app.listen(port, ()=>{
  console.log("Server is running on port: ", port)
})