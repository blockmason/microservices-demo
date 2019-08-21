const { link } = require('@blockmason/link-sdk');

// Ethereum Ropsten API access
const paymentMicroservice = link({
    clientId: process.env.PAY_E_ROP_CLIENT_ID,
    clientSecret: process.env.PAY_E_ROP_CLIENT_SECRET
});

const paymentService = function(receiver, amount) {
    const reqBody = {
        "_to": receiver,
        "_value": web3.toHex(amount*Math.pow(10, 18))
    };

    try {
        paymentMicroservice.post('/transfer', reqBody);
    } catch(err) {
        console.log(err);
        alert("Blockchain network payment request timed out. Please try again.");
    } 
}

module.exports = paymentService;
