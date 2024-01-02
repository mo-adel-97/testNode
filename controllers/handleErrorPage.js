const axios = require('axios');
const dns = require('dns');

async function getWebsiteInformation(url) {
  try {
    // Extracting the hostname from the URL
    const hostname = new URL(url).hostname;

    // Using a Promise to handle the asynchronous DNS resolution
    const ipAddress = await new Promise((resolve, reject) => {
      dns.resolve(hostname, 'A', (err, addresses) => {
        if (err) {
          console.error('Error resolving IP address:', err.message);
          reject('Failed to resolve IP address.');
        } else {
          const ipAddress = addresses.length > 0 ? addresses[0] : null;
          resolve(ipAddress);
          console.log("ipAddress ipAddress ipAddress ipAddress is",ipAddress)
        }
      });
    });

    // Fetching IP geolocation information using ipinfo.io API
    const ipInfoResponse = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
    const { ip, country, org } = ipInfoResponse.data;
    // Returning an object with the information
    return {
      ip:ip,
      country:country ,
      organization: org,
    };
} catch (error) {
  console.error('Error:', error);
  throw new Error('Failed to fetch website information.');
}
}

module.exports = {
  getWebsiteInformation,
};
