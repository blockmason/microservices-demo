const { link } = require('@blockmason/link-sdk');

// Ownership API on GoChain
const ownershipMicroservice = link({
    clientId: process.env.OWN_GC_CLIENT_ID,
    clientSecret: process.env.OWN_GC_CLIENT_SECRET
});

module.exports = {
    getOwner: function(asset) {
        const data = {
            "value": asset
        };
        return ownershipMicroservice.get('/ownerOf', data);
    },

    getAuthority: function() {
        return ownershipMicroservice.get('/authority');
    },

    setOwner: function(assetId, owner) {
        const reqBody = {
            "asset": assetId,
            "owner": owner
        };
        return ownershipMicroservice.post('/setOwner', reqBody);
    }
}