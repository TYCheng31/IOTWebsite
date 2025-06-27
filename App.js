const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const DoorModel = mongoose.model('doorstate', {
  doornumber: Number,
  doorstate: Number,
  timestamp: { type: Date, default: Date.now },
});

const THModel1 = mongoose.model('t&h1', {
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const THModel2 = mongoose.model('t&h2', {
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

const THModel3 = mongoose.model('t&h3', {
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

mongoose.connect('mongodb://localhost:27017/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/data/thdata1', async (req, res) => {
  try {
    const data = await THModel1.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('fetch thdata1 error:', error);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/data/thdata2', async (req, res) => {
  try {
    const data = await THModel2.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('fetch thdata2 error:', error);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/data/thdata3', async (req, res) => {
  try {
    const data = await THModel3.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('fetch thdata3 error:', error);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/data/doordata', async (req, res) => {
  try {
    const data = await DoorModel.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('fetch doordata error:', error);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/data/thdata1', async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const exampleData = new THModel1({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
    });
    await exampleData.save();
    console.log('T&H1 data saved to MongoDB');
    res.status(200).send('T&H1 data saved to MongoDB');
  } catch (error) {
    console.error('T&H1 data saved to MongoDB error', error);
    res.status(500).send('T&H1 data saved to MongoDB error');
  }
});

app.post('/data/thdata2', async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const exampleData = new THModel2({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
    });
    await exampleData.save();
    console.log('T&H2 data saved to MongoDB');
    res.status(200).send('T&H2 data saved to MongoDB');
  } catch (error) {
    console.error('T&H2 data saved to MongoDB error', error);
    res.status(500).send('T&H2 data saved to MongoDB error');
  }
});

app.post('/data/thdata3', async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const exampleData = new THModel3({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
    });
    await exampleData.save();
    console.log('T&H3 data saved to MongoDB');
    res.status(200).send('T&H3 data saved to MongoDB');
  } catch (error) {
    console.error('T&H3 data saved to MongoDB error', error);
    res.status(500).send('T&H3 data saved to MongoDB error');
  }
});

app.post('/data/doordata', async (req, res) => {
  try {
    const { doornumber, doorstate } = req.body;
    const exampleData = new DoorModel({
      doornumber: parseFloat(doornumber),
      doorstate: parseFloat(doorstate),
    });
    await exampleData.save();
    console.log('doorstate data saved to MongoDB');
    res.status(200).send('doorstate data saved to MongoDB');
  } catch (error) {
    console.error('doorstate data saved to MongoDB error:', error);
    res.status(500).send('doorstate data saved to MongoDB error');
  }
});


//LineNotify
app.post('/send-line-notify', (req, res) => {
  //const accessToken = "iOloY2SOAn2PWJqhJ43YQuXFJ7vcp7HVB2YWB6SjQpX";//個人權杖
  const accessToken = "lQH4uePpXErUla1mxcNo64OrzW0BWHzaCJjnhr7IlkP";
  const message = req.body.message;
  const url = "https://notify-api.line.me/api/notify";

  axios.post(url, { message }, {
      headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded"
      }
  })
  .then(response => {
      console.log("訊息已成功發送至 Line Notify！");
      console.log(response.data);
      res.send("訊息已成功發送至 Line Notify！");
  })
  .catch(error => {
      console.error("發送訊息時發生錯誤：", error);
      res.status(500).send("發送訊息時發生錯誤！");
  });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
