// Require dependencies
const fetch = require('node-fetch');
const { link } = require('@blockmason/link-sdk');

// Link credentials
const demoService = link({
  clientId: '3XJVIUgvdqxZxF2vPH1m_1FwNOGLXwCRgkL8ZS9-87E',
  clientSecret: 'dCvylMkfhcxpT6gDM79SkuErYrNkIBVeDwsIyOEWl5YBpttf1/4FRZjDwpLZyQL'
}, {
    fetch
});

async function demo() {
    const { message } = await demoService.get('/helloWorld');
    console.log(message);
}

demo();