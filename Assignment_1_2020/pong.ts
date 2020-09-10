import { fromEvent,interval, Observable, never} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, take, reduce } from 'rxjs/operators';

class GameOver { constructor(public readonly elapsed:number, public vector: Vec) {} }
class MovePaddle { constructor(public vector: Vec) {}}
class MoveBall { constructor(public vector: Vec) {}}

class Vec {
  constructor(public readonly x: number = 0, public readonly y: number = 0) {}
  add = (b:Vec) => new Vec(this.x + b.x, this.y + b.y)
  sub = (b:Vec) => this.add(b.scale(-1))
  len = ()=> Math.sqrt(this.x*this.x + this.y*this.y)
  scale = (s:number) => new Vec(this.x*s,this.y*s)
  ortho = ()=> new Vec(this.y,-this.x)

  flipX = () => new Vec(this.x * -1, this.y)
  flipY = () => new Vec(this.x, this.y * -1)

  randomX = () => new Vec(this.x * -1, this.y)
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
      xVelo: Vec; 
      yVelo: Vec;
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

    function randomNum(): number { 
      return Math.random() < 0.5 ? -1 : 1;
    }

    const initalGameState: Game = { 
      score1: 0,
      score2: 0,
      maxScore: 8, 
      paddle1: {x: 10, y: 230, height: 120, object: document.getElementById("paddle1")},
      paddle2: {x: 580, y: 230, height: 120, object: document.getElementById("paddle2")},
      ball: {cx: 300, cy: Number(String(Math.random() * 500 + 50)), r: 5, fill: "red", xVelo: new Vec(randomNum(),0), yVelo: new Vec(0, randomNum()), object: createBall()},
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
      ball.setAttributeNS(null, "fill", "yellow");
      ball.setAttributeNS(null, "id", "ball");
      return ball; 
    }

    function reduceState(s: Game, e: MovePaddle | MoveBall | GameOver): Game {

      if (e instanceof MovePaddle) {
        if ((s.paddle1.y + s.paddle1.height <= 585) && (s.paddle1.y - s.paddle1.height >= -100)){ 
        return { ...s, paddle1: { 
          x: s.paddle1.x,
          y: s.paddle1.y + e.vector.y, 
          height: 120, 
          object: document.getElementById('paddle1')
          } 
        }
      }
      else { 
        return { ...s, paddle1: { 
          x: s.paddle1.x,
          y: s.paddle1.y, 
          height: 120, 
          object: document.getElementById('paddle1')
          } 
        }
      } 
    }
      
    if (collidePaddle(s)) {
      return { ...s, ball: { 
        cy: s.ball.cy + s.ball.yVelo.y,
        cx: s.ball.cx + s.ball.xVelo.x * -1,
        r: 5,
        fill: "red", 
        xVelo: s.ball.xVelo.flipX(), 
        yVelo: s.ball.yVelo, 
        object: document.getElementById('ball')
        }
      }
    }


    if (e instanceof MoveBall) {
        return { ...s, ball: { 
          cy: s.ball.cy + s.ball.yVelo.y,
          cx: s.ball.cx + s.ball.xVelo.x,
          r: 5,
          fill: "red", 
          xVelo: s.ball.xVelo, 
          yVelo: s.ball.yVelo, 
          object: document.getElementById('ball')
          }
        } 
      }

      //check for collisons top walls
      if (!collideY(s)) {
        return { ...s, ball: { 
          cy: s.ball.cy + s.ball.yVelo.y * -1,
          cx: s.ball.cx + s.ball.xVelo.x,
          r: 5,
          fill: "red", 
          xVelo: s.ball.xVelo, 
          yVelo: s.ball.yVelo.flipY(), 
          object: document.getElementById('ball')
          }
        }
      }

      //collisions on the side walls
      if (!collideX(s)) { 

        if (checkScore(s)){
          endGame(s) 
        }

        if (s.ball.cx <= 300) {
          console.log('rights point', s.score1, s.score2, s.maxScore)
          return { 
            score1: s.score1,
            score2: s.score2 + 1, 
            maxScore: s.maxScore, 
            paddle1: s.paddle1,
            paddle2: s.paddle2,
            ball: {cx: 300, cy: Math.random() * 500 + 50, r: 5, fill: "red", xVelo: new Vec(randomNum(),0), yVelo: new Vec(0, randomNum()), object: s.ball.object},
            canvas: document.getElementById("canvas"),
            gameOver: false
          }
        }
        else {
          console.log('rights point', s.score1, s.score2, s.maxScore)
          return { 
            score1: s.score1 + 1,
            score2: s.score2,
            maxScore: s.maxScore, 
            paddle1: s.paddle1,
            paddle2: s.paddle2,
            ball: {cx: 300, cy: Math.random() * 500 + 50, r: 5, fill: "red", xVelo: new Vec(randomNum(),0), yVelo: new Vec(0, randomNum()), object: s.ball.object},
            canvas: document.getElementById("canvas"),
            gameOver: false
          }
          }
        }
     
      if (s.ball.cx > 300) {
        if (s.ball.cy + s.ball.r * 2 < s.paddle2.y + s.paddle2.height/2) { 
            return { ...s, paddle2: { 
              x: s.paddle2.x,
              y: s.paddle2.y - 2, 
              height: 120, 
              object: document.getElementById('paddle2')
              }}}
          else { 
            return { ...s, paddle2: { 
              x: s.paddle2.x,
              y: s.paddle2.y + 2, 
              height: 120, 
              object: document.getElementById('paddle2')
              }}}
        }
        //end game 
        
      return s
    }

