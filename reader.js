const express = require('express');
const cors = require('cors');
const scrapeRoutes = require('./Routes/HandleViewContentRoute');

const app = express();

app.timeout = 3000000000000000;

app.use(express.json());
app.use(cors()); // Enable CORS for all routes


app.use(scrapeRoutes);

app.get('/',(req,res)=>{
  res.send("hello from node test")
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
