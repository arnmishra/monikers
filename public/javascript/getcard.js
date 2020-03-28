function getcard() {
    $.ajax({
        type: 'GET',
        url: "/getCard",
        data: {card: $("#card").val()},
        success: function (data) {
            var card = $('<span />').append(data.word).html();
            $('#card').html(card);
        }
    });
}