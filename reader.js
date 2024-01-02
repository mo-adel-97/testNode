const express = require('express');
const cors = require('cors');
const scrapeRoutes = require('./Routes/HandleViewContentRoute');

const app = express();

app.timeout = 3000000000000000;

app.use(express.json());
// Enable CORS with specific options
const corsOptions = {
  origin: 'http://localhost:3000', // replace with your allowed origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // enable credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // for preflight requests
};

app.use(cors(corsOptions));



app.use(scrapeRoutes);

app.get('/',(req,res)=>{
  res.send("hello from node test")
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
