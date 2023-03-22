const GameStatus = {
   PLAYING: "playing",
   WIN: "win",
   LOSE: "lose",
}

class Game
{
   constructor(rows, cols)
   {
      this.path = [];
      this.moveList = [];
      this.status = GameStatus.PLAYING;
      this.rows = rows;
      this.cols = cols;
      this.data = [];
      this.start = [0, 0];
      this.player = [0, 0];
      this.goal = [rows - 1, cols - 1];
      this.createBoard();
   }

   createBoard()
   {
      this.data = [];
      for (let i = 0; i < this.rows; i++)
      {
         this.data[i] = [];
         for (let j = 0; j < this.cols; j++)
         {
            this.data[i][j] = 0;
         }
      }
   }

   loadDataFromString(str)
   {
      this.data = [];
      for (let i = 0; i < this.rows; i++)
      {
         this.data[i] = [];
         for (let j = 0; j < this.cols; j++)
         {
            let idx = i * this.cols + j;
            this.data[i][j] = parseInt(str.length > idx ? str[idx] : 0);
         }
      }
   }

   generateNextPopulation()
   {
      this.data = Game.calculateNextPopulation(this.data, this.rows, this.cols);
   }

   static calculateNextPopulation(data, rows, cols)
   {
      let next = [];

      for (let i = 0; i < rows; i++)
      {
         next.push([]);
         for (let j = 0; j < cols; j++)
         {
            next[i].push(0);

            let liveNeighbors = 0;

            liveNeighbors += (i > 0 && j > 0) ? data[i - 1][j - 1] == 1 : 0;
            liveNeighbors += (i > 0) ? data[i - 1][j] == 1 : 0;
            liveNeighbors += (i > 0 && j < cols - 1) ? data[i - 1][j + 1] == 1 : 0;
            liveNeighbors += (j > 0) ? data[i][j - 1] == 1 : 0;
            liveNeighbors += (j < cols - 1) ? data[i][j + 1] == 1 : 0;
            liveNeighbors += (i < rows - 1 && j > 0) ? data[i + 1][j - 1] == 1 : 0;
            liveNeighbors += (i < rows - 1) ? data[i + 1][j] == 1 : 0;
            liveNeighbors += (i < rows - 1 && j < cols - 1) ? data[i + 1][j + 1] == 1 : 0;

            // dead cell
            if (data[i][j] === 0)
            {
               next[i][j] = ((liveNeighbors > 1 && liveNeighbors < 5) ? 1 : 0);
            }

            // live cell
            if (data[i][j] === 1)
            {
               next[i][j] = ((liveNeighbors > 3 && liveNeighbors < 6) ? 1 : 0);
            }
         }

      }

      return next;
   }

   move(direction)
   {
      if (this.status !== GameStatus.PLAYING)
      {
         return;
      }

      if (this.testInvalidMove(direction))
      {
         console.log("invalid move");
         this.status = GameStatus.LOSE;
         return;
      }

      if (direction === "U")
      {
         this.player[0]--;
      }
      else if (direction === "D")
      {
         this.player[0]++;
      }
      else if (direction === "L")
      {
         this.player[1]--;
      }
      else if (direction === "R")
      {
         this.player[1]++;
      }

      this.path.push('x:' + this.player[0] + '_y:' + this.player[1]);
      this.moveList.push(direction);

      this.generateNextPopulation();
      this.testLoseCondition();
      this.testWinCondition();
   }

   testInvalidMove(direction)
   {
      if (this.status !== GameStatus.PLAYING)
      {
         return;
      }

      // out of bounds
      if (direction === "U" && this.player[0] === 0)
      {
         return true;
      }

      if (direction === "D" && this.player[0] === this.rows - 1)
      {
         return true;
      }

      if (direction === "L" && this.player[1] === 0)
      {
         return true;
      }

      if (direction === "R" && this.player[1] === this.cols - 1)
      {
         return true;
      }

      return false;

   }

   testLoseCondition()
   {
      if (this.status !== GameStatus.PLAYING)
      {
         return;
      }

      // hit a live cell
      if (this.data[this.player[0]][this.player[1]] === 1)
      {
         console.log("hit a live cell");
         this.status = GameStatus.LOSE;
      }

   }

   testWinCondition()
   {
      if (this.status !== GameStatus.PLAYING)
      {
         return;
      }

      // reached the goal
      if (this.player[0] === this.goal[0] && this.player[1] === this.goal[1])
      {
         console.log("winner");
         this.status = GameStatus.WIN;
      }

   }

   render()
   {

      let statusElement = document.getElementById("status");
      statusElement.classList.remove("status-winner");
      statusElement.classList.remove("status-loser");

      // status
      if (this.status === GameStatus.PLAYING)
      {
         statusElement.innerHTML = "";
      }

      if (this.status === GameStatus.WIN)
      {
         statusElement.innerHTML = "You Win!";
         statusElement.classList.add("status-winner");
      }

      if (this.status === GameStatus.LOSE)
      {
         statusElement.innerHTML = "You Lose!";
         statusElement.classList.add("status-loser");
      }

      let board = document.getElementById("board");

      board.innerHTML = "";

      for (let i = 0; i < this.rows; i++)
      {
         let row = document.createElement("div");
         row.classList.add("row");
         board.appendChild(row);

         for (let j = 0; j < this.cols; j++)
         {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            row.appendChild(cell);

            if (this.data[i][j] === 1)
            {
               cell.classList.add("alive");
            }

            if (i === this.start[0] && j === this.start[1])
            {
               cell.classList.add("start");
            }

            if (i === this.goal[0] && j === this.goal[1])
            {
               cell.classList.add("goal");
            }

            if (this.path.includes('x:' + i + '_y:' + j))
            {
               cell.classList.add("path");
            }

            if (i === this.player[0] && j === this.player[1])
            {
               cell.classList.add("player");

               if (this.status === GameStatus.LOSE)
               {
                  cell.classList.add("loser");
               }
               else
               {
                  cell.classList.remove("loser");
               }
            }
         }
      }
   }

}

let game;
let interval;
let delay = 100;
let isFollowingPath = false;
let pathToFollow = [];
let previousNode = null;
let attemptedMoves = {};

