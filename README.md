# parahacker

![ParaHacker](./images/animation.gif?raw=true)

A clone of the hacking minigame from [Paradroid](https://en.wikipedia.org/wiki/Paradroid),
using the HTML5 canvas API.
This version is for one or two players.

### Install and run
Run `npm install` followed by `gulp` and open `dist/index.html`.

### Play
There are twelve lights in the center of the screen.
The object of the game is to switch as many of them to your colour as possible
before the timer runs out. You have ten seconds!

Once the timer fills up, the game begins.
Each player has five power nodes, and a random arrangement of wires connecting to the lights.
Move a node up and down to select a wire, then use the node to power that wire.

Some wires can power multiple lights; some lights require multiple powered wires.
Nodes only last for a few seconds before burning out, so use them wisely.

### Options
Players: You can play with one player against the computer, or two players against each other.

Nodes: Use `A` `D` and `←` `→` to set the number of nodes each player starts with.
This way you can balance a game between two players of different skill levels
(including the computer).

Timer: Set the length of a round, anywhere between 2(!) and 20 seconds.

### Controls
Player 1:  
`W` Move node up  
`S` Move node down  
`D` Use node  

Player 2:  
`↑` Move node up  
`↓` Move node down  
`←` Use node  

`Esc` Return to menu

When a round is over, press any key to start a new round.

### Notes
I started this game as a way of learning the HTML5 canvas API, using a simple vector-based layout.
After making some progress, I heard about [lowrezjam](https://itch.io/jam/lowrezjam2016),
a game jam with a 64x64 pixel restriction.
Realizing this would probably fit nicely, I made an alternate version with a pixel layout.
The two versions share the same underlying game code, but each has its own renderer.

Currently the vector renderer is out of date,
as I had to prioritize the pixel renderer for the jam. :)

### To do
- Sound effects on/off
- Node repeaters / colour switchers
- Smarter AI