    function updateView(state: Game) { 
      console.log()
      state.ball.object.setAttribute('cx', String(state.ball.xVelo.x + state.ball.cx));
      state.ball.object.setAttribute('cy', String(state.ball.yVelo.y + state.ball.cy));
      state.paddle1.object.setAttribute("y", String(state.paddle1.y));
      state.paddle2.object.setAttribute('y', String(state.paddle2.y));
      
      let score1 = document.getElementById("leftS")
      let score2 = document.getElementById("rightS")

      score1.innerHTML = String(state.score1)
      score2.innerHTML = String(state.score2)
    }

    type Key = 'ArrowUp' | 'ArrowDown'
    type Event = 'keydown' | 'keyup'

    const keyObservable = <T>(e:Event, k:Key, result:()=>T)=>
    fromEvent<KeyboardEvent>(document, e)
    .pipe(
      filter(({code})=>code === k),
      filter(({repeat})=>!repeat),
      flatMap(d =>interval(10).pipe(
        takeUntil(fromEvent<KeyboardEvent>(document, 'keyup').pipe(
          filter(({code})=>code === d.code)
        )),
        map(result)))),
    upEvent = keyObservable('keydown','ArrowUp', () => new MovePaddle(new Vec(0,-2))),
    downEvent = keyObservable('keydown','ArrowDown', () => new MovePaddle(new Vec(0,2)))        
    
    //observable for the ball 
    const ballObservable = interval(10).pipe(map(_ => new MoveBall(new Vec(1,-1))))

    //main subscription
    const gameTime = interval(10).pipe(
      merge(upEvent, downEvent, ballObservable),
      scan(reduceState, initalGameState))
    gameTime.subscribe(updateView);

    function collideX(s: Game) { 
      let size = 10; 
      let x = s.ball.cx; 
      return (x + size <= 600) && (x - size >= 0) 
    }

    function collideY(s: Game) { 
      //function returns true if its in the canvas
      let size = 10; 
      let y = s.ball.cy; 
      return ((y + size <= 600) && (y - size >= -5))
    }

    function initView(game: Game) { 
      const ball = game.ball; 
      const canvas = game.canvas;
      canvas.appendChild(ball.object);
    }

    function collidePaddle(s: Game){
      let x = s.ball.cx
      let y = s.ball.cy
      let ballSize = s.ball.r
      let rightY = s.paddle2.y
      let rightX = s.paddle2.x
      let leftX = s.paddle1.x
      let leftY = s.paddle1.y
      let paddleHeight = s.paddle1.height

      return ((Math.abs(x + ballSize - rightX) <= 1 && y >= rightY && y <= (rightY + paddleHeight)) || 
      (Math.abs(x - leftX - ballSize) <= 5 && leftY <= y && y <= (leftY + paddleHeight))) ? true : false
    }

    function checkScore(s: Game){
      return s.score1 == s.maxScore || s.score2 == s.maxScore
    }

    function endGame(s: Game){ 

    }

initView(initalGameState)
}
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }