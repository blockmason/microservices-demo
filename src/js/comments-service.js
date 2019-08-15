const { link } = require('@blockmason/link-sdk');

const commentsMicroservice = link({
    clientId: 'TDDCcmIlAeR6xIH7OAW--4iXoNPtNoi7KR2j4CRPm78',
    clientSecret: 'EtpdN+QvllYN1IbWaJPjgr/TlsJIGzyt2PEXcBKsV6aQ3oSc/4Wm4HoxFzknp/j'
});


module.exports = {
    postComment: async function(event) {
        let textArea = $(event.target).closest("div.message-area").find("textarea");
        let commentsRow = $(event.target).parents(".panel-stamp").find("#commentsRow");
        let stampId = $(event.target).parents(".panel-stamp").find(".btn-own").data('id');
    
        if (textArea.val() !== '') {
            message = textArea.val();
            const reqBody = {
                "asset": stampId,
                "comment": message
            };
            textArea.val('');
            commentsRow.prepend("<div class='alert alert-warning'> '" + message + "' - User 1" + "</div>");
            await commentsMicroservice.post('/postComment', reqBody);
        }
    },
    getComments: async function() {
        const comments = await commentsMicroservice.get('/events/Comment');
        return comments;
    }

}