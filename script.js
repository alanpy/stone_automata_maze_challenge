const GameStatus = {
   PLAYING: "playing",
   WIN: "win",
   LOSE: "lose",
}

let game;
let interval;
let delay = 100;
let pathToFollow = [];

function find_path_using_aStar()
{
   reset();

   // opted to use a variation of the A* algorithm to solve the problem
   // this keeps track of the grids we've already seen and allows us to go back in time (to previous grids)
   // and get a better path in a deterministic way
   var path = aStar(game.start, game.goal, game.data, (prevData) => Game.calculateNextPopulation(prevData, game.rows, game.cols));

   if (path == null)
   {
      alert("No path found");
      return;
   }

   // transform the path into directions UP, DOWN, LEFT, RIGHT
   let directions = [];

   // used to render the path on the game board
   let game_path = [];
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

// A game implementation to test the path finding algorithm
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

            // copy current state to next state
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

function reset()
{
   pause();
   pathToFollow = [];

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

reset();