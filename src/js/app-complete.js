//Link user: harish+microservices@blockmason.io
//Org: microservices-demo

const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');
const paymentService = require('./payments-service.js');

// Ownership API

// Link Private Network
const ownershipMicroservice = link({
    clientId: process.env.OWN_LNK_CLIENT_ID,
    clientSecret: process.env.OWN_LNK_CLIENT_SECRET
});

// // GoChain Testnet API access
// const ownershipMicroservice = link({
//     clientId: process.env.OWN_GC_CLIENT_ID,
//     clientSecret: process.env.OWN_GC_CLIENT_SECRET
// });

// // Ethereum Ropsten API access
// const ownershipMicroservice = link({
//     clientId: process.env.OWN_E_ROP_CLIENT_ID,
//     clientSecret: process.env.OWN_E_ROP_CLIENT_SECRET
// });

App = {
    tokenConversionRate: 1,
    
    init: function() {
        // Load stamps.
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
            $('.panel-stamp').eq(index).find('#ownerAddress').append('Owner: ' + result).css({ wordWrap: "break-word" });
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
        paymentService(receiver, amount)
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
                    $(event.target).text("Own").attr('disabled', true);
                    await App.transferPayment(existingOwner, price/App.tokenConversionRate);
                    App.setOwnership(event, stampId, newOwner);
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
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  