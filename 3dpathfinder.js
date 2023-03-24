class AStarPathFinder3D
{
   constructor(grid, startNode, goalNode)
   {
      this.grid = grid;
      this.startNode = startNode;
      this.goalNode = goalNode;
      this.openList = [];
      this.closedList = [];
      this.path = [];

      this.startNode.g = 0;
      this.startNode.h = this.heuristic(this.startNode, this.goalNode);
      this.startNode.f = this.startNode.g + this.startNode.h;

      this.openList.push(this.startNode);
   }

   findPath()
   {
      while (this.openList.length > 0)
      {
         const currentNode = this.lowestFScoreNode();
         if (currentNode === this.goalNode)
         {
            this.path = this.backtrackPath(currentNode);
            return this.path;
         }

         this.removeNodeFromOpenList(currentNode);
         this.addNodeToClosedList(currentNode);

         const neighbors = this.getNeighbors(currentNode);
         for (let i = 0; i < neighbors.length; i++)
         {
            const neighbor = neighbors[i];
            const tentativeGScore = currentNode.g + this.getDistance(currentNode, neighbor);
            if (tentativeGScore < neighbor.g)
            {
               neighbor.parent = currentNode;
               neighbor.g = tentativeGScore;
               neighbor.h = this.heuristic(neighbor, this.goalNode);
               neighbor.f = neighbor.g + neighbor.h;
               if (!this.nodeInOpenList(neighbor))
               {
                  this.addNodeToOpenList(neighbor);
               }
            }
         }
      }

      return null;
   }

   lowestFScoreNode()
   {
      let lowestNode = this.openList[0];
      for (let i = 0; i < this.openList.length; i++)
      {
         if (this.openList[i].f < lowestNode.f)
         {
            lowestNode = this.openList[i];
         }
      }
      return lowestNode;
   }

   nodeInOpenList(node)
   {
      return this.openList.includes(node);
   }

   addNodeToOpenList(node)
   {
      this.openList.push(node);
   }

   removeNodeFromOpenList(node)
   {
      const index = this.openList.indexOf(node);
      this.openList.splice(index, 1);
   }

   addNodeToClosedList(node)
   {
      this.closedList.push(node);
   }

   getNeighbors(node)
   {
      const neighbors = [];
      const x = node.x;
      const y = node.y;
      const z = node.z;

      // Check adjacent nodes
      for (let i = -1; i <= 1; i++)
      {
         for (let j = -1; j <= 1; j++)
         {
            for (let k = -1; k <= 1; k++)
            {
               if (i === 0 && j === 0 && k === 0) continue;

               const nx = x + i;
               const ny = y + j;
               const nz = z + k;

               if (this.grid.isInside(nx, ny, nz) && !this.grid.isBlocked(nx, ny, nz))
               {
                  neighbors.push(this.grid.getNode(nx, ny, nz));
               }
            }
         }
      }

      return neighbors;
   }

   getDistance(node1, node2)
   {
      // Euclidean distance in 3D space
      const dx = node1.x - node2.x;
      const dy = node1.y - node2.y;
      const dz = node1.z - node2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
   }

   heuristic(node1, node2)
   {
      // Euclidean distance in 3D space
      const dx = Math.abs(node1.x - node2.x);
      const dy = Math.abs(node1.y - node2.y);
      const dz = Math.abs(node1.z - node2.z);
      const diagonal = Math.min(dx, dy, dz);
      const straight = dx + dy + dz - 2 * diagonal;
      const sqrt3 = Math.sqrt(3);
      const sqrt2 = Math.sqrt(2);
      return (sqrt3 - sqrt2) * diagonal + (sqrt2 - 1) * straight;
   }
}
