const stampData = require('../stamps.json');
const { link } = require('@blockmason/link-sdk');

// Link Private Network API access
const ownershipMicroservice = link({
    clientId: process.env.OWN_LNK_CLIENT_ID,
    clientSecret: process.env.OWN_LNK_CLIENT_SECRET
});

App = {
    init: function() {
        // Load stamps
        const stampsRow = $('#stampsRow');
        const stampTemplate = $('#stampTemplate');
    
        for (i = 0; i < stampData.length; i ++) {
            stampTemplate.find('.panel-title').text(stampData[i].name);
            stampTemplate.find('img').attr('src', stampData[i].picture);
            stampTemplate.find('.stamp-location').text(stampData[i].location);
            stampTemplate.find('.btn-own').attr('data-id', stampData[i].id);
    
            stampsRow.append(stampTemplate.html());
            App.markOwned(i, stampData[i].id);
        }
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-own', App.setOwnership);
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

    setOwnership: async function(event) {
        event.preventDefault();
        if (confirm("Confirm ownership of this stamp, which can take a few seconds to record on the blockchain")) {
          const stampId = $(event.target).data('id');
          const owner = $(event.target).closest("div.owner-address").find("input[name='owner']").val();
          $(event.target).text("Processing").attr('disabled', true);
    
          const reqBody = {
            "asset": stampId,
            "owner": owner
          };

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
        }
    }
};
  
$(function() {
    $(window).load(function() {
        App.init();
    });
});
  