# parahacker
A clone of the hacking minigame from [Paradroid](https://en.wikipedia.org/wiki/Paradroid),
using the HTML5 canvas API.
This version is for two players.

### Playing
Open either `index.html` or `pixels.html` in your browser.

There are twelve lights in the center of the screen.
The object of the game is to switch as many of them to your colour as possible
before the timer runs out. You have ten seconds!

Once the timer fills up, the game begins.
Each player has five power nodes, and a random arrangement of wires connecting to the lights.
Move a node up and down to select a wire, then use the node to power that wire.

Some wires can power multiple lights; some lights require multiple powered wires.
Nodes only last for a few seconds before burning out, so use them wisely.

### Controls
Player 1:  
`W` Move node up  
`S` Move node down  
`D` Use node  

Player 2:  
`↑` Move node up  
`↓` Move node down  
`←` Use node  

`Esc` Restart

### Notes
I started this game as a way of learning the HTML5 canvas API, using a simple vector-based layout.
After making some progress, I heard about [lowrezjam](https://itch.io/jam/lowrezjam2016),
a game jam with a 64x64 pixel restriction.
Realizing this would probably fit nicely, I made an alternate version with a pixel layout.
The two versions share the same underlying game code, but each has its own renderer.

### To do
- Title and game over screens
- Sound effects
- Node repeaters / colour switchers
- Custom player colours
- AI for computer opponent
