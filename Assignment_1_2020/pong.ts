import { fromEvent,interval, Observable} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, take } from 'rxjs/operators';



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
    }>

    const initalGameState: Game = { 
      score1: 0,
      score2: 0,
      maxScore: 7, 
      paddle1: {x: 10, y: 200, object: document.getElementById("paddle1")},
      paddle2: {x: 10, y: 200, object: document.getElementById("paddle2")},
      ball: {cx: 300, cy: Number(String(Math.random() * 500 + 50)), r: 5, fill: "red", xVelo: 7, yVelo: 3, object: null},
      canvas: document.getElementById("canvas")
    }

    execute(initalGameState);   

    function movePaddle(s: Paddle, step:number): Paddle { 
      return { ...s, y: s.y + step}
    }

    function moveBall(s: Ball, x:number, y:number): Ball { 
      return { ...s, cy: s.cy + x, cx: s.cx + x }
    }

    function updateGameView(state: Paddle): void { 
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
      scan(movePaddle, initalGameState.paddle1));
    obs1.subscribe(updateGameView);
    
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
    
    function inRect(x: number, game: Game) { 
      var canvas = game.canvas.getBoundingClientRect();
      var size = Number(game.ball.object.getAttribute("r")) * 2 ; 
      return (x + size < canvas.left) && (x - size >= canvas.right) 
    }
      
    function execute(game: Game) { 
      const ball = createBall(); 
      const canvas = game.canvas;
      canvas.appendChild(ball);

      //time for the game 
      const gameTime = interval(10).pipe(map(_ => {game}))
      //the time runs until either player wins 
      const mainObservable = gameTime.pipe(takeUntil(
        gameTime.pipe(filter(_ => game.score1 == game.maxScore || game.score2 == game.maxScore)))
        ,map(_ => ({...game}))); //returns a copy of game 

      mainObservable.subscribe(((data: Game) => ball.setAttribute("cx", (Number(data.ball.xVelo) + Number(data.ball.cx)).toString())));
      //mainObservable.subscribe(((data: Game) => gameView());
}}



  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
 
