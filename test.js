const express = require('express');
const axios = require('axios')
const app = express();

const apiKey = 'AIzaSyCPBcq_kJjohi9NP7wFU9xmmY08abq-klg'; // Replace with your actual API key
const url = 'https://tools.seopower-sa.com/'; // Replace with the URL of the website you want to analyze

const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`;

axios.get(apiUrl)
  .then(response => {
    const data = response.data;

    // Process and display the data as needed
    console.log('Title:', data.title);
    console.log('Score:', data.lighthouseResult.categories.performance.score);
    console.log('Speed Index:', data.loadingExperience.metrics.SPEED_INDEX.percentile);
    console.log('Largest Contentful Paint:', data.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile);
    // Add more metrics as needed

    // Display the data in your app UI or save it to a database, etc.
  })
  .catch(error => {
    console.error('Error fetching PageSpeed Insights data:', error.message);
  });

  // Start the server
app.listen(5000, () => {
    console.log('Server started on port 5000');
  }); 