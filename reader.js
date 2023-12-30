const express = require('express');
const cors = require('cors');
const scrapeRoutes = require('./Routes/HandleViewContentRoute');

const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Configure CORS to allow requests from your React app (replace localhost:3000 with your actual React app's URL during development)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(scrapeRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
