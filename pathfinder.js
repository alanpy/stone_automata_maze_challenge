class PathFinder
{
   constructor()
   {
      this.path = [];
   }

   static predictNextMove(currentPosition, targetPosition, data, rows, cols, attemptedMoves)
   {
      data = Game.calculateNextPopulation(data, rows, cols);

      let priorityQueue = new RandomPriorityQueue();

      let [c_row, c_col] = currentPosition;

      // can move up
      let row = c_row - 1;
      let col = c_col;
      if (row >= 0 && data[row][col] !== 1)
      {
         let cost = PathFinder.calculateCost([row, col], targetPosition, 'U');

         if (attemptedMoves.indexOf('U') === -1)
         {
            priorityQueue.enqueue(cost, 'U');
         }
      }

      // can move down
      row = c_row + 1;
      col = c_col;
      if (row < rows && data[row][col] !== 1)
      {
         let cost = PathFinder.calculateCost([row, col], targetPosition, 'D');

         if (attemptedMoves.indexOf('D') === -1)
         {
            priorityQueue.enqueue(cost, 'D');
         }
      }

      // can move left
      row = c_row;
      col = c_col - 1;
      if (col >= 0 && data[row][col] !== 1)
      {
         let cost = PathFinder.calculateCost([row, col], targetPosition, 'L');

         if (attemptedMoves.indexOf('L') === -1)
         {
            priorityQueue.enqueue(cost, 'L');
         }
      }

      // can move right
      row = c_row;
      col = c_col + 1;
      if (col < cols && data[row][col] !== 1)
      {
         let cost = PathFinder.calculateCost([row, col], targetPosition, 'R');

         if (attemptedMoves.indexOf('R') === -1)
         {
            priorityQueue.enqueue(cost, 'R');
         }
      }

      // No more moves
      if (priorityQueue.isEmpty())
      {
         return false;
      }

      return priorityQueue.dequeue();
   }

   static calculateCost(p1, p2, direction)
   {
      // let weights = {
      //    'U': 30,
      //    'R': 10,
      //    'D': 20,
      //    'L': 40,
      // };
      // return weights[direction];

      let deltaRow = Math.abs(p1[0] - p2[0]);
      let deltaCol = Math.abs(p1[1] - p2[1]);

      // debugger;

      // plus 25% to force diagonal movement
      if (direction === 'D' && deltaRow > deltaCol)
      {
         return deltaCol + deltaRow * 0.25;
      }

      if (direction === 'R' && deltaCol > deltaRow)
      {
         return deltaCol * 0.25 + deltaRow;
      }

      // otherwise, just return the sum of the deltas
      return deltaCol + deltaRow;
   }
}

class RandomPriorityQueue
{
   constructor()
   {
      this.queue = {};
   }

   enqueue(priority, item)
   {
      if (!this.queue[priority])
      {
         this.queue[priority] = [];
      }

      this.queue[priority].push(item);
   }

   dequeue()
   {
      let priority = Object.keys(this.queue).sort((a, b) =>
      {
         a = parseInt(a);
         b = parseInt(b);

         if (a < b)
         {
            return -1;
         }
         else if (a > b)
         {
            return 1;
         }

         return 0;
      })[0];

      let items = this.queue[priority];
      let idx = Math.floor(Math.random() * items.length);
      let item = items[idx];
      items.splice(idx, 1);

      if (this.queue[priority].length === 0)
      {
         delete this.queue[priority];
      }

      return item;
   }

   isEmpty()
   {
      return Object.keys(this.queue).length === 0;
   }

   toArray()
   {
      let array = [];

      while (!this.isEmpty())
      {
         array.push(this.dequeue());
      }

      return array;
   }
}