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
      this.attemptedMoves = [];
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
            let liveNeighbors = 0;

            liveNeighbors += (i > 0 && j > 0) ? data[i - 1][j - 1] == 1 : 0;
            liveNeighbors += (i > 0) ? data[i - 1][j] == 1 : 0;
            liveNeighbors += (i > 0 && j < cols - 1) ? data[i - 1][j + 1] == 1 : 0;
            liveNeighbors += (j > 0) ? data[i][j - 1] == 1 : 0;
            liveNeighbors += (j < cols - 1) ? data[i][j + 1] == 1 : 0;
            liveNeighbors += (i < rows - 1 && j > 0) ? data[i + 1][j - 1] == 1 : 0;
            liveNeighbors += (i < rows - 1) ? data[i + 1][j] == 1 : 0;
            liveNeighbors += (i < rows - 1 && j < cols - 1) ? data[i + 1][j + 1] == 1 : 0;

            // next[i].push(data[i][j]);
            next[i].push(0);

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
            // next[i][j] = next[i][j] !== 3 && next[i][j] !== 4 ? 0 : next[i][j];
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

            if (this.attemptedMoves.includes('x:' + i + '_y:' + j))
            {
               cell.classList.add("attempted");
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

// path finder
let previousNode = null;
let attemptedMoves = {};

function reset()
{
   pause();
   isFollowingPath = false;
   pathToFollow = [];
   previousNode = null;
   attemptedMoves = {};

   game = new Game(65, 85);
   let initialData = "30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111000000000000000000000000000000000000000000000000000000000000000000000000000000001111111110000000000000000000000000000000000000000000000000000000000000000000000000000111111111110000000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000111111111111111110000000000000000000000000000000000000000000000000000000000000000000011111111111111111100000000000000000000000000000000000000000000000000000000000000000001111111111111111111100000000000000000000000000000000000000000000000000000000000000000111111111111111111111000000000000000000000000000000000000000000000000000000000000000011111111111111111111110000000000000000000000000000000000000000000000000000000000000001111111111111111111111100000000000000000000000000000000000000000000000000000000000000111111111111111111111110000000000000000000000000000000000000000000000000000000000000011111111111111111111111100000000000000000000000000000000000000000000000000000000000001111111111111111111111111000000000000000000000000000000000000000000000000000000000000111111111111111111111111110000000000000000000000000000000000000000010000000000000000000111111111111111111111111000000000000000000000000000000000000000011100000000000000000000011111111111111111111110000000000000000000000000000000000000011110000000000000000000000011111111111111111111000000000000000000000000000000000000011111000000000000000000000000011111111111111111110000000000000000000000000000000000011111100000000000000000000000000111111111111111111000000000000000000000000000000000011111110000000000000000000000000001111111111111111100000000000000000000000000000000011111111000000000000000000000000000011111111111111111000000000000000000000000000000011111111100000000000000000000000000001111111111111111100000000000000000000000000000011111111110000000000000000000000000000011111111111111110000000000000000000000000000011111111111000000000000000000000000000001111111111111111000000000000000000000000000011111111111100000000000000000000000000000011111111111111110000000000000000000000000011111111111110000000000000000000000000000001111111111111111000000000000000000000000011111111111111000000000000000000000000000000111111111111111100000000000000000000000011111111111111100000000000000000000000000000001111111111111110000000000000000000000001111111111111110000000000000000000000000000000111111111111111000000000000000000000000111111111111111000000000000000000000000000000011111111111111100000000000000000000000011111111111111100000000000000000000000000000001111111111111110000000000000000000000001111111111111110000000000000000000000000000000111111111111111000000000000000000000000011111111111111000000000000000000000000000000111111111111111100000000000000000000000000111111111111100000000000000000000000000000011111111111111110000000000000000000000000001111111111110000000000000000000000000000001111111111111111000000000000000000000000000011111111111000000000000000000000000000001111111111111111000000000000000000000000000000111111111100000000000000000000000000000111111111111111100000000000000000000000000000001111111110000000000000000000000000000111111111111111110000000000000000000000000000000011111111000000000000000000000000000011111111111111111000000000000000000000000000000000111111100000000000000000000000000011111111111111111000000000000000000000000000000000001111110000000000000000000000000011111111111111111100000000000000000000000000000000000011111000000000000000000000000011111111111111111110000000000000000000000000000000000000111100000000000000000000000111111111111111111110000000000000000000000000000000000000001110000000000000000000001111111111111111111111000000000000000000000000000000000000000010000000000000000000111111111111111111111111000000000000000000000000000000000000000000000000000000000001111111111111111111111111100000000000000000000000000000000000000000000000000000000000111111111111111111111111100000000000000000000000000000000000000000000000000000000000011111111111111111111111100000000000000000000000000000000000000000000000000000000000001111111111111111111111100000000000000000000000000000000000000000000000000000000000000111111111111111111111110000000000000000000000000000000000000000000000000000000000000011111111111111111111110000000000000000000000000000000000000000000000000000000000000001111111111111111111110000000000000000000000000000000000000000000000000000000000000000111111111111111111110000000000000000000000000000000000000000000000000000000000000000011111111111111111100000000000000000000000000000000000000000000000000000000000000000001111111111111111100000000000000000000000000000000000000000000000000000000000000000000111111111111111000000000000000000000000000000000000000000000000000000000000000000000011111111111110000000000000000000000000000000000000000000000000000000000000000000000001111111111100000000000000000000000000000000000000000000000000000000000000000000000000111111111000000000000000000000000000000000000000000000000000000000000000000000000000011111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004";

   // game = new Game(10, 10);
   // let initialData = "3000000000000000000000000000000000110000000011000000001100000000000000000000000000000000000000000004";

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
   game.attemptedMoves.push('x:' + game.player[0] + '_y:' + game.player[1]);
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
   // winners
   pathToFollow = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "D", "D", "R", "U", "L", "L", "R", "D", "L", "R", "R", "R", "R", "D", "U", "L", "U", "D", "R", "D", "R", "R", "U", "D", "R", "D", "R", "U", "D", "R", "D", "U", "R", "D", "D", "D", "R", "R", "R", "R", "U", "D", "R", "D", "D", "R", "D", "D", "L", "D", "D", "R", "U", "R", "D", "U", "R", "L", "D", "R", "D", "R", "R", "R", "U", "D", "U", "U", "L", "R", "U", "U", "U", "D", "D", "U", "R", "D", "D", "R", "R", "D", "D", "D", "R", "D", "R", "R", "L", "D", "D", "D", "D", "L", "R", "L", "D", "D", "U", "L", "R", "U", "R", "D", "D", "D", "R", "L", "D", "D", "U", "L", "L", "D", "U", "U", "L", "L", "R", "R", "R", "D", "D", "L", "R", "D", "D", "R", "U", "R", "R", "D", "D", "D", "R", "D", "D", "R", "D", "L", "D", "L", "L", "R", "U", "R", "U", "D", "R", "R", "D", "D", "R", "R", "U", "U", "D", "D", "D", "L", "D", "D", "R", "U", "L", "R", "D", "D", "U", "R", "U", "L", "U", "U", "L", "R", "R", "R", "D", "L", "L", "R", "D", "R", "R", "R", "U", "L", "R", "R", "D", "D", "L", "L", "D", "R", "R", "D", "R", "L", "D", "L", "D", "L", "R", "L", "R", "L", "R", "U", "D", "R", "R", "R", "U", "R", "D", "R", "R", "U", "D", "D", "L", "D", "D", "R", "U", "U", "L", "U", "L", "L", "U", "D", "D", "U", "R", "R", "L", "R", "D", "U", "R", "R", "D", "L", "R", "D", "R", "R", "U", "L", "R", "D", "D", "R", "D", "D", "L", "L", "D", "R", "U", "D", "R", "D", "U", "D", "D", "L", "L", "R", "D", "R", "L", "L", "L", "U", "L", "R", "R", "U", "D", "U", "R", "R", "L", "D", "U", "L", "L", "L", "L", "D", "R", "L", "R", "R", "R", "R", "R", "D", "D", "D", "U", "R", "R", "D", "L", "D", "L", "R", "R", "R", "U", "U", "U", "D", "R", "L", "R", "D", "D", "D", "U", "L", "L", "R", "R", "L", "D", "R", "U", "L", "R", "R", "D", "R", "D", "L", "U", "U", "R", "D", "D", "D", "R", "R", "D", "D", "L", "R", "R", "R", "D", "L", "R", "R", "L", "U", "U", "R", "D", "D", "L", "L", "D", "D", "D", "U", "D", "L", "R", "R", "L", "R", "L", "L", "D", "L", "D", "L", "R", "L", "U", "D", "U", "D", "L", "U", "U", "U", "L", "R", "R", "L", "R", "R", "D", "R", "R", "L", "R", "D", "L", "U", "L", "L", "R", "R", "L", "R", "R", "R", "R", "L", "R", "R", "D", "R", "R", "R", "R", "D", "R", "R"];
   pathToFollow = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "D", "U", "D", "U", "D", "D", "D", "R", "D", "L", "L", "R", "D", "R", "D", "D", "L", "D", "R", "R", "R", "R", "U", "R", "R", "D", "R", "R", "R", "D", "R", "R", "U", "R", "R", "R", "D", "D", "D", "D", "U", "D", "R", "D", "R", "U", "R", "U", "U", "U", "R", "U", "L", "R", "D", "R", "R", "R", "R", "U", "D", "D", "L", "D", "L", "R", "D", "D", "R", "D", "R", "R", "R", "R", "U", "R", "R", "U", "L", "R", "U", "R", "D", "R", "D", "R", "L", "L", "D", "U", "D", "L", "R", "R", "R", "R", "R", "R", "D", "R", "D", "R", "U", "R", "L", "D", "R", "U", "R", "R", "D", "L", "D", "D", "U", "U", "R", "R", "D", "L", "R", "R", "R", "R", "U", "R", "R", "R", "L", "R", "U", "U", "D", "D", "R", "U", "R", "D", "D", "U", "D", "R", "D", "L", "R", "D", "L", "R", "D", "D", "L", "U", "L", "D", "D", "R", "D", "R", "R", "R", "D", "R", "D", "R", "R", "U", "U", "D", "R", "D", "R", "R", "U", "D", "U", "D", "U", "D", "D", "D", "U", "D", "L", "R", "U", "D", "U", "D", "U", "D", "L", "U", "U", "L", "D", "L", "D", "D", "L", "R", "L", "L", "R", "U", "D", "D", "R", "U", "D", "L", "D", "R", "U", "R", "U", "U", "D", "R", "D", "D", "L", "R", "U", "R", "L", "U", "D", "D", "L", "D", "D", "D", "D", "R", "R", "D", "D", "L", "R", "D", "D", "D", "D", "D", "D", "D", "D", "D", "U", "U", "D", "U", "U", "D", "D", "D", "D", "D", "D", "D", "U", "D", "U", "D", "U", "L", "R", "U", "D", "U", "U", "D", "D", "U", "L", "R", "L", "R", "L", "R", "U", "D", "U", "L", "R", "D", "U", "D", "D", "D", "D", "L", "R", "U", "D", "D", "U", "D", "L", "R", "L", "R", "U", "U", "D", "U", "D", "U", "D", "U", "U", "U", "D", "U", "D", "L", "R", "U", "D", "U", "D", "U", "D", "D", "U", "L", "R", "D", "D", "L", "R", "U", "D", "D", "D", "L", "R", "U", "L", "D", "D", "D", "R", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"];
   pathToFollow = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "D", "U", "D", "U", "D", "D", "D", "R", "D", "L", "L", "R", "D", "R", "D", "D", "L", "D", "R", "R", "R", "R", "U", "R", "R", "D", "R", "R", "R", "D", "R", "R", "U", "R", "R", "R", "D", "D", "D", "D", "U", "D", "R", "D", "R", "U", "R", "U", "U", "U", "R", "U", "L", "R", "D", "R", "R", "R", "R", "U", "D", "D", "L", "D", "L", "R", "D", "D", "R", "D", "R", "R", "R", "R", "U", "R", "R", "U", "L", "R", "U", "R", "D", "R", "D", "R", "L", "L", "D", "U", "D", "L", "R", "R", "R", "R", "R", "R", "D", "R", "D", "R", "U", "R", "L", "D", "R", "U", "R", "R", "D", "L", "D", "D", "U", "U", "R", "R", "D", "L", "R", "R", "R", "R", "U", "R", "R", "R", "L", "R", "U", "U", "D", "D", "R", "U", "R", "D", "D", "U", "D", "R", "D", "L", "R", "D", "L", "R", "D", "D", "L", "U", "L", "D", "D", "R", "D", "R", "R", "R", "D", "R", "D", "R", "R", "U", "U", "D", "R", "D", "R", "R", "U", "D", "U", "D", "L", "R", "D", "D", "U", "D", "L", "R", "U", "D", "L", "R", "U", "D", "U", "L", "U", "L", "D", "L", "D", "D", "L", "R", "L", "L", "R", "U", "D", "D", "R", "L", "R", "L", "D", "R", "U", "R", "U", "U", "D", "R", "D", "D", "U", "D", "U", "R", "L", "U", "D", "D", "L", "D", "D", "D", "D", "R", "R", "D", "D", "L", "R", "D", "D", "D", "D", "D", "D", "D", "D", "D", "U", "U", "D", "U", "U", "D", "D", "D", "D", "D", "D", "D", "L", "R", "U", "D", "U", "L", "D", "D", "U", "D", "D", "R", "U", "L", "D", "L", "U", "L", "D", "D", "D", "R", "D", "D", "R", "R", "D", "D", "L", "D", "D", "D", "L", "D", "D", "D", "D", "R", "R"];
   pathToFollow = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "D", "U", "D", "U", "D", "D", "D", "R", "D", "L", "L", "R", "D", "R", "D", "D", "U", "R", "D", "D", "R", "R", "U", "R", "R", "D", "R", "R", "R", "D", "R", "R", "U", "R", "R", "R", "D", "D", "D", "D", "U", "D", "R", "D", "R", "U", "R", "U", "U", "U", "R", "U", "L", "R", "D", "R", "R", "R", "R", "U", "D", "D", "L", "D", "L", "R", "D", "D", "R", "D", "R", "R", "R", "R", "U", "R", "R", "U", "L", "R", "U", "D", "R", "R", "D", "R", "U", "U", "U", "L", "L", "L", "U", "L", "U", "L", "L", "L", "U", "R", "D", "R", "R", "D", "R", "D", "D", "D", "D", "L", "L", "D", "R", "D", "R", "U", "R", "U", "R", "U", "U", "D", "R", "R", "U", "U", "R", "D", "D", "L", "R", "D", "D", "L", "L", "D", "D", "R", "D", "L", "D", "R", "R", "U", "D", "R", "D", "R", "R", "R", "L", "D", "D", "R", "R", "D", "R", "R", "R", "U", "U", "R", "R", "D", "L", "U", "U", "U", "R", "U", "L", "D", "R", "D", "R", "R", "R", "R", "D", "U", "D", "R", "U", "D", "R", "R", "R", "R", "R", "R", "D", "D", "D", "R", "U", "R", "L", "U", "L", "D", "L", "D", "D", "D", "L", "D", "D", "L", "L", "U", "U", "D", "D", "D", "R", "U", "U", "D", "D", "D", "L", "R", "U", "R", "D", "R", "R", "D", "R", "D", "D", "D", "D", "R", "R", "D", "D", "L", "R", "D", "D", "D", "D", "D", "D", "D", "D", "D", "U", "U", "D", "U", "U", "D", "D", "D", "D", "D", "D", "D", "L", "R", "U", "D", "U", "L", "D", "D", "U", "D", "D", "R", "U", "L", "D", "L", "U", "L", "D", "D", "D", "R", "D", "D", "R", "R", "D", "D", "L", "D", "D", "D", "L", "D", "D", "D", "D", "R", "R"];
   pathToFollow = ["R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "D", "R", "D", "R", "L", "L", "L", "R", "R", "L", "R", "R", "R", "R", "D", "U", "L", "U", "D", "D", "R", "R", "R", "U", "D", "R", "D", "R", "U", "R", "D", "D", "U", "R", "D", "D", "D", "R", "R", "R", "R", "U", "R", "D", "D", "D", "R", "D", "D", "L", "R", "D", "R", "R", "D", "L", "L", "D", "L", "R", "U", "D", "R", "U", "R", "D", "R", "D", "D", "R", "L", "L", "D", "R", "R", "L", "U", "R", "R", "D", "U", "R", "D", "R", "U", "L", "D", "R", "L", "R", "D", "R", "R", "R", "L", "D", "D", "D", "D", "U", "L", "R", "U", "R", "D", "D", "R", "D", "U", "U", "D", "U", "R", "D", "U", "D", "R", "R", "L", "L", "U", "L", "L", "R", "U", "L", "D", "D", "D", "D", "D", "L", "D", "R", "R", "R", "R", "D", "D", "R", "R", "R", "D", "D", "R", "R", "R", "R", "U", "R", "L", "U", "R", "R", "D", "L", "R", "R", "R", "U", "L", "U", "D", "D", "D", "R", "U", "L", "D", "D", "D", "L", "U", "D", "R", "D", "R", "R", "L", "D", "R", "R", "D", "D", "R", "D", "D", "D", "L", "R", "R", "L", "L", "D", "R", "R", "R", "R", "D", "R", "R", "U", "U", "D", "R", "D", "R", "D", "U", "D", "D", "R", "U", "R", "D", "L", "D", "D", "R", "R", "R", "L", "D", "R", "D", "D", "R", "D", "R", "D", "U", "U", "L", "R", "D", "U", "R", "D", "U", "U", "D", "D", "L", "D", "D", "R", "U", "U", "U", "D", "D", "R", "D", "R", "R", "D", "U", "R", "D", "D", "L", "D", "D", "D", "D", "L", "U", "R", "D", "U", "R", "D", "D", "D", "R", "D", "D", "R", "D", "L", "D", "D", "R", "R", "R"];
   pathToFollow = ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "L", "D", "D", "D", "R", "D", "R", "U", "R", "D", "D", "D", "R", "L", "R", "D", "U", "D", "L", "R", "U", "D", "U", "R", "U", "R", "D", "R", "R", "R", "D", "R", "R", "R", "D", "L", "R", "D", "R", "U", "D", "R", "U", "U", "D", "D", "D", "D", "R", "R", "R", "U", "R", "L", "L", "D", "R", "R", "R", "D", "R", "R", "R", "D", "R", "U", "D", "L", "R", "R", "U", "R", "D", "R", "D", "D", "D", "U", "D", "L", "D", "D", "L", "D", "L", "R", "R", "U", "D", "D", "U", "L", "D", "D", "U", "D", "R", "D", "R", "R", "R", "R", "U", "D", "D", "U", "R", "R", "R", "R", "L", "D", "R", "R", "D", "D", "D", "R", "D", "D", "R", "D", "U", "D", "L", "U", "U", "U", "R", "D", "U", "L", "R", "U", "D", "R", "D", "D", "D", "L", "D", "D", "R", "D", "U", "R", "R", "R", "L", "D", "R", "R", "R", "D", "D", "U", "R", "U", "R", "D", "D", "U", "D", "R", "R", "D", "U", "R", "D", "U", "R", "R", "L", "D", "D", "R", "U", "D", "R", "R", "D", "R", "D", "D", "U", "U", "R", "R", "D", "L", "D", "R", "R", "U", "D", "L", "L", "D", "L", "U", "D", "U", "U", "R", "R", "R", "R", "R", "D", "R", "L", "U", "L", "R", "R", "D", "R", "U", "U", "L", "D", "D", "D", "U", "R", "D", "L", "U", "R", "L", "U", "D", "D", "R", "U", "D", "R", "D", "D", "R", "L", "R", "U", "L", "L", "U", "U", "U", "D", "L", "D", "L", "D", "L", "D", "R", "R", "L", "D", "L", "R", "L", "R", "R", "R", "D", "R", "D", "R", "U", "U", "R", "D", "R", "D", "R", "D", "D", "D", "R", "R", "R", "L", "R", "U", "R", "U", "L", "R", "D", "R", "R", "U", "U", "R", "R", "L", "L", "L", "R", "R", "U", "D", "R", "D", "R", "R", "D", "D", "R", "R", "R", "R", "R"];
   pathToFollow = ["R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "R", "R", "R", "R", "R", "R", "L", "D", "U", "R", "D", "U", "R", "D", "R", "D", "R", "D", "D", "D", "R", "D", "D", "R", "R", "D", "D", "R", "R", "D", "L", "L", "D", "R", "D", "D", "R", "D", "D", "R", "U", "R", "R", "D", "R", "U", "R", "U", "L", "R", "R", "U", "D", "R", "U", "R", "R", "R", "R", "R", "R", "R", "R", "D", "D", "R", "R", "R", "D", "D", "D", "R", "L", "R", "D", "L", "R", "R", "D", "U", "U", "U", "U", "R", "R", "R", "D", "D", "R", "U", "R", "R", "R", "R", "D", "R", "D", "D", "U", "D", "L", "U", "R", "D", "R", "U", "R", "D", "U", "U", "L", "D", "R", "D", "R", "D", "R", "U", "D", "U", "R", "R", "D", "R", "R", "R", "R", "R", "L", "L", "R", "R", "R", "D", "D", "D", "D", "R", "D", "L", "L", "D", "R", "R", "D", "R", "U", "R", "R", "R", "D", "D", "D", "R", "U", "R", "R", "D", "L", "U", "D", "D", "D", "R", "R", "D", "D", "D", "L", "L", "L", "L", "L", "R", "U", "D", "R", "R", "R", "L", "R", "D", "D", "D", "D", "U", "R", "D", "D", "D", "D", "D", "L", "D", "D", "D", "U", "L", "D", "R", "U", "R", "R", "R", "D", "R", "R", "L", "D", "D", "L", "D", "D", "R", "D", "D", "D", "U", "L", "D", "R", "U", "R", "U", "U", "R", "R", "R", "D", "L", "D", "D", "L", "R", "R", "R", "D", "D", "L", "R", "U", "U", "L", "L", "R", "D", "D", "D", "D", "U", "D", "R", "R"];
   pathToFollow = ["R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "R", "R", "R", "R", "R", "R", "L", "D", "U", "R", "D", "U", "R", "D", "R", "D", "R", "D", "D", "D", "R", "D", "D", "R", "R", "D", "D", "R", "R", "D", "L", "L", "D", "R", "D", "D", "R", "D", "D", "R", "U", "R", "R", "D", "R", "L", "L", "D", "U", "R", "D", "R", "R", "R", "R", "R", "D", "D", "R", "R", "R", "R", "U", "D", "D", "R", "R", "U", "R", "U", "R", "R", "R", "R", "D", "L", "R", "R", "D", "U", "U", "U", "U", "R", "R", "R", "D", "D", "R", "U", "R", "R", "R", "R", "D", "R", "D", "D", "U", "D", "L", "U", "R", "D", "R", "U", "R", "D", "U", "U", "L", "D", "R", "D", "R", "D", "R", "U", "D", "U", "R", "R", "D", "R", "R", "R", "R", "R", "L", "L", "R", "R", "R", "D", "D", "D", "D", "R", "D", "L", "L", "D", "R", "R", "D", "R", "U", "R", "R", "R", "D", "D", "D", "R", "U", "R", "R", "D", "L", "U", "D", "D", "D", "R", "R", "D", "D", "D", "L", "L", "L", "L", "L", "R", "U", "D", "R", "R", "R", "L", "R", "D", "D", "D", "D", "U", "R", "D", "D", "D", "D", "D", "L", "D", "D", "D", "U", "L", "D", "R", "U", "R", "R", "R", "D", "R", "R", "L", "D", "D", "L", "D", "D", "R", "R", "U", "U", "D", "R", "R", "R", "L", "U", "R", "R", "D", "L", "D", "D", "L", "D", "D", "L", "R", "R", "R", "D", "D", "L", "R", "U", "U", "L", "L", "R", "D", "D", "D", "D", "U", "D", "R", "R"];
   pathToFollow = ["R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "D", "R", "D", "R", "R", "D", "D", "U", "D", "D", "L", "R", "D", "D", "D", "R", "U", "R", "R", "U", "R", "R", "L", "R", "R", "D", "D", "R", "R", "D", "R", "D", "D", "R", "D", "D", "R", "D", "D", "R", "U", "R", "R", "D", "R", "U", "R", "U", "L", "R", "R", "U", "D", "D", "D", "D", "R", "U", "R", "D", "D", "D", "R", "D", "L", "U", "R", "D", "D", "U", "D", "R", "R", "L", "R", "U", "L", "D", "U", "R", "R", "D", "D", "R", "D", "R", "R", "D", "D", "D", "D", "D", "R", "U", "L", "R", "L", "D", "D", "D", "D", "R", "D", "R", "L", "L", "R", "D", "R", "U", "D", "U", "R", "U", "R", "D", "R", "R", "R", "R", "D", "U", "D", "D", "R", "D", "D", "L", "R", "D", "L", "D", "D", "L", "R", "U", "R", "R", "D", "R", "U", "U", "R", "R", "R", "R", "R", "D", "D", "R", "R", "R", "R", "U", "L", "L", "R", "U", "U", "R", "D", "D", "L", "D", "L", "U", "D", "R", "L", "D", "D", "D", "L", "U", "D", "D", "D", "U", "L", "R", "D", "D", "R", "D", "R", "U", "U", "R", "D", "R", "R", "R", "R", "D", "D", "R", "D", "R", "R", "R", "D", "D", "D", "L", "D", "R", "R", "U", "L", "R", "R", "L", "R", "D", "U", "D", "R", "D", "R", "U", "U", "U", "R", "R", "R", "U", "D", "R", "R", "D", "R", "L", "D", "R", "R", "R", "D", "D", "R", "R", "R", "U", "L", "L", "R", "D", "D", "D", "D", "U", "D", "R", "R"];

   // samuel
   // pathToFollow = ["R", "D", "D", "R", "D", "R", "D", "R", "D", "D", "R", "R", "R", "R", "R", "R", "R", "D", "R", "D", "R", "R", "R", "D", "D", "L", "D", "D", "D", "L", "R", "D", "D", "D", "R", "U", "D", "R", "L", "R", "D", "R", "D", "U", "D", "D", "R", "R", "R", "U", "R", "R", "L", "R", "R", "D", "R", "D", "D", "U", "D", "L", "R", "R", "D", "D", "U", "R", "R", "D", "U", "R", "R", "R", "D", "L", "U", "D", "U", "D", "R", "U", "D", "R", "R", "R", "U", "D", "R", "D", "U", "U", "D", "R", "R", "L", "D", "U", "D", "D", "R", "R", "D", "D", "D", "U", "D", "D", "R", "R", "L", "U", "R", "L", "U", "D", "R", "D", "D", "U", "D", "R", "D", "L", "D", "R", "D", "U", "R", "D", "U", "R", "D", "U", "D", "D", "D", "L", "U", "R", "R", "D", "R", "U", "D", "R", "U", "U", "R", "L", "L", "L", "R", "L", "D", "R", "R", "D", "U", "D", "L", "R", "D", "U", "D", "R", "U", "R", "R", "D", "R", "R", "D", "R", "R", "L", "U", "R", "D", "R", "U", "U", "D", "L", "L", "D", "R", "D", "L", "D", "R", "D", "R", "R", "D", "R", "R", "D", "L", "R", "R", "D", "D", "D", "R", "D", "R", "U", "U", "L", "U", "L", "L", "U", "D", "D", "R", "R", "D", "R", "L", "R", "D", "D", "D", "D", "D", "U", "U", "D", "D", "R", "R", "R", "R", "L", "D", "L", "R", "R", "D", "D", "D", "D", "R", "R", "D", "R", "D", "R", "D", "R", "D", "R", "D", "D", "L", "U", "R", "D", "L", "D", "D", "D", "R", "R", "R", "U", "R", "R", "D", "L", "R", "L", "R", "L", "R", "U", "D", "L", "L", "R", "U", "D", "L", "L", "R", "L", "R", "R", "U", "D", "L", "R", "L", "R", "R", "L", "U", "D", "L", "L", "R", "R", "L", "R", "U", "R", "U", "L", "R", "D", "R", "R", "U", "U", "R", "R", "L", "L", "L", "R", "R", "U", "R", "R", "D", "D", "R", "D", "R", "D", "R", "R", "R", "R"];

   // teste samuel
   // pathToFollow = ["R", "D", "D", "D", "L", "U", "D", "D", "D", "D", "D", "D", "D", "R", "R", "L", "R", "U", "R", "R", "R", "R", "D", "R", "R", "R"];
   // pathToFollow = ["D", "R", "D", "R", "L", "L", "D", "D", "D", "D", "D", "D", "D", "R", "R", "L", "R", "U", "R", "R", "R", "R", "R", "D", "R", "R"];
}

function test_aStar()
{
   reset();


   window.states = [];

   // add initial state
   window.states.push(game.data);

   var path = aStar(game.start, game.goal, (depth) =>
   {
      // return game.data;
      if (window.states.length <= depth)
      {
         // previous state
         let prevData = window.states[depth - 1];
         let nextData = Game.calculateNextPopulation(prevData, game.rows, game.cols);
         window.states.push(nextData);
      }

      return window.states[depth];
   });

   if (path == null)
   {
      console.log("No path found");
      return;
   }

   console.log("Path found: " + path);

   let game_path = [];
   let directions = [];
   let last = game.start;

   path.forEach((p) =>
   {
      let [fromRow, fromCol] = last;
      let [toRow, toCol] = p;

      if (toRow > fromRow)
      {
         directions.push("D");
      }
      else if (toRow < fromRow)
      {
         directions.push("U");
      }
      else if (toCol > fromCol)
      {
         directions.push("R");
      }
      else if (toCol < fromCol)
      {
         directions.push("L");
      }

      last = p;

      game_path.push('x:' + toRow + '_y:' + toCol);

   });

   game.path = game_path;
   console.log(directions);
   window.directions = directions;
   game.render();

   // reset();
   isFollowingPath = true;
   pathToFollow = directions;
   // play();
}

reset();