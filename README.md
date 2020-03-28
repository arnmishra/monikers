# Monikers
Monikers game: http://www.monikersgame.com/

Still in initial V1 MVP status

This is an implementation of the game made in Javascript. I used this mostly
as a way to learn some basic Javascript so the code may not look great. It's
meant to be played remotely via a video call. Please refer to the Monikers
website for official rules. 

_Note: Only one game can be played at a time. If start game is clicked a
second time, it'll overwrite the info from the ongoing game._

### Start The Game
* Install Node: https://www.webucator.com/how-to/how-install-nodejs-on-mac.cfm
* Install Heroku: 
```$xslt
// Mac:
brew install heroku/brew/heroku
// Ubuntu:
sudo snap install heroku --classic
``` 
* Clone this repository
```$xslt
$ git clone https://github.com/arnmishra/monikers.git
$ cd monikers
```
* Start the service:
```$xslt
$ heroku login
$ heroku create
$ git push heroku master
$ heroku ps:scale web=1
$ heroku open
```
* Follow the setup below

### Setup
- Select 2 team names
- Specify number of players per team
- Select total number of cards in deck to use
- Click "Start Game"
- Each player goes to their individual page (max 1 viewer per page)

### Game Play
The game is usually split into 3 rounds. We provide unlimited rounds in case you
want to add your own expansions but traditionally you end the game after the
3rd round. Each round involves alternating teams with one player attempting
to get the rest of their team to guess as many words in 60 seconds. This
continues until the full deck is finished at which point the same words are
re-shuffled for the next round.
- Round 1: Played as taboo. You can say anything to get the team to guess
your word except the word or base of the word itself. i.e. for Baking you can
 say "Oven" and "Cook" but you can't say "Bake" or "Baker" or "Bakery"
 - Round 2: Played as taboo but you can only say a single word as your hint.
 i.e. for Baking you can only say "Oven" but nothing else.
 - Round 3: Played as charades. You have to act out the word without making
  any sounds or mouthing words.
 - [Optional] Round 4: Charades but using only one hand
 
 ### Winning
 You get 1 point per card you get right and -0.5 for every card you skip.
 These point values are customizable at the start of the game. The winner is
 the team that accumulates the most points at the end of all the rounds.
 
 
 user home page has score
 when all users have submitted words, player 1's screen says "Start now?"
 player 1 gets words on their screen one a time and chooses pass/fail. at the
  top there is a 60 second counter. when the counter hits 0, their turn ends. 
  their page changes to just show score.
 player 2's screen then switches from just showing score to prompt "Start now?"
 When a player gets a word correct its shown on all screens
 click start now and starts their part
 alternate teams until round done
 when last word is done, next player's screen shows "Start next round now?"
