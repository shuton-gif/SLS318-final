two player(ill say フロムゲー）



player1: '#03AED2',
player2: '#FCB7C7',

floor design

router param 
localhost:3000/Game/[floor]
so floor 1 
localhost:3000/Game/1

1-30
both players can pick up the puzzlePieces
the EN word is shown at the center of the screen

and throw the puzzlePieces with Japanese word into the goal
if correct move on

  {
    "floor": "1",
    "JP": "猫",
    "EN": "cat",
    "dummies": //other words in the same genre ex; 犬、猿、
  },
  
31-60
both players can pick up the puzzlePieces
partly complete scentence with only the particles missing is shown at the center of the screen

  {
    "floor": "31",
    "JP": "猫のお腹はふわふわ",
    "EN": "a cat's belly is super soft",
    "incomplete":["猫","_","お腹","_","ふわふわ" ],
    "answer": ["の", "は"]
  },

61-100
every 10 floors interchange the role(VOCAB and PARTICLE) of the two player
only the puzzles with the players role can be picked up

  {
    "floor": "61",
    "JP": "猫は可愛いのでもふもふしたい!",
    "EN": "cats are cute, so I want to fluf them!",
    "incomplete":["_","_","_","_","_"],
    "answer": ["猫","は","可愛い","ので","もふもふしたい!"]
  },