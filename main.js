import {Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

//create frames
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

//create fruits
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

//Control Key 선언
window.onkeydown = (event) => {
  //if disableAction = true일 때(막혀있다면) 실행을 하지 않는다.
  if (disableAction) {
    return;
  }
  switch(event.code) {
    case "KeyA":
      //when user wanna fruitPicker smooth to move => use SetInterval
      //아래 코드로 실행하면 5초동안 자동으로 키방향쪽으로 움직이게 됨
      if (interval)
        return;
      interval = setInterval(()=>{
        if(currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 1,
          y: currentBody.position.y,
        })
      }, 5)
      break;

    case "KeyD":
      if(interval)
        return;

      interval = setInterval(()=>{
        if(currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        })
      }, 5)
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      //과일생성 1초(1000) delay
      setTimeout( () => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

//누르고 있던 키에서 손가락을 떼면
//자동으로 움직이고 있던 fruitPicker을 멈춤
window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      //5초마다 반복되고 있던 interval을 삭제
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      //if there is watermelon(suika), Stop the game
      if(index === FRUITS.length - 1) {
        return;
      }

      //when a fruit is Combine with same another one, remove them 
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      //new fruit after same fruits is combined
      const newBody = Bodies.circle(
        //save the location when fruits is combined
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        },
      )

      World.add(world, newBody);

      //condition of Win the Game
      if(newFruit === FRUITS.length - 1)
        num_suika++;

      if(num_suika === 2)
      {
        alert('Game Win');
        return;
      }
    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine"))
    alert("Game over");
  });
})

addFruit();