// opted to use a variation of the A* algorithm to solve the problem
function aStar(start, end, initialGrid, getNextGridCallback)
{
   // keep track of grids we've already seen
   const historicalGrids = [initialGrid];

   function getGridState(depth)
   {
      if (historicalGrids.length <= depth)
      {
         let nextGrid = getNextGridCallback(historicalGrids[depth - 1]);
         historicalGrids.push(nextGrid);
      }

      return historicalGrids[depth];
   }

   // Define the node class
   class Node
   {
      constructor(state, parent, gScore)
      {
         // array with 3 elements: [row, col, depth]
         // depth is the number of grids we've traversed
         // this is used to allow going back in time (to previous grids) and get a better path
         this.state = state;

         this.parent = parent;
         this.gScore = gScore;

         // add wheigths to the heuristic to make the algorithm more efficient
         // a higher weight will make to explore less nodes, but if the weight is too high
         // the algorithm will not find the optimal path
         this.fScore = this.gScore + (heuristic(this) * 3);
      }
   }

   function heuristic(node)
   {
      let [row, col] = node.state;
      let [endRow, endCol] = end;
      let [startRow, startCol] = start;

      // Manhattan distance
      // return Math.abs(row - endRow) + Math.abs(col - endCol);

      // Cross line tie breaker to optimize the number of turns and get a more straight line (natural path)
      let dx1 = Math.abs(row - endRow);
      let dy1 = Math.abs(col - endCol);
      let dx2 = Math.abs(startRow - endRow);
      let dy2 = Math.abs(startCol - endCol);
      let cross = Math.abs(dx1 * dy2 - dx2 * dy1);
      return (dx1 + dy1) + (cross * 0.001);
   }

   function getCost(current, neighbor)
   {
      // allways move 1 space per turn
      return 1;
   }

   function compareArrays(a, b)
   {
      return a.length === b.length && a.every((v, i) => v === b[i]);
   }

   function getNeighbors(state, gridState)
   {
      let neighbors = [];
      let [row, col, depth] = state;

      // Check the left neighbor
      if (col > 0 && gridState[row][col - 1] !== 1)
      {
         neighbors.push([row, col - 1, depth + 1]);
      }

      // Check the right neighbor
      if (col < gridState[0].length - 1 && gridState[row][col + 1] !== 1)
      {
         neighbors.push([row, col + 1, depth + 1]);
      }

      // Check the top neighbor
      if (row > 0 && gridState[row - 1][col] !== 1)
      {
         neighbors.push([row - 1, col, depth + 1]);
      }

      // Check the bottom neighbor
      if (row < gridState.length - 1 && gridState[row + 1][col] !== 1)
      {
         neighbors.push([row + 1, col, depth + 1]);
      }

      return neighbors;
   }

   let count = 0;

   // Initialize the open and closed sets
   let openSet = [new Node([...start, 0], null, 0)];
   let closedSet = [];

   // Search for the path
   while (openSet.length > 0)
   {
      count++;

      // Get the current node (you can use binary heap here to fasten the search)
      let current = openSet.reduce((a, b) => (a.fScore < b.fScore) ? a : b);

      // Check if we've reached the target node
      if (current.state[0] === end[0] && current.state[1] === end[1])
      {
         let path = [];
         while (current !== null)
         {
            path.push(current.state);
            current = current.parent;
         }
         console.log('Iteraction count: ', count);
         return path.reverse();
      }

      // prevent long running searches
      if (count > 50000)
      {
         console.error("Reached max allowed iterations");
         return null;
      }

      // Get the next grid state
      let gridState = getGridState(current.state[2] + 1);

      // Get the neighbors
      let neighbors = getNeighbors(current.state, gridState);

      // Check the neighbors
      for (let neighbor of neighbors)
      {
         // Calculate the tentative g score
         let tentativeGScore = current.gScore + getCost(current.state, neighbor);

         // Check if the neighbor is already in the closed set
         if (closedSet.some(node => compareArrays(node.state, neighbor)))
         {
            continue;
         }

         // Check if the neighbor is already in the open set
         let openNode = openSet.find(node => compareArrays(node.state, neighbor));
         if (openNode === undefined)
         {
            openSet.push(new Node(neighbor, current, tentativeGScore));
         } else if (tentativeGScore < openNode.gScore)
         {
            openNode.gScore = tentativeGScore;
            openNode.parent = current;
         }
      }

      // Move the current node to the closed set
      openSet = openSet.filter(node => !compareArrays(node.state, current.state));
      closedSet.push(current);
   }

   // No path was found
   return null;
}