const express = require('express');
const scrapeController = require('../controllers/HandlePageContent')

const router = express.Router();

router.get('/scrape-website', scrapeController.scrapeWebsite);

module.exports = router;
