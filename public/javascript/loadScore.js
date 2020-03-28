function loadScore() {
    $.ajax({
        type: 'POST',
        url: "/loadScore",
        data: {score: $("#score").val()},
        success: function (data) {
            var team1Score = $('<span />').append(data.team1Score).html();
            $('#team1Score').html(team1Score);
            var team2Score = $('<span />').append(data.team2Score).html();
            $('#team2Score').html(team2Score);
            var roundNumber = $('<span />').append(data.roundNumber).html();
            $('#roundNumber').html(roundNumber);
        }
    });
}

loadScore(); // This will run on page load
setInterval(function(){
    loadScore() // this will run after every 30 seconds
}, 30000);