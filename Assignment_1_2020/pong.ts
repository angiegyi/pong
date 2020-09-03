import { fromEvent,interval, Observable} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, subscribeOn } from 'rxjs/operators';

//define constants 
const 
  Constants = new class {
    readonly CanvasSize = 600; 
  }

//define classes
class Velocity { constructor(public readonly on:boolean) {} }
  
//define types
type Ball = Readonly<{
  cx: number;
  cy: number;
  r: number;
  fill: string; 
  velocity: number;
  object: Element; 
}>

type Paddle = Readonly<{
  x: number;
  y: number;
  height: number; 
  width: number; 
  object: Element; 
}>

type Game = Readonly<{
  score1: number;
  score2: number;
  maxScore: number;
  paddle1: Paddle;
  paddle2: Paddle; 
  ball: Ball; 
}>

function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  

    const initalGameState: Game = { 
      score1: 0,
      score2: 0,
      maxScore: 7, 
      paddle1: createPaddle(10, 230),
      paddle2: createPaddle(580, 230),
      ball: createBall()
    }
    console.log(initalGameState.score1)

   function createBall(): Ball {
    const canvas = document.getElementById("canvas"); 
     return {
       cx: 300,
       cy: (Constants.CanvasSize / 2),
       r: 10,
       fill: "white",
       velocity: 3,
       object: document.createElementNS(canvas.namespaceURI, "circle")
     }
   }
   
   function createPaddle(xcoord: number, ycoord: number): Paddle { 
     const canvas = document.getElementById("canvas"); 
     return {
     x: xcoord,
     y: ycoord, 
     height: 120, 
     width: 10, 
     object: document.createElementNS(canvas.namespaceURI, "rect")
     }
   }
   
   function setView(): void { 
    const canvas = document.getElementById("canvas");
     canvas.appendChild(initalGameState.paddle1.object)
     canvas.appendChild(initalGameState.ball.object)
   }

   Object.entries({
    x: 100, y: 70,
    width: 120, height: 80,
    fill: '#95B3D7',
  }).forEach(([key,val])=>rect.setAttribute(key,String(val)))
  svg.appendChild(rect);

   setView()

  //observable1 -> moving left paddle triggered by the up/down arrow keys
  const paddleMovement = fromEvent<KeyboardEvent>(document, 'keydown')
    .pipe(
      filter(({code})=>code === 'ArrowDown' || code === 'ArrowUp'),
      filter(({repeat})=>!repeat),
      flatMap(d=>interval(10).pipe(
        takeUntil(fromEvent<KeyboardEvent>(document, 'keyup').pipe(
          filter(({code})=>code === d.code)
        )),
        map(_=>d))
      ),
      map(({code})=>code==='ArrowDown'?1:-1),
      scan(movePaddle, initalGameState.paddle1))
  paddleMovement.subscribe(updateState);
}

/***
 * Moves the paddle 
 */
function movePaddle(s: Paddle, step:number): Paddle { 
  return { ...s, y: s.y + step}
}

/***
 * updates the view of the game for the user
 */
function updateState(state: Paddle): void { 
  //update the paddle
  const paddle = document.getElementById("paddle1");
  paddle.setAttribute("y", state.y.toString());
}

/**
 * Main function for controlling the game
 */
// function execute() {
//   const paddle1 = document.getElementById("paddle1");
//   const paddle2 = document.getElementById("paddle2")!;
//   const boundary = Constant.canvas.getBoundingClientRect();
  
//   //time for the game 
//   const gameTime = interval(1000)
//   //getting the x-y coord of the ball 
//   const ballCoord = gameTime.pipe(map(() => (({x: Number(ball.getAttribute("cx")), y: Number(ball.getAttribute("cy"))}))));
//   console.log(ballCoord);
// }

  // the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
  }


  

