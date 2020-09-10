import { fromEvent,interval, Observable, never} from 'rxjs'; 
import { map,filter,merge,scan, flatMap, takeUntil, take, reduce } from 'rxjs/operators';

class GameOver { constructor(public readonly elapsed:number, public vector: Vec) {} }
class MovePaddle { constructor(public vector: Vec) {}}
class MoveBall { constructor(public vector: Vec) {}}

class Vec {
  constructor(public readonly x: number = 0, public readonly y: number = 0) {}
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

    /**
    * a type Ball 
    */
    type Ball = Readonly<{
      cx: number;
      cy: number;
      r: number;
      fill: string; 
      xVelo: Vec; 
      yVelo: Vec;
      object: Element; 
    }>
     /**
    * a type Paddle 
    */
    type Paddle = Readonly<{
      x: number;
      y: number;
      height: number;
      object: Element; 
    }>
   /**
    * a type Game 
    */
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
    /**
     * Generates either a -1 or 1 
     */
    function randomNum(): number { 
      return Math.random() < 0.5 ? -3 : 3;
    }
    /**
     * Is the object to represent the inital state of the game 
     */
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
    /**
     * Creates a svg ball element 
     */
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

    /**
     * Updates the state of objects based on the event that has occured
     * @param s state of the game
     * @param e the event that has occured, represented by a class 
     */
    function reduceState(s: Game, e: MovePaddle | MoveBall): Game {

      if (checkScore(s)){
        endGame(s) 
      }

      /* Responsible for moving the left paddle */
      if (e instanceof MovePaddle) {
        if (e.vector.y > 0) { 
          if ((s.paddle1.y + e.vector.y <= 475)){ 
            return { ...s, paddle1: { 
              x: s.paddle1.x,
              y: s.paddle1.y + e.vector.y, 
              height: 120, 
              object: document.getElementById('paddle1')
              } 
            }
        }
        else {return s}
      }
      else { 
        if ((s.paddle1.y - e.vector.y >= 10)){
          return { ...s, paddle1: { 
            x: s.paddle1.x,
            y: s.paddle1.y + e.vector.y, 
            height: 120, 
            object: document.getElementById('paddle1')
            } 
          }
        }
      else {return s} 
      }}

    /* Checks if there has been a collision between the ball and paddle */
    if (collidePaddle(s)) {
      //if ball collides with the bottom of the paddle 
      if (s.ball.cy > s.paddle1.y + s.paddle1.height/2 || s.ball.cy > s.paddle2.y + s.paddle1.height/2){
        return { ...s, ball: { 
          cy: s.ball.cy + s.ball.yVelo.y,
          cx: s.ball.cx + s.ball.xVelo.x * -1,
          r: 5,
          fill: "red", 
          xVelo: s.ball.xVelo.flipX(), 
          yVelo: new Vec(0, 2), 
          object: document.getElementById('ball')
          }
        }
      }
      else { 
        //if ball collides with the top of the paddle 
        return { ...s, ball: { 
          cy: s.ball.cy + s.ball.yVelo.y,
          cx: s.ball.cx + s.ball.xVelo.x * -1,
          r: 5,
          fill: "red", 
          xVelo: s.ball.xVelo.flipX(), 
          yVelo: new Vec(0, -5), 
          object: document.getElementById('ball')
          }
        }
      }
    }

    /* Is responsible for moving the ball */
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
        //check if the game is still running, if not then run the end game function
        //checks if its left side's point
        if (s.ball.cx <= 300) {
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
        //otherwise it is right side's point
        else {
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
        //if the ball is above the ball 
        if (s.ball.cy + s.ball.r * 2 < s.paddle2.y + s.paddle2.height/2) { 
          //if the paddle is within the board parameters 
            if ((s.paddle2.y - 3 >= 10)) {
                return { ...s, paddle2: { 
                  x: s.paddle2.x,
                  y: s.paddle2.y - 3, 
                  height: 120, 
                  object: document.getElementById('paddle2')
                  }}}
            else {return s}
                }
                
        //if the ball is below the ball 
        else { 
          //if the paddle is within the board parameters 
          if ((s.paddle2.y + 3 <= 475)) {
            return { ...s, paddle2: { 
              x: s.paddle2.x,
              y: s.paddle2.y + 3, 
              height: 120, 
              object: document.getElementById('paddle2')
              }}}
          else {
            return s
          }}
        } 
      return s
    }

    /**
     *This function updates the view of the game and is called in the subscribe of the game time observable
     */
    function updateView(state: Game) { 
      //updates the ball and paddle 
      state.ball.object.setAttribute('cx', String(state.ball.xVelo.x + state.ball.cx));
      state.ball.object.setAttribute('cy', String(state.ball.yVelo.y + state.ball.cy));
      state.paddle1.object.setAttribute("y", String(state.paddle1.y));
      state.paddle2.object.setAttribute('y', String(state.paddle2.y));
      
      //updates the score of the game 
      let score1 = document.getElementById("leftS")
      let score2 = document.getElementById("rightS")
      score1.innerHTML = String(state.score1)
      score2.innerHTML = String(state.score2)
    }

    type Key = 'ArrowUp' | 'ArrowDown'
    type Event = 'keydown' | 'keyup'

    // observable for the movement of paddle 1 using the up and down arrow keys 
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

    /*create new observables based on the key pressed which creates new move paddle 
    objects which are used in the reduce state function*/
    upEvent = keyObservable('keydown','ArrowUp', () => new MovePaddle(new Vec(0,-3))),
    downEvent = keyObservable('keydown','ArrowDown', () => new MovePaddle(new Vec(0,3)))        
    
  /* this is the observable for tracking the ball */
    const ballObservable = interval(10).pipe(map(_ => new MoveBall(new Vec(1,-1))))

    /* this is the main observable for the game */
    const gameTime = interval(10).pipe(
      merge(upEvent, downEvent, ballObservable),
      scan(reduceState, initalGameState)).subscribe(updateView);

    /**
     * Function determines if the ball is within the boundaries of the side canvas walls 
     * @param s takes in the game state object
     */
    function collideX(s: Game): Boolean {  
      return (s.ball.cx + 10 <= 600) && (s.ball.cx - 10 >= 0) 
    }

    /**
     * Function determines if the ball is within the boundaries of the top canvas walls 
     * @param s takes in the game state object
     */
    function collideY(s: Game): Boolean { 
      return ((s.ball.cy + 10 <= 600) && (s.ball.cy - 10 >= -5))
    }

    /**
     * Function sets up up the view when the game first executes
     * @param game takes in the game state object
     */
    function initView(game: Game) { 
      game.canvas.appendChild(game.ball.object);
    }

    /**
     * This function checks if there has been a collision between the ball and a paddle
     * @param s game state
     */
    function collidePaddle(s: Game){
      let cx = s.ball.cx
      let cy = s.ball.cy
      let ballSize = s.ball.r * 2
      let rightPaddleY = s.paddle2.y
      let rightPaddleX = s.paddle2.x
      let leftPaddleX = s.paddle1.x
      let leftPaddleY = s.paddle1.y
      let paddleHeight = s.paddle1.height

      return ((Math.abs(cx + ballSize - rightPaddleX) <= 1 && cy >= rightPaddleY - 10 && cy <= (rightPaddleY + paddleHeight + 10)) || 
      (Math.abs(cx - leftPaddleX - ballSize) <= 1 && (leftPaddleY - 10) <= cy && cy <= (leftPaddleY + paddleHeight + 10))) ? true : false
    }


    /**
     * This function checks the score of the game 
     * @param s game state
     */
    function checkScore(s: Game){
      return s.score1 == s.maxScore || s.score2 == s.maxScore
    }

    /**
     * This function handles the game ending 
     */
    function endGame(s: Game){ 
      const canvas = document.getElementById("canvas");
      const v = document.createElementNS(s.canvas.namespaceURI, "text");

      if (s.score2 == s.maxScore) { 
        v.innerHTML = String("Player 2 Wins")
        document.getElementById('rightS').setAttributeNS(null, "fill", "yellow")
      }
      else { 
        v.innerHTML = String("Player 1 Wins")
        document.getElementById('rightS').setAttributeNS(null, "fill", "yellow")
      }

      v.setAttributeNS(null, "x", "150")
      v.setAttributeNS(null, "y", "300")
      v.setAttributeNS(null, "fill", "white");
      v.setAttributeNS(null, "font-size", "50"); 
      canvas.appendChild(v)

      pong()
      gameTime.unsubscribe();
    }

initView(initalGameState)
}
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();
    }