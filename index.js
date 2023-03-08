/*
1-I can pass a URl as a parameter and i will receive a shortened URL in the JSON response
2-If i pass an invalid URL that doesnt follow the valid http://www.example.com format, the JSON response will contain an error instead
3-When i visit that shortened URL, it will redirect me to my original link
*/

//
Remember to add mongoose and mondb dependencies!!!
Database Connection
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });
//First declare a schema
let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number
})
//creating the URL Model
let Url = mongoose.model('Url', urlSchema)
//getting the URL parameter
let bodyParser = require('body-parser')
let responseObject = {}

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (request, response) => {
  let inputUrl = request.body['url']
  //2
  let urlRegex = new RegExp(/^[http://www.]/gi)

  if (!inputUrl.match(urlRegex)) {
    response.json({ error: 'Invalid URL' })
    return
  }

  responseObject['original_url'] = inputUrl
  //1
  let inputShort = 1

  Url.findOne({})
    .sort({ short: 'desc' })
    .exec((error, result) => {
      if (!error && result != undefined) {
        inputShort = result.short + 1
      }
      if (!error) {
        Url.findOneAndUpdate(
          { original: inputUrl },
          { original: inputUrl, short: inputShort },
          { new: true, upsert: true },
          (error, savedUrl) => {
            if (!error) {
              responseObject['short_url'] = savedUrl.short
              response.json(responseObject)
            }
          }
        )
      }
    })
})
//3
app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input

  Url.findOne({ short: input }, (error, result) => {
    if (!error && result != undefined) {
      response.redirect(result.original)
    } else {
      response.json('URL not found')
    }
  })
})
