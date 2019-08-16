// Require dependencies
const fetch = require('node-fetch');
const { link } = require('@blockmason/link-sdk');

// Link credentials
const demoService = link({
  clientId: 'XUz1-dyE3GOebz9AtpOcgnVL56L5JyJqGqj3sYxjVuU',
  clientSecret: 'QGwu6A/c9WzV4Gf/uGIPNSfda6rOKkMkaJ5pHP4ccyWWy0F6YZ133VVFawet2FH'
}, {
    fetch
});

async function demo() {
    const { message } = await demoService.get('/helloWorld');
    console.log(message);
}

demo();