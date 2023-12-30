const express = require('express');
const axios = require('axios')
const app = express();

app.get('/', async (req, res) => {
    const websiteUrl = "https://chat.openai.com";
    try {
      const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyDmS8wvzLcnvCCABfI-wKr0zzuToWKWHOg&cx=3139d4e7c2fd74d01&q=${websiteUrl}&fields=queries(request(totalResults)),items(title,link,snippet)`);
          // Process the response data and extract the relevant SEO analysis information
    const seoData = response.data;
    const totalResults = seoData.queries?.request[0]?.totalResults;
    const searchResults = seoData.items || [];

    // Prepare the SEO analysis data to send as the response
    const analysisData = {
      totalResults,
      searchResults,
    };

    // Send the SEO analysis data as the JSON response
    res.json(analysisData);
    } catch (error) {
      // Handle any errors that occur during the API request
      console.error('Error:', error.message);
    //   res.status(500).json({ error: 'An error occurred' });
    }
  
});
// Start the server
app.listen(5000, () => {
  console.log('Server started on port 3000');
});