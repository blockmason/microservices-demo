const { link } = require('@blockmason/link-sdk');

// Ethereum Ropsten API access
const paymentMicroservice = link({
    clientId: 'CEv9d4SQWm-mkxtgC-gqKacv5eTs0sqijTBITvH0e_U',
    clientSecret: 'cc+yDLIN4wt0Ye1f9hqGBtnnvgGchDgVkCKWIE/ZNBYn1G4oFsriWI6Z0D4XLP7'
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
