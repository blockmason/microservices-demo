const { link } = require('@blockmason/link-sdk');

// Ethereum Ropsten API access
const paymentMicroservice = link({
    clientId: process.env.PAY_E_ROP_CLIENT_ID,
    clientSecret: process.env.PAY_E_ROP_CLIENT_SECRET
});

const paymentService = async function(receiver, amount) {
    const reqBody = {
        "_to": receiver,
        "_value": web3.toHex(amount*Math.pow(10, 18))
    };

    try {
        const result = await paymentMicroservice.post('/transfer', reqBody);
        console.log('transfer result is', result);
        if (result.success) {
            return true
        } else {
            const message = result.errors[0]['detail'];
            alert(message);
            return false
        }
    } catch(err) {
        console.log(err);
        alert("Blockchain network request timed out. Please try again");
    } 
}

module.exports = paymentService;
