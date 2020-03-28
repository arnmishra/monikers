var express = require('express');
var fs = require("fs");
// var WebSocketServer = require('ws').Server
var lodash = require("lodash");

var router = express();

router.locals.team1Name = '';
router.locals.team2Name = '';
router.locals.team1Score = 0;
router.locals.team2Score = 0;
router.locals.playerNames = [];
router.locals.numCards = 0;
router.locals.winPoints = 0;
router.locals.skipLostPoints = 0;
router.locals.numPlayers = 0;
router.locals.randomWords = [];
router.locals.selectedWords = [];
router.locals.availableWords = [];
router.locals.currentWord = '';
router.locals.currentPlayer = 0;
router.locals.previousPlayer = -1;
router.locals.roundNumber = 1;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Monikers' });
});

router.post('/create', function (req, res) {
  router.locals.team1Name = req.body.team1Name;
  router.locals.team2Name = req.body.team2Name;
  router.locals.numCards = req.body.numCards * req.body.numPlayers;
  router.locals.winPoints = parseFloat(req.body.winPoints);
  router.locals.skipLostPoints = parseFloat(req.body.skipLostPoints);
  router.locals.numPlayers = req.body.numPlayers;
  // Get the random words to use as cards
  setRandomWords();
  res
      .status(200)
      .render('inputNames',
          { title: 'Monikers',
            team1Name: router.locals.team1Name,
            team2Name: router.locals.team2Name,
            team1NumPlayers: Math.ceil(router.locals.numPlayers/2),
            team2NumPlayers: Math.floor(router.locals.numPlayers/2)
          });
});
router.get('/create', function (req, res) {
  res
      .render('inputNames',
          { title: 'Monikers',
            team1Name: router.locals.team1Name,
            team2Name: router.locals.team2Name,
            team1NumPlayers: Math.ceil(router.locals.numPlayers/2),
            team2NumPlayers: Math.floor(router.locals.numPlayers/2)
          });
});

router.post('/dashboard', function (req, res) {
  router.locals.playerNames = [];
  // Save Team 1 names
  for (var i = 0; i < Math.ceil(router.locals.numPlayers/2); i++) {
    router.locals.playerNames.push(req.body["team1-" + i + "Name"]);
  }
  // Save Team 2 names
  for (var j = 0; j < Math.floor(router.locals.numPlayers/2); j++) {
    router.locals.playerNames.push(req.body["team2-" + j + "Name"]);
  }
  res
      .status(200)
      .render('dashboard',
          { title: 'Monikers',
            players: router.locals.playerNames
          });
});
router.get('/dashboard', function (req, res) {
  res
      .render('dashboard',
          { title: 'Monikers',
            team1Name: router.locals.team1Name,
            team2Name: router.locals.team2Name,
            players: router.locals.playerNames
          });
});

router.get('/:id/select', function (req, res) {
  var playerId = req.params.id;
  var playerName = router.locals.playerNames[playerId];
  var numCards = router.locals.numCards / router.locals.numPlayers;
  // Get double the number of cards you need and delete from the list
  var words = router.locals.randomWords.splice(0, numCards*2);
  res
      .render('selectCards',
          { title: 'Monikers',
            playerId: playerId,
            playerName: playerName,
            numCards: numCards,
            words: words
          })
});

router.post('/:id/dashboard', function (req, res) {
    var playerId = req.params.id;
    var playerName = router.locals.playerNames[playerId];
    Object.keys(req.body).forEach(function(key,index) {
        if (typeof req.body[key] === "object") {
            var word = req.body[key][1];
            if (router.locals.selectedWords.indexOf(word) < 0)
                router.locals.selectedWords.push(word)
        } else {
            if (router.locals.selectedWords.indexOf(key) < 0)
                router.locals.selectedWords.push(key);
        }
    });
    var myTurn =
        router.locals.selectedWords.length === router.locals.numCards &&
        router.locals.currentPlayer.toString() === playerId;
    res
        .status(200)
        .render('userDashboard',
            { title: 'Monikers',
              playerName: playerName,
              myTurn: myTurn,
              newRound: router.locals.availableWords.length === 0,
              team1Name: router.locals.team1Name,
              team2Name: router.locals.team2Name
            });
});

