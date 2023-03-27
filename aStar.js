function aStar(start, end, getGridState)
{
   // Define the node class
   class Node
   {
      constructor(state, parent, gScore)
      {
         this.state = state;
         this.parent = parent;
         this.gScore = gScore;
         this.fScore = this.gScore + (heuristic(this) * 5);
      }
   }

   function heuristic(node)
   {
      let [row, col] = node.state;
      let [endRow, endCol] = end;
      let [startRow, startCol] = start;

      // Manhattan distance
      // return Math.abs(row - endRow) + Math.abs(col - endCol);

      // Euclidean distance
      // return Math.sqrt((row - endRow) ^ 2 + (col - endCol) ^ 2);

      // Cross line tie breaker
      let dx1 = Math.abs(row - endRow);
      let dy1 = Math.abs(col - endCol);
      let dx2 = Math.abs(startRow - endRow);
      let dy2 = Math.abs(startCol - endCol);
      let cross = Math.abs(dx1 * dy2 - dx2 * dy1)
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
   let nodeCount = 0;

   // Initialize the open and closed sets
   let openSet = [new Node([...start, 0], null, 0)];
   let closedSet = [];

   // Search for the path
   while (openSet.length > 0)
   {
      // debugger;
      count++;

      // Get the current node
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
         console.log('count', count, 'nodeCount', nodeCount);
         return path.reverse();
      }

      // print current path
      if (true)
      {

      }

      // prevent long running searches
      if (count > 100000)
      {
         console.log('count > 100.000', 'current', current);

         let game_path = [];
         let temp = current;
         while (temp !== null)
         {
            let row = temp.state[0];
            let col = temp.state[1];

            game_path.push('x:' + row + '_y:' + col);
            temp = temp.parent;
         }
         game.path = game_path.reverse();

         // print closed set
         game.attemptedMoves = [];
         for (let node of closedSet)
         {
            let row = node.state[0];
            let col = node.state[1];
            game.attemptedMoves.push('x:' + row + '_y:' + col);
         }

         // for (let node of openSet)
         // {
         //    let row = node.state[0];
         //    let col = node.state[1];
         //    game.attemptedMoves.push('x:' + row + '_y:' + col);
         // }

         game.render();

         break;
      }

      // console.log('count', count, 'current', current.state);

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
            nodeCount++;
         } else if (tentativeGScore < openNode.gScore)
         {
            openNode.gScore = tentativeGScore;
            openNode.parent = current;
            nodeCount++;
         }
      }

      // Move the current node to the closed set
      openSet = openSet.filter(node => !compareArrays(node.state, current.state));
      closedSet.push(current);

      // debugger;

      // let _data = game.data;
      // game.data = gridState;

      // let game_path = [];
      // let temp = current;
      // while (temp !== null)
      // {
      //    let row = temp.state[0];
      //    let col = temp.state[1];

      //    game_path.push('x:' + row + '_y:' + col);
      //    temp = temp.parent;
      // }
      // game.path = game_path.reverse();
      // game.player = [current.state[0], current.state[1]];

      // // // print closed set
      // // game.attemptedMoves = [];
      // // for (let node of closedSet)
      // // {
      // //    let row = node.state[0];
      // //    let col = node.state[1];
      // //    game.attemptedMoves.push('x:' + row + '_y:' + col);
      // // }

      // game.render();
      // game.data = _data;
   }

   // No path was found
   return null;
}