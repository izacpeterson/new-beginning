require("dotenv").config();

let hsApiKey = "";
if (process.env.DEV == "true") {
  hsApiKey = process.env.HS_API_KEY_DEV;
} else {
  hsApiKey = process.env.HS_API_KEY;
}

let alnApiKey = process.env.ALN_API_KEY;

module.exports = { hsApiKey, alnApiKey };
