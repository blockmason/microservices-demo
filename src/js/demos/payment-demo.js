const fetch = require('node-fetch');
const { link } = require('@blockmason/link-sdk');

// Link credentials
const project = link({
  clientId: 'CEv9d4SQWm-mkxtgC-gqKacv5eTs0sqijTBITvH0e_U',
  clientSecret: 'cc+yDLIN4wt0Ye1f9hqGBtnnvgGchDgVkCKWIE/ZNBYn1G4oFsriWI6Z0D4XLP7'
}, {
    fetch
});

async function getBalance(address) {
  const reqBody = {
    "_tokenholder": address
  }

  const { balance } = await project.get('/balanceOf', reqBody);
  console.log(parseInt(balance, 16)/Math.pow(10,18));
}

async function transferFunds(sender, recipient, amount) {
  const funds = (amount*Math.pow(10, 18)).toString(16);
  
  const transferBody = {
    "_from": sender,
    "_to": recipient,
    "_value": funds
  }

  try {
    await project.post('/transferFrom', transferBody);
  } 
  catch(err) {
    console.log(err);
  }
}

async function approveSender(sender, amount) {
  const funds = (amount*Math.pow(10, 18)).toString(16);

  const approvalBody = {
    "_spender": sender,
    "_value": funds
  }

  try {
    console.log('making post approve request now');
    const await project.post('/approve', approvalBody);
    console.log('approve request completed');
  }
  catch(err) {
    console.log(err);
  }
}



approveSender('0x50A98FC5FfE1adCE8B8C087B70B33217a9d65013', 50);
// transferFunds('0x50A98FC5FfE1adCE8B8C087B70B33217a9d65013', '0xFeE9813A4B268793D4Edc6DF11A760C3c07a2c98', 50);
// getBalance('0x50A98FC5FfE1adCE8B8C087B70B33217a9d65013');
// getBalance('0xFeE9813A4B268793D4Edc6DF11A760C3c07a2c98');




