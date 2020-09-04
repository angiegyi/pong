import { fromEvent,interval, Observable} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil } from 'rxjs/operators';



function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
    const canvas = document.getElementById("canvas");

    type paddleState = Readonly<{
      x: number;
      y: number;
    }>

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
    }>
   
    type Game = Readonly<{
      score1: number;
      score2: number;
      maxScore: number;
      paddle1: Element;
      paddle2: Element; 
      ball: Element; 
    }>

    const initalGameState: Game = { 
      score1: 0,
      score2: 0,
      maxScore: 7, 
      paddle1: document.getElementById("paddle1"),
      paddle2: document.getElementById("paddle2"),
      ball: document.getElementById("paddle2")
    }

    const initialState: Paddle = {x: 10, y: 200};
  
    function movePaddle(s: Paddle, step:number): Paddle { 
      return { ...s, y: s.y + step}
    }

    function gameView(state: Paddle): void { 
      //update the Paddle
      const paddle = document.getElementById("paddle1");
      paddle.setAttribute("y", state.y.toString());
    }
    //observable1 -> moving left paddle triggered by the up/down arrow keys
    const obs1 = fromEvent<KeyboardEvent>(document, 'keydown')
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
      scan(movePaddle, initialState))
    obs1.subscribe(gameView);
    execute();
}

function createBall(): Element {
  const canvas = document.getElementById("canvas");
  var ball = document.createElementNS(canvas.namespaceURI, "circle");
  // Set circle properties
  ball.setAttributeNS(null, "cx", "300");
  ball.setAttributeNS(null, "cy", String(Math.random() * 500 + 50));
  ball.setAttribute("r", "5");
  ball.setAttributeNS(null, "fill", "red");
  ball.setAttributeNS(null, "id", "ball");
  return ball; 
}
  
function execute() { 
  const ball = createBall(); 
  const canvas = document.getElementById("canvas");
  canvas.appendChild(ball);
  //time for the game 
  const gameTime = interval(1)
  //getting the x-y coord of the ball 
  const ballCoord = gameTime.pipe(map(() => (({x: Number(ball.getAttribute("cx")), y: Number(ball.getAttribute("cy"))}))));
  console.log(ballCoord);
}



  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
 