function reset()
{
   pause();
   isFollowingPath = false;
   pathToFollow = [];
   previousNode = null;

   // game = new Game(10, 10);
   // let initialData = "";
   // initialData += "0000000000";
   // initialData += "0100000100";
   // initialData += "0010000000";
   // initialData += "0001000000";
   // initialData += "0000100000";
   // initialData += "0000010000";
   // initialData += "0000000000";
   // initialData += "0000000000";
   // initialData += "0000000000";
   // initialData += "0000000000";

   game = new Game(65, 85);
   let initialData = "30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111000000000000000000000000000000000000000000000000000000000000000000000000000000001111111110000000000000000000000000000000000000000000000000000000000000000000000000000111111111110000000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000111111111111111110000000000000000000000000000000000000000000000000000000000000000000011111111111111111100000000000000000000000000000000000000000000000000000000000000000001111111111111111111100000000000000000000000000000000000000000000000000000000000000000111111111111111111111000000000000000000000000000000000000000000000000000000000000000011111111111111111111110000000000000000000000000000000000000000000000000000000000000001111111111111111111111100000000000000000000000000000000000000000000000000000000000000111111111111111111111110000000000000000000000000000000000000000000000000000000000000011111111111111111111111100000000000000000000000000000000000000000000000000000000000001111111111111111111111111000000000000000000000000000000000000000000000000000000000000111111111111111111111111110000000000000000000000000000000000000000010000000000000000000111111111111111111111111000000000000000000000000000000000000000011100000000000000000000011111111111111111111110000000000000000000000000000000000000011110000000000000000000000011111111111111111111000000000000000000000000000000000000011111000000000000000000000000011111111111111111110000000000000000000000000000000000011111100000000000000000000000000111111111111111111000000000000000000000000000000000011111110000000000000000000000000001111111111111111100000000000000000000000000000000011111111000000000000000000000000000011111111111111111000000000000000000000000000000011111111100000000000000000000000000001111111111111111100000000000000000000000000000011111111110000000000000000000000000000011111111111111110000000000000000000000000000011111111111000000000000000000000000000001111111111111111000000000000000000000000000011111111111100000000000000000000000000000011111111111111110000000000000000000000000011111111111110000000000000000000000000000001111111111111111000000000000000000000000011111111111111000000000000000000000000000000111111111111111100000000000000000000000011111111111111100000000000000000000000000000001111111111111110000000000000000000000001111111111111110000000000000000000000000000000111111111111111000000000000000000000000111111111111111000000000000000000000000000000011111111111111100000000000000000000000011111111111111100000000000000000000000000000001111111111111110000000000000000000000001111111111111110000000000000000000000000000000111111111111111000000000000000000000000011111111111111000000000000000000000000000000111111111111111100000000000000000000000000111111111111100000000000000000000000000000011111111111111110000000000000000000000000001111111111110000000000000000000000000000001111111111111111000000000000000000000000000011111111111000000000000000000000000000001111111111111111000000000000000000000000000000111111111100000000000000000000000000000111111111111111100000000000000000000000000000001111111110000000000000000000000000000111111111111111110000000000000000000000000000000011111111000000000000000000000000000011111111111111111000000000000000000000000000000000111111100000000000000000000000000011111111111111111000000000000000000000000000000000001111110000000000000000000000000011111111111111111100000000000000000000000000000000000011111000000000000000000000000011111111111111111110000000000000000000000000000000000000111100000000000000000000000111111111111111111110000000000000000000000000000000000000001110000000000000000000001111111111111111111111000000000000000000000000000000000000000010000000000000000000111111111111111111111111000000000000000000000000000000000000000000000000000000000001111111111111111111111111100000000000000000000000000000000000000000000000000000000000111111111111111111111111100000000000000000000000000000000000000000000000000000000000011111111111111111111111100000000000000000000000000000000000000000000000000000000000001111111111111111111111100000000000000000000000000000000000000000000000000000000000000111111111111111111111110000000000000000000000000000000000000000000000000000000000000011111111111111111111110000000000000000000000000000000000000000000000000000000000000001111111111111111111110000000000000000000000000000000000000000000000000000000000000000111111111111111111110000000000000000000000000000000000000000000000000000000000000000011111111111111111100000000000000000000000000000000000000000000000000000000000000000001111111111111111100000000000000000000000000000000000000000000000000000000000000000000111111111111111000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000001111111111100000000000000000000000000000000000000000000000000000000000000000000000000111111111000000000000000000000000000000000000000000000000000000000000000000000000000011111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004";

   game.loadDataFromString(initialData);
   game.render();
}

function step()
{
   if (game.status !== GameStatus.PLAYING)
   {
      return pause();
   }

   let vai_pra_onde;

   if (isFollowingPath)
   {
      if (pathToFollow.length === 0)
      {
         return pause();
      }

      vai_pra_onde = pathToFollow.shift();
   }
   else
   {
      // copy elements
      let node = {
         player: [...game.player],
         data: game.data.map(row => [...row]),
         path: [...game.path],
         moveList: [...game.moveList],
         parentNode: previousNode,
         move: null,
      };

      // init cache
      let key = game.path.join(',');
      attemptedMoves[key] = attemptedMoves[key] || [];

      // vai_pra_onde = ['D', 'R'][Math.floor(Math.random() * 2)];
      vai_pra_onde = PathFinder.predictNextMove(game.player, game.goal, game.data, game.rows, game.cols, attemptedMoves[key]);

      if (vai_pra_onde)
      {
         node.move = vai_pra_onde;
         attemptedMoves[key].push(vai_pra_onde);
         previousNode = node;
      }
      else
      {
         let newCurrent = node.parentNode;

         if (newCurrent)
         {
            // go back to the past
            previousNode = newCurrent.parentNode;

            // copy elements from node to the game
            game.player = [...newCurrent.player];
            game.data = newCurrent.data.map(row => [...row]);
            game.path = [...newCurrent.path];
            game.moveList = [...newCurrent.moveList];

            // console.log("Go back to: ", game.player);

            return game.render();
         }
         else
         {
            // no more moves
            game.status = GameStatus.LOSE;
            game.render();
            return pause();
         }
      }
   }

   game.move(vai_pra_onde);
   // console.log("Move to: ", game.player);
   game.render();
}

function play()
{
   if (interval)
   {
      return;
   }
   interval = setInterval(step, delay);
}

