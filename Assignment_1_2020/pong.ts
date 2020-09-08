import { fromEvent,interval, Observable, never} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, take, reduce } from 'rxjs/operators';

class Tick { constructor(public readonly elapsed:number) {} }
class Move { constructor(public readonly direction:number) {} }
class MovePaddle { constructor(public vector: Vec) {}}
class MoveBall { constructor(public vector: Vec) {}}
class Collision { constructor(public vector: Vec) {}}


class Vec {
  constructor(public readonly x: number = 0, public readonly y: number = 0) {}
  add = (b:Vec) => new Vec(this.x + b.x, this.y + b.y)
  sub = (b:Vec) => this.add(b.scale(-1))
  len = ()=> Math.sqrt(this.x*this.x + this.y*this.y)
  scale = (s:number) => new Vec(this.x*s,this.y*s)
  ortho = ()=> new Vec(this.y,-this.x)

  flipX = () => new Vec(this.x * -1, this.y)
  flipY = () => new Vec(this.x, this.y * -1)
  //static Zero = new Vec();
}

function pong() {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  

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
      height: number;
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
      paddle1: {x: 10, y: 230, height: 120, object: document.getElementById("paddle1")},
      paddle2: {x: 580, y: 230, height: 120, object: document.getElementById("paddle2")},
      ball: {cx: 300, cy: Number(String(Math.random() * 500 + 50)), r: 5, fill: "red", xVelo: 1, yVelo: 1, object: createBall()},
      canvas: document.getElementById("canvas"),
      gameOver: false
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

    function reduceState(s: Game, e: MovePaddle | MoveBall | Collision): Game {

    if (e instanceof MovePaddle) {
      return { ...s, paddle1: { 
        x: s.paddle1.x,
        y: s.paddle1.y + e.vector.y, 
        height: 120, 
        object: document.getElementById('paddle1')
      } 
    } 
  }
    
    if (e instanceof MoveBall) {
      return { ...s, ball: { 
        cy: s.ball.cy + s.ball.yVelo,
        cx: s.ball.cx + s.ball.xVelo,
        r: 5,
        fill: "red", 
        xVelo: 1, 
        yVelo: 1, 
        object: document.getElementById('ball')
        }
      } 
    }

    //check for Y collisons
    if (!collideY(s)) {
      return reduceState(s, new Collision(new Vec(s.ball.cx,s.ball.cy).flipY()))
    }
    
    if (e instanceof Collision){
      return { ...s, ball: { 
        cy: s.ball.cy,
        cx: s.ball.cx,
        r: 5,
        fill: "red", 
        xVelo: 1, 
        yVelo: 1, 
        object: document.getElementById('ball')
        }
      }}


    return s
    }

    function updateView(state: Game) { 
      state.ball.object.setAttribute('cx', String(state.ball.xVelo + state.ball.cx));
      state.ball.object.setAttribute('cy', String(state.ball.xVelo + state.ball.cy));
      state.paddle1.object.setAttribute("y", String(state.paddle1.y));
      // state.paddle2.object.setAttribute('y', String(state.ball.cy) + state.paddle2.height/2);
    }

    type Key = 'ArrowUp' | 'ArrowDown'
    type Event = 'keydown' | 'keyup'

    //observables go here
    const keyObservable = <T>(e:Event, k:Key, result:()=>T)=>
    fromEvent<KeyboardEvent>(document,e)
        .pipe(
          filter(({code})=>code === k),
          map(result)),
    upEvent = keyObservable('keydown','ArrowUp', () => new MovePaddle(new Vec(0,-10))),
    downEvent = keyObservable('keydown','ArrowDown', () => new MovePaddle(new Vec(0,10)))

    //observable for the ball 
    const ballObservable = interval(10).pipe(map(_ => new MoveBall(new Vec(0.001,0.001))))

    // const ballCollision = interval(1)

    // const ballCollision = interval(1).pipe(map(_ => collideY(Number(document.getElementById('ball').getAttribute('cy')))));
    // ballCollision.subscribe(console.log)

  
    //main subscription
    const gameTime = interval(10).pipe(
      merge(upEvent, downEvent, ballObservable),
      scan(reduceState, initalGameState))
    gameTime.subscribe(updateView);

    function collideX(s: Game) { 
      let canvas = s.canvas.getBoundingClientRect();
      let size = 10; 
      let x = s.ball.cx; 
      return (x + size <= 600) && (x - size >= 0) 
    }

    function collideY(s: Game) { 
      //function returns true if its in the canvas
      let canvas = document.getElementById('canvas').getBoundingClientRect();
      let size = 10; 
      let y = s.ball.cy; 
      return ((y + size <= 600) && (y - size >= canvas.top))
    }

    function initView(game: Game) { 
      const ball = game.ball; 
      const canvas = game.canvas;
      canvas.appendChild(ball.object);
    }

initView(initalGameState)
}
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }
 
