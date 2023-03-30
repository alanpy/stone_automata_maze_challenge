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
      this.status = GameStatus.PLAYING;
      this.rows = rows;
      this.cols = cols;
      this.data = [];
      this.start = null;
      this.player = null;
      this.goal = null;
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

            if (this.data[i][j] === 3)
            {
               this.start = [i, j];
               this.player = [i, j];
            }

            if (this.data[i][j] === 4)
            {
               this.goal = [i, j];
            }
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
            let greenNeighbors = 0;

            greenNeighbors += (i > 0 && j > 0) ? data[i - 1][j - 1] == 1 : 0;
            greenNeighbors += (i > 0) ? data[i - 1][j] == 1 : 0;
            greenNeighbors += (i > 0 && j < cols - 1) ? data[i - 1][j + 1] == 1 : 0;
            greenNeighbors += (j > 0) ? data[i][j - 1] == 1 : 0;
            greenNeighbors += (j < cols - 1) ? data[i][j + 1] == 1 : 0;
            greenNeighbors += (i < rows - 1 && j > 0) ? data[i + 1][j - 1] == 1 : 0;
            greenNeighbors += (i < rows - 1) ? data[i + 1][j] == 1 : 0;
            greenNeighbors += (i < rows - 1 && j < cols - 1) ? data[i + 1][j + 1] == 1 : 0;

            next[i].push(data[i][j]);

            // White cells turn green if they have a number of adjacent green cells greater than 1 and less than 5. Otherwise, they remain white.
            if (data[i][j] === 0)
            {
               next[i][j] = ((greenNeighbors > 1 && greenNeighbors < 5) ? 1 : 0);
            }

            // Green cells remain green if they have a number of green adjacent cells greater than 3 and less than 6. Otherwise they become white.
            if (data[i][j] === 1)
            {
               next[i][j] = ((greenNeighbors > 3 && greenNeighbors < 6) ? 1 : 0);
            }

            // No rules for yellow cells (start and end)
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
         console.error("invalid move");
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

      this.generateNextPopulation();
      this.testLoseCondition();
      this.testWinCondition();
      this.render();
   }

   testInvalidMove(direction)
   {
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
let pathToFollow = [];

// path finder
let previousNode = null;
let attemptedMoves = {};

function reset()
{
   pause();
   pathToFollow = [];
   previousNode = null;
   attemptedMoves = {};

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


   if (pathToFollow.length === 0)
   {
      return pause();
   }

   const direction = pathToFollow.shift();

   game.move(direction);
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
   // a found solucion
   pathToFollow = ["R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "D", "R", "R", "D", "R", "D", "R", "R", "R", "R", "R", "R", "R", "L", "D", "U", "R", "D", "U", "R", "D", "R", "D", "R", "D", "D", "D", "R", "D", "D", "R", "R", "D", "D", "R", "R", "D", "L", "L", "D", "R", "D", "D", "R", "D", "D", "R", "U", "R", "R", "D", "R", "L", "L", "D", "U", "R", "D", "R", "R", "R", "R", "R", "D", "D", "R", "R", "R", "R", "U", "D", "D", "R", "R", "U", "R", "U", "R", "R", "R", "R", "D", "L", "R", "R", "D", "U", "U", "U", "U", "R", "R", "R", "D", "D", "R", "U", "R", "R", "R", "R", "D", "R", "D", "D", "U", "D", "L", "U", "R", "D", "R", "U", "R", "D", "U", "U", "L", "D", "R", "D", "R", "D", "R", "U", "D", "U", "R", "R", "D", "R", "R", "R", "R", "R", "L", "L", "R", "R", "R", "D", "D", "D", "D", "R", "D", "L", "L", "D", "R", "R", "D", "R", "U", "R", "R", "R", "D", "D", "D", "R", "U", "R", "R", "D", "L", "U", "D", "D", "D", "R", "R", "D", "D", "D", "L", "L", "L", "L", "L", "R", "U", "D", "R", "R", "R", "L", "R", "D", "D", "D", "D", "U", "R", "D", "D", "D", "D", "D", "L", "D", "D", "D", "U", "L", "D", "R", "U", "R", "R", "R", "D", "R", "R", "L", "D", "D", "L", "D", "D", "R", "R", "U", "U", "D", "R", "R", "R", "L", "U", "R", "R", "D", "L", "D", "D", "L", "D", "D", "L", "R", "R", "R", "D", "D", "L", "R", "U", "U", "L", "L", "R", "D", "D", "D", "D", "U", "D", "R", "R"];
}

function find_path_using_aStar()
{
   reset();

   var path = aStar(game.start, game.goal, game.data, (prevData) => Game.calculateNextPopulation(prevData, game.rows, game.cols));

   if (path == null)
   {
      alert("No path found");
      return;
   }

   let game_path = [];
   let directions = [];
   let last = game.start;

   // transform the path into directions UP, DOWN, LEFT, RIGHT
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

      // used to render the path on the game board
      game_path.push('x:' + toRow + '_y:' + toCol);

   });

   console.log(directions.join(" "));

   // used to render the path on the game board
   game.path = game_path;
   game.render();

   // play the game over the path
   pathToFollow = directions;
   play();
}

reset();