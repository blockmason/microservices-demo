const fetch = require('node-fetch');
const { link } = require('@blockmason/link-sdk');

// Link credentials
const project = link({
  clientId: 'TDDCcmIlAeR6xIH7OAW--4iXoNPtNoi7KR2j4CRPm78',
  clientSecret: 'EtpdN+QvllYN1IbWaJPjgr/TlsJIGzyt2PEXcBKsV6aQ3oSc/4Wm4HoxFzknp/j'
}, {
    fetch
});

async function postMessage() {
    const reqBody = {
        "asset": "VanGoghPainting",
        "comment": "This one is my favourite!"
    }

    const response = await project.post('/postComment', reqBody);
    if (response.errors) {
        console.log(response.errors[0].detail);
    } else {
        console.log('POST /postComment called successfully with request data ', reqBody);
    }
}

async function getMessage() {
    const comments = await project.get('/events/Comment');
    console.log(comments);
}

postMessage().then(function() {
    getMessage();
});