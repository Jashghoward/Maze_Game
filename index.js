// const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

// const width = 800;
// const height = 600;

// const engine = Engine.create();
// const { world } = engine;
// const render = Render.create({
//   element: document.body,
//   engine: engine,
//   options: {
//     wireframes: false,
//     width,
//     height
//   }
// });
// Render.run(render);

// Runner.run(Runner.create(), engine);

// World.add(world, MouseConstraint.create(engine, {
//   mouse: Mouse.create(render.canvas)
// }))

// // Walls
// const walls = [
//   Bodies.rectangle(20, 0, 800, 2, {
//     isStatic: true
//   }),
//   Bodies.rectangle(20, 600, 800, 2, {
//     isStatic: true
//   }),
//   Bodies.rectangle(0, 300, 2, 600, {
//     isStatic: true
//   }),
//   Bodies.rectangle(800, 300, 2, 600, {
//     isStatic: true
//   })
// ];

// World.add(world, walls)

// // Random Shapes

// for (let i = 0; i < 50; i++) {
//   if (Math.random() > 0.5) {
//     World.add(
//       world, 
//       Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
//       );
//   } else {
//     World.add (
//       world,
//       Bodies.circle(Math.random() * width, Math.random() * height, 35, {
//         render: {
//           fillStyle: 'rgb(255, 56, 78)'
//         }
//       })
//     );
//   }
// }



// MAZE

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 20;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;



const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const engine = Engine.create();

// Gravity toggle
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,  
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  //Top
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true
  }),
  //Bottom
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true
  }),
  //Left
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true
  }),
  //Right
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true
  })
];

World.add(world, walls)

// Maze Generation
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

// const grid = [];

// for (let i = 0; i < 3; i++) {
//   grid.push([])
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false);
//   }
// }

// Below is the same as above

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// The algorithm
const stepThroughCell = (row, column) => {
  // If i have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbours
  const neighbours = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column -1, 'left']
  ]);

  // For each neighbour....
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;
  
  // 1. See if tha neighbour is out of bounds
    if ( nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
      continue;
    }

  // 2. If we have visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

  // Remove a wall from either horizontals of verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if ( direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn)
  }

  // Visit that next cell
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row .forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      // Center of rectangle in the x direction
      columnIndex * unitLengthX + unitLengthX / 2,

      // Center point of the rectangle in the y direction
      rowIndex * unitLengthY + unitLengthY,

      // Length of the rectangle in the x direction
      unitLengthX,
      5,
      { 
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'rgb(253, 103, 58)'
        }
      }
    );
    World.add(world, wall)
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,

      // Height of the rectangle
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'rgb(250, 104, 60)'
        }
      }
    );
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'rgb(101, 209, 79)'
    }
  }
);
World.add(world, goal);


// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  // X and Y center points of the circle
  unitLengthX / 2,
  unitLengthY / 2,

  // Radius of the circle
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle: 'rgb(255, 128, 102)'
    }
  }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Win Condition
Events.on(engine, 'collisionStart', (event)  => {
  event.pairs.forEach(collision => {
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) && 
      labels.includes(collision.bodyB.label)
      ) {
        document.querySelector('.winner').classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach(body => {
          if(body.label === 'wall') {
            Body.setStatic(body, false);
          }
        });
    }
  });
});