router.get('/:id/dashboard', function (req, res) {
    var playerId = req.params.id;
    var playerName = router.locals.playerNames[playerId];
    var myTurn =
        router.locals.selectedWords.length === router.locals.numCards &&
        router.locals.currentPlayer.toString() === playerId;
    res
        .status(200)
        .render('userDashboard',
            { title: 'Monikers',
                playerName: playerName,
                myTurn: myTurn,
                newRound: router.locals.availableWords.length === 0,
                team1Name: router.locals.team1Name,
                team2Name: router.locals.team2Name
            });
});

router.post('/loadScore', function (req, res) {
    res
        .status(200)
        .json({ team1Score: router.locals.team1Score,
                team2Score: router.locals.team2Score,
                roundNumber: router.locals.roundNumber});
});

router.get('/getcard', function (req, res) {
    if(router.locals.availableWords.length === 0) {
        router.locals.availableWords =
            lodash.cloneDeep(router.locals.selectedWords);
    }
    shuffle(router.locals.availableWords);
    // Shift pops the first element
    router.locals.currentWord = router.locals.availableWords.shift();
    res
        .status(200)
        .json({ word: router.locals.currentWord,
                numLeft: router.locals.availableWords.length});
});

router.post('/passed', function (req, res) {
    updateTeamScore(router.locals.winPoints);
    if(router.locals.availableWords.length === 0) {
        changeTurns(req, res);
        res
            .status(200)
            .json({ word: -1, numLeft: 0});
    } else {
        shuffle(router.locals.availableWords);
        // Shift pops the first element
        router.locals.currentWord = router.locals.availableWords.shift();
        res
            .status(200)
            .json({ word: router.locals.currentWord,
                numLeft: router.locals.availableWords.length});
    }
});

router.post('/skipped', function (req, res) {
    updateTeamScore(router.locals.skipLostPoints * -1);
    // Skipped word should be put back in list
    router.locals.availableWords.push(router.locals.currentWord);
    // Shift pops the first element
    router.locals.currentWord = router.locals.availableWords.shift();
    res
        .status(200)
        .json({ word: router.locals.currentWord,
                numLeft: router.locals.availableWords.length});
});

router.post('/changeTurns', function (req, res) {
    router.locals.availableWords.push(router.locals.currentWord);
    shuffle(router.locals.availableWords);
    changeTurns(req, res)
});

function changeTurns(req, res) {
    setNextPlayerId();
    var newRoundStarting = router.locals.availableWords.length === 0;
    if(newRoundStarting) {
        router.locals.roundNumber++;
        router.locals.availableWords =
            lodash.cloneDeep(router.locals.selectedWords);
    }
}

function setRandomWords() {
  var numWords = router.locals.numCards*2;
  var text = fs.readFileSync('public/static/words.txt', "utf-8");
  var words = text.split('\n');
  shuffle(words);
  router.locals.randomWords = words;
}

// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function updateTeamScore(addVal) {
    if (Math.ceil(router.locals.numPlayers/2) > router.locals.currentPlayer)
        // Curr player on team 1
        router.locals.team1Score += addVal;
    else
        //Curr player on team 2
        router.locals.team2Score += addVal;
}

function setNextPlayerId() {
    var numPlayers = router.locals.numPlayers;
    var currPlayer = router.locals.currentPlayer;
    var prevPlayer = router.locals.previousPlayer;

    router.locals.previousPlayer = currPlayer;
    if (prevPlayer === -1 || (prevPlayer + 1).toString() === numPlayers) {
        // First player on Team 2 (id 4 for 7 players)
        currPlayer = Math.ceil(numPlayers/2)
    } else if (prevPlayer + 1 === Math.ceil(numPlayers / 2)) {
        currPlayer = 0
    } else {
        currPlayer = (prevPlayer + 1)
    }
    router.locals.currentPlayer = currPlayer;
}

// wss = new WebSocketServer({port: 40510})
// wss.on('connection', function (ws) {
//     ws.on('message', function (message) {
//         console.log('received: %s', message)
//     }) ;
//     setInterval(() => ws.send("${new Date()}"), 1000)
// });


module.exports = router;