function pause()
{
   if (interval)
   {
      clearInterval(interval);
      interval = null;
   }
}

function test_path()
{
   reset();
   isFollowingPath = true;
   // pathToFollow = ["D", "R", "R", "R", "R", "D", "R", "D", "R", "R", "R", "D", "R", "R", "R", "D", "D", "R", "D", "D", "R", "R", "D", "R", "D", "L", "D", "D", "D", "L", "R", "D", "R", "R", "U", "R", "R", "D", "D", "L", "U", "D", "D", "R", "L", "L", "D", "R", "L", "R", "U", "R", "D", "D", "R", "D", "L", "L", "D", "L", "D", "L", "U", "R", "R", "D", "R", "D", "R", "R", "R", "D", "L", "D", "R", "D", "R", "U", "D", "D", "R", "R", "U", "D", "R", "L", "R", "L", "U", "R", "R", "L", "D", "L", "R", "R", "R", "L", "D", "R", "U", "L", "D", "L", "U", "R", "R", "D", "D", "R", "R", "R", "D", "D", "R", "D", "D", "R", "R", "R", "L", "D", "R", "R", "L", "D", "L", "D", "R", "R", "R", "R", "D", "R", "R", "D", "D", "R", "D", "R", "L", "U", "R", "L", "D", "D", "L", "D", "L", "U", "D", "U", "R", "D", "D", "D", "D", "D", "R", "L", "D", "L", "D", "R", "D", "R", "D", "R", "R", "R", "D", "D", "L", "R", "D", "R", "D", "R", "U", "R", "R", "D", "L", "R", "R", "D", "L", "L", "R", "R", "D", "L", "D", "R", "R", "D", "D", "R", "D", "D", "D", "R", "L", "R", "D", "R", "R", "L", "R", "R", "L", "R", "R", "R", "R", "U", "R", "L", "L", "R", "R", "D", "U", "L", "R", "U", "U", "D", "R", "D", "D", "D", "U", "R", "D", "R", "D", "L", "R", "R", "R", "R", "R", "R", "R", "U", "D", "L", "L", "U", "L", "D", "R", "R", "L", "L", "R", "R", "U", "D", "R", "R", "R", "R", "R", "R", "U", "R", "R", "D", "R", "R", "R", "R", "L", "R", "L", "R", "L", "R", "U", "D", "R", "R", "R", "R", "R", "R"];
   pathToFollow = ["R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","D","R","R","R","L","L","U","D","D","L","R","R","R","R","D","U","L","U","D","D","R","R","R","U","D","R","D","R","U","D","R","D","U","R","D","D","D","R","R","R","R","U","D","R","D","D","R","D","D","L","D","D","R","U","R","D","L","D","L","R","U","D","D","L","D","R","D","R","U","U","R","D","D","D","L","D","R","D","U","D","R","U","R","U","D","R","L","D","R","U","D","D","R","U","D","R","U","D","L","R","R","R","U","D","U","D","U","L","R","U","D","D","D","D","L","D","R","L","L","R","R","D","D","R","R","R","D","L","D","D","D","L","R","D","R","D","L","D","R","D","R","D","D","L","L","U","U","R","L","D","L","R","D","R","D","L","D","R","D","L","D","L","U","D","R","D","L","U","R","R","R","D","R","R","R","L","R","R","U","D","L","L","R","R","L","L","R","L","L","U","L","D","R","R","L","U","D","D","L","R","R","R","R","L","R","U","R","D","R","U","L","U","U","R","R","R","R","R","L","D","D","R","R","R","D","R","U","D","R","R","R","R","L","R","D","U","R","R","R","D","R","U","U","D","U","U","D","D","U","D","D","R","R","D","U","U","D","R","D","U","D","R","D","D","R","L","L","L","U","D","D","D","R","D","R","R","R","L","D","U","U","U","D","U","R","R","D","D","R","D","U","U","R","R","U","D","D","D","D","R","R","R","U","D","L","R","L","D","D","D","D","D","D","D","L","D","L","D","D","L","D","D","R","D","U","R","L","U","R","R","R","U","L","R","D","L","L","R","L","U","U","U","R","R","L","R","U","U","D","R","R","U","D","D","L","R","L","D","D","U","L","U","R","D","D","D","R","D","D"];
}

reset();