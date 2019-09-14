//Link user: harish+microservices@blockmason.io
//Org: microservices-demo

const stampData = require('../stamps.json');
const paymentService = require('./payments-service.js');
const commentsService = require('./comments-service.js');
const ownershipService = require('./ownership-service.js');

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

App = {
    tokenConversionRate: 1,
    walletMapping: {
        'Drake': '0x50A98FC5FfE1adCE8B8C087B70B33217a9d65013'.toLowerCase(),
        'Bianca': '0xfF970382280B6c7a46962ddD08e7d591550E6B53'.toLowerCase(),
        'Harish': '0xFeE9813A4B268793D4Edc6DF11A760C3c07a2c98'.toLowerCase()
    },
    
    init: async function() {
        // Load stamps.
        const stampsRow = $('#stampsRow');
        const stampTemplate = $('#stampTemplate');

        for (i = 0; i < stampData.length; i++) {
            stampTemplate.find('.panel-title').text(stampData[i].name);
            stampTemplate.find('img').attr('src', stampData[i].picture);
            stampTemplate.find('.stamp-location').text(stampData[i].location);
            stampTemplate.find('.btn-own').attr('data-id', stampData[i].id);
            stampTemplate.find('.btn-value').text(stampData[i].price * App.tokenConversionRate);
            stampTemplate.find('.comments-row').attr('id', stampData[i].id );
            stampsRow.append(stampTemplate.html());
            App.markOwned(i, stampData[i].id);
        }
        await commentsService.getComments();
        commentsService.printComments();
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-own', App.handleOwnership);
        $(document).on('click', '.btn-comment', App.postComment);
    },

    markOwned: async function(index, name) {
        const { result } = await ownershipService.getOwner(name);
        const owner = getKeyByValue(App.walletMapping, result);
        
        if (result !== '0x0000000000000000000000000000000000000000') {
            $('.panel-stamp').eq(index).find('#ownerAddress').empty();
            $('.panel-stamp').eq(index).find('#ownerAddress').append('Owner: ' + owner).css({ wordWrap: "break-word" });
        }
    },

    fetchAuthority: async function() {
        const { result } = await ownershipService.getAuthority();
        console.log('authority is', result);
    },

    setOwnership: async function(event, stampId, ownerAddress) {
        event.preventDefault();
        console.log('set ownership address is', ownerAddress);
        try {
            const response = await ownershipService.setOwner(stampId, ownerAddress);
            if(response.errors) {
                alert(response.errors[0].detail);
                $(event.target).text("Own").attr('disabled', false);
            } 
            else {
                console.log('setOwner request successful');
                $(event.target).text("Own").attr('disabled', false);
                $(event.target).closest("div.owner-address").find("input[name='owner']").val('');  
                $(event.target).parents(".panel-stamp").find("#ownerAddress").text('Owner: ' + getKeyByValue(App.walletMapping, ownerAddress));
            }
        } catch(err) {
            console.log(err);
            alert("Blockchain network request timed out. Please try again");
        }
    },
    
    handleOwnership: async function(event) {
        event.preventDefault();
        if (confirm("Confirm ownership of this stamp, which will take a few seconds to document")) {
            $(event.target).text("Processing").attr('disabled', true);
            const stampId = $(event.target).data('id');
            const newOwner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
            const newOwnerAddress = App.walletMapping[newOwner];
            const price = parseInt($(event.target).next().html());
            let existingOwner = $(event.target).parents(".panel-stamp").find("#ownerAddress").text().split(" ")[1];
            let existingOwnerAddress = App.walletMapping[existingOwner];
            
            if (existingOwnerAddress !== '') {
                if (existingOwnerAddress !== newOwnerAddress) {
                    $(event.target).text("Own").attr('disabled', true);
                    await paymentService(existingOwnerAddress, price/App.tokenConversionRate);
                    App.setOwnership(event, stampId, newOwnerAddress);
                } else {
                    alert("The provided name is already the owner");
                    $(event.target).text("Own").attr('disabled', false);
                    $(event.target).closest("div.owner-address").find("input[name='owner']").val('');
                }
            } else {
                App.setOwnership(event, stampId, newOwnerAddress);
            }
        }
    },

    postComment: async function(event) {
        commentsService.postComment(event);     
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  