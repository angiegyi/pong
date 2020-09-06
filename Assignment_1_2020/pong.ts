import { fromEvent,interval, Observable} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, take } from 'rxjs/operators';

class Tick { constructor(public readonly elapsed:number) {} }

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

    type Ball = Readonly<{
      cx: number;
      cy: number;
      r: number;
      fill: string; 
      xVelo: number; 
      yVelo: number;
      object: Element; 
    }>
   
    type Paddle = Readonly<{
      x: number;
      y: number;
      object: Element; 
    }>
   
    type Game = Readonly<{
      score1: number;
      score2: number;
      maxScore: number;
      paddle1: Paddle;
      paddle2: Paddle; 
      ball: Ball; 
      canvas: Element; 
      gameOver: Boolean; 
    }>

    const initalGameState: Game = { 
      score1: 0,
      score2: 0,
      maxScore: 7, 
      paddle1: {x: 10, y: 230, object: document.getElementById("paddle1")},
      paddle2: {x: 580, y: 230, object: document.getElementById("paddle2")},
      ball: {cx: 300, cy: Number(String(Math.random() * 500 + 50)), r: 5, fill: "red", xVelo: 1, yVelo: 1, object: createBall()},
      canvas: document.getElementById("canvas"),
      gameOver: false
    }

    function movePaddle(s: Paddle, step:number): Paddle { 
      return { ...s, y: s.y + step}
    }

    function updatePaddle(state: Paddle): void { 
      const paddle = document.getElementById("paddle1");
      paddle.setAttribute("y", state.y.toString());
    }

    function moveBall(s: Ball): Ball { 
      return { ...s, cy: s.cy + s.yVelo, cx: s.cx + s.xVelo}
    }

    function updateBall(state: Ball): void { 
      state.object.setAttribute('cx', String(state.xVelo + Number(state.object.getAttribute('cx'))));
    }

    //observable1 -> moving left paddle triggered by the up/down arrow keys
    const paddleObservable = fromEvent<KeyboardEvent>(document, 'keydown')
    .pipe(
      filter(({code})=>code === 'ArrowDown' || code === 'ArrowUp'),
      filter(({repeat})=>!repeat),
      flatMap(d=>interval(10).pipe(
        takeUntil(fromEvent<KeyboardEvent>(document, 'keyup').pipe(
          filter(({code})=>code === d.code)
        )),
        map(_=>d))
      ),
      map(({code})=>code==='ArrowDown'?1:-1), scan(movePaddle, initalGameState.paddle1))
    paddleObservable.subscribe(updatePaddle);
    
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
    
    /***
     * Checks if the ball is within the canvas
     */
    function inRect(x: number, game: Game) { 
      var canvas = game.canvas.getBoundingClientRect();
      var size = Number(game.ball.object.getAttribute("r")) * 2 ; 
      return (x + size < canvas.right) && (x - size >= canvas.left)
    }

    function execute(game: Game) { 
      const ball = game.ball.object; 
      const canvas = document.getElementById("canvas");
      canvas.appendChild(ball);

      //time for the game 
      const gameTime = interval(10)

      //the time runs until either player wins | every tick of the timer observes the ball coordinates
      const mainObservable = gameTime.pipe(takeUntil
        (gameTime.pipe(filter(_ => game.score1 == game.maxScore || game.score2 == game.maxScore)))
        ,map((_) => ({
          x: parseInt(ball.getAttribute("cx")),
          y: parseInt(ball.getAttribute("cy")),
          r: parseInt(ball.getAttribute("r")),
          xSpeed: parseInt(ball.getAttribute("xSpeed")),
          ySpeed: parseInt(ball.getAttribute("ySpeed")),
          game
        }))); 

      // filter for instances where ball reaches left or right of svg
      const boundaryCondition = mainObservable.pipe(filter(({x,y,r}) => !inRect(x, game)));
      //is a stream until the ball hits a wall 
      const finiteStream = mainObservable.pipe(takeUntil(boundaryCondition),map(({game}): Ball => (moveBall(game.ball))))
      finiteStream.subscribe(b => updateBall(b));

      mainObservable.subscribe(({game}) => console.log(game.paddle2))

      mainObservable.subscribe(({y, game}) => game.paddle2.object.setAttribute('y', String(y)));
}
execute(initalGameState)
}



  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
 
