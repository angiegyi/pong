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

    type paddleState = Readonly<{
      x: number;
      y: number;
    }>

    const initialState: paddleState = {x: 10, y: 200};

    type gameState = Readonly<{
      score1: number;
      score2: number;
      maxScore: number;
    }>

    const pongStats: gameState = { 
      score1: 0, 
      score2: 0, 
      maxScore: 7
    }, svg = document.getElementById("canvas");
    
    type ballState = Readonly<{
      x: number;
      y: number;
      r: number;
      fill: string; 
      velocity: number;
    }>

    const ball: ballState = { 
      x: 50,
      y: 50,
      r: 50,
      fill: "white", 
      velocity: 23,
    }, currBall = document.getElementById("ball");

    function movePaddle(s: paddleState, step:number): paddleState { 
      return { ...s, y: s.y + step}
    }

    function gameView(state: paddleState): void { 
      //update the paddle
      const paddle = document.getElementById("paddle1");
      paddle.setAttribute("y", state.y.toString());
    }

    //observable1 -> moving left paddle triggered by the up/down arrow keys
    fromEvent<KeyboardEvent>(document, 'keydown')
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
    .subscribe(gameView);
  
    execute();

}

function createBall(): Element{
  const canvas = document.getElementById("canvas")!;
  const ball = document.createElementNS(canvas.namespaceURI, "circle");
  const boundary = canvas.getBoundingClientRect();
 
  // Set circle properties
  ball.setAttribute("cx", "300");
  ball.setAttribute("cy", String(Math.random() * 500 + 50));
  ball.setAttribute("fill", "white");
  ball.setAttribute("id", "ball");
  // canvas.appendChild(dot);
  return ball; 
}
  
function execute() { 

  const ball = createBall(); 
  const canvas = document.getElementById("canvas");
  const paddle1 = document.getElementById("paddle1");
  const paddle2 = document.getElementById("paddle2")!;
  
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
 
  
  

