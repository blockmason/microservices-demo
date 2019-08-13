//Link user: harish+microservices@blockmason.io
//Org: microservices-demo

require('dotenv').config();
const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');


// Ownership API

// // Link Private Network API access
// const ownershipMicroservice = link({
//     clientId: process.env.OWN_LNK_CLIENT_ID,
//     clientSecret: process.env.OWN_LNK_CLIENT_SECRET
// });

// GoChain Testnet API access
const ownershipMicroservice = link({
    clientId: process.env.OWN_GC_CLIENT_ID,
    clientSecret: process.env.OWN_GC_CLIENT_SECRET
});

// Ethereum Ropsten API access
// const ownershipMicroservice = link({
//     clientId: process.env.OWN_E_ROP_CLIENT_ID,
//     clientSecret: process.env.OWN_E_ROP_CLIENT_SECRET
// });

// Payment API

// Ethereum Ropsten API access
const paymentMicroservice = link({
    clientId: process.env.PAY_E_ROP_CLIENT_ID,
    clientSecret: process.env.PAY_E_ROP_CLIENT_SECRET
});

// Comments API

const commentsMicroservice = link({
    clientId: process.env.COM_GC_CLIENT_ID,
    clientSecret: process.env.COM_GC_CLIENT_SECRET
});

// const commentsMicroservice = link({
//     clientId: process.env.COM_LNK_CLIENT_ID,
//     clientSecret: process.env.COM_LNK_CLIENT_SECRET
// });

App = {
    tokenConversionRate: 5,
    messageObject: {},
    
    init: function() {
        // Load stamps.
        // console.log(stampData);
        const stampsRow = $('#stampsRow');
        const stampTemplate = $('#stampTemplate');
    
        for (i = 0; i < stampData.length; i++) {
            stampTemplate.find('.panel-title').text(stampData[i].name);
            stampTemplate.find('img').attr('src', stampData[i].picture);
            stampTemplate.find('.stamp-location').text(stampData[i].location);
            stampTemplate.find('.btn-own').attr('data-id', stampData[i].id);
            stampTemplate.find('.btn-value').text(stampData[i].price * App.tokenConversionRate);

            stampsRow.append(stampTemplate.html());
            App.markOwned(i, stampData[i].id);
        }
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-own', App.handleOwnership);
        $(document).on('click', '.btn-comment', App.postComment);
    },

    markOwned: async function(index, name) {
        const asset = {
          "value": name
        };  

        const { result } = await ownershipMicroservice.get('/ownerOf', asset);
        
        if (result !== '0x0000000000000000000000000000000000000000') {
            $('.panel-stamp').eq(index).find('#ownerAddress').empty();
            $('.panel-stamp').eq(index).find('#ownerAddress').append('Current Owner: ' + result).css({ wordWrap: "break-word" });
        }
    },

    fetchAuthority: async function() {
        const { result } = await ownershipMicroservice.get('/authority');
        console.log('authority is', result);
    },

    setOwnership: async function(event, stampId, owner) {
        event.preventDefault();
        const reqBody = {
            "asset": stampId,
            "owner": owner
        };

        try {
            const response = await ownershipMicroservice.post('/setOwner', reqBody);
          
            if(response.errors) {
                alert(response.errors[0].detail);
                $(event.target).text("Own").attr('disabled', false);
            } 
            else {
                console.log('Post request successful');
                $(event.target).text("Own").attr('disabled', false);
                $(event.target).closest("div.owner-address").find("input[name='owner']").val('');  
                $(event.target).parents(".panel-stamp").find("#ownerAddress").text('Owner: ' + owner);
            }
        } catch(err) {
            console.log(err);
            alert("Blockchain network request timed out. Please try again");
        }
    },

    transferPayment: async function(receiver, amount) {
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
    },
    
    handleOwnership: async function(event) {
        event.preventDefault();
        if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
            $(event.target).text("Processing").attr('disabled', true);
            const stampId = $(event.target).data('id');
            const newOwner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
            const price = parseInt($(event.target).next().html());
            let existingOwner = $(event.target).parents(".panel-stamp").find("#ownerAddress").text();
            
            if (existingOwner !== '') {
                existingOwner = existingOwner.split(" ")[1]
                if (existingOwner !== newOwner) {
                    const transferSuccess = await App.transferPayment(existingOwner, price/App.tokenConversionRate);
                    if (transferSuccess) {
                        App.setOwnership(event, stampId, newOwner);
                    } else {
                        alert("Error in transferring funds");
                        $(event.target).text("Own").attr('disabled', false);
                    }
                } else {
                    alert("The provided address is already the owner");
                    $(event.target).text("Own").attr('disabled', false);
                    $(event.target).closest("div.owner-address").find("input[name='owner']").val('');
                }
            } else {
                App.setOwnership(event, stampId, newOwner);
            }
        }
    },
    postComment: function(event) {
        let textArea = $(event.target).closest("div.message-area").find("textarea");
        let commentsRow = $(event.target).parents(".panel-stamp").find("#commentsRow");
        let stampId = $(event.target).parents(".panel-stamp").find(".btn-own").data('id');
        if (!App.messageObject[String(stampId)]) {
            App.messageObject[String(stampId)] = [];
        }

        if (textArea.val() !== '') {
            message = textArea.val();
            const reqBody = {
                "asset": stampId,
                "comment": message
            };
            App.messageObject[String(stampId)].push(message);
            textArea.val('');
            commentsRow.prepend("<div class='alert alert-warning'> '" + message + "' - User 1" + "</div>");
            await commentsMicroservice.post('/postComment', reqBody);
        }
        console.log('message Object is', App.messageObject);        
    },
    getMessages: async function(asset, index) {
        const data = {
            "arg0": asset,
            "arg1": index
        };
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  