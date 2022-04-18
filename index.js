const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const lists = require("./routes/api/lists");

const app = express()

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


app.use("/api/users", users);
app.use("/api/lists", lists);

app.get("/", (req, res) => {
  return res.json({
    message: "Hello World"
  })
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:` + PORT);
});