(function () {
    let canvas = document.getElementById("Canvas");
    let ctx = canvas.getContext("2d");

   // canvas.setAttribute('width', window.innerWidth);
   // canvas.setAttribute('height', window.innerHeight);
    const BKG = new Image();
    BKG.src = "back1.jpg";
    ctx.lineWidth = 3;

    const CAT = new Image();
    CAT.src = "cat.png";

    const HEART = new Image();
    HEART.src = "heart.png";

    //BKG.style.opacity = "0.1";
    // BKG.id = "background";

    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 21;
    const PADDLE_BOTTOM_PADDING = 30;
    const BALL_RADIUS = 8;

    const BRICK = {
        width : 100,
        height : 27,
        offSetLeft : 20,
        offSetTop : 20,
        marginTop : 40,
        brickLives : ["#b9ebc5", "#5fad72", "#0ca832", "#035918", "#011c07" ],
        scoreUnit : 10,
    }

    class Brick{
        constructor(x,y, lives) {
          this.x = x;
          this.y = y;
          this.lives = lives;
          this.scorePotential = this.lives * BRICK.scoreUnit;
        }

        draw() {

            ctx.lineWidth = 2;
            ctx.fillStyle = BRICK.brickLives[this.lives];
            ctx.strokeStyle = "white";
            ctx.fillRect(this.x, this.y, BRICK.width, BRICK.height);
            ctx.strokeRect(this.x, this.y, BRICK.width, BRICK.height);
            ctx.lineWidth = 3;
        }
    }

    class Ball {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.speed = 8;
            this.dx = 3 * (Math.random() * 2 - 1);
            this.dy = -3;
        }
        draw() {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, BALL_RADIUS, this.x, this.y, BALL_RADIUS / 3);
            gradient.addColorStop(0, '#2a61eb');
            gradient.addColorStop(1, '#03a9fc');
            ctx.fillStyle = gradient;

            ctx.arc(this.x, this.y, BALL_RADIUS, 0, 2 * Math.PI);
            ctx.fill();

            // _ctx.stroke();
        }

        nextFrame() {
            const ret = move();
            draw();
            return ret;
        }

        move(paddle) {
            this.x += this.dx;
            this.y += this.dy;
            if (this.hitWall()) //if ball lost
                return true;

            this.hitPaddle(paddle);

            return false;
        }

        //return true if ball is lost!
        hitWall() {
            this.x = Math.max(BALL_RADIUS, this.x);
            this.x = Math.min(canvas.width - BALL_RADIUS, this.x);
            this.y = Math.max(BALL_RADIUS, this.y);

            if (this.x >= canvas.width - BALL_RADIUS || this.x <= BALL_RADIUS)
                this.dx = -this.dx;
            if (this.y <= BALL_RADIUS)
                this.dy = -this.dy;
            if (this.y >= canvas.height + BALL_RADIUS) {
                return true;
            }
            return false;
        }

        hitPaddle(paddle) {
            if(this.x + BALL_RADIUS < paddle.x || this.x > paddle.x + PADDLE_WIDTH )
                return;

            if(this.y + BALL_RADIUS < paddle.y || this.y - BALL_RADIUS > paddle.y + PADDLE_HEIGHT) 
                return; 

            const xNormalized = (this.x - (paddle.x - BALL_RADIUS/2))/(PADDLE_WIDTH+BALL_RADIUS/2) * 130 - 65;
            console.log(xNormalized);
            this.dy = -this.speed * Math.cos( xNormalized *( Math.PI / 180));
            this.dx = this.speed * Math.sin( xNormalized* ( Math.PI / 180) );
            console.log(this.dx, this.dy);

            //move 2 top of paddle
          //  this.y = paddle.y - BALL_RADIUS;

            //if(this.x + BALL_RADIUS > paddle.x)d
           // this.x = min(this.x, this + BALL_RADIUS);


        }
    }

    class Game {

        constructor() {
            this.lives = 1;
            this.score = 0;
            this.y = 0;
            this.paddle = {
                x: canvas.width / 2 - PADDLE_WIDTH / 2,
                y: canvas.height - PADDLE_BOTTOM_PADDING - PADDLE_HEIGHT,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                speed: 0,
                speedMult: 6,
                accelerate: function (by) {
                    this.speed += by;
                    this.speed = Math.min(this.speed, 1);
                    this.speed = Math.max(this.speed, -1);
                },
                move: () => {
                    this.paddle.x += this.paddle.speed * this.paddle.speedMult;
                    this.paddle.x = Math.min(this.paddle.x, canvas.width - PADDLE_WIDTH);
                    this.paddle.x = Math.max(this.paddle.x, 0);
                }
            }

            this.ball = new Ball(canvas.width / 2, this.paddle.y - BALL_RADIUS);

            document.addEventListener("keydown", event => {
                if (event.keyCode == 37) {
                    this.paddle.accelerate(-1);
                }
                else if (event.keyCode == 39) {
                    this.paddle.accelerate(1);
                }
            });

            document.addEventListener("keyup", event => {
                if (event.keyCode == 37) {
                    this.paddle.accelerate(1);
                }
                else if (event.keyCode == 39) {
                    this.paddle.accelerate(-1);
                }
            });

            this.paddleMovement = 0;
        }

        newLevel(){
            this.bricks = [];
            for(let r = 0; r < canvas.width/BRICK.width - 1; ++r ){
                this.bricks[r] = [];

                for(let c = 0; c < (canvas.height- PADDLE_BOTTOM_PADDING - PADDLE_HEIGHT-50 - BRICK.marginTop)/ BRICK.height -2; ++c ){
                    if( Math.random() < 0.6){
                        this.bricks[r][c] = null;
                        continue;
                    }
                    const lives = getRandomInt(0, BRICK.brickLives.length) ;
                    this.bricks[r][c] = new Brick((c*BRICK.width)+BRICK.offSetLeft, (r*BRICK.height)+ BRICK.marginTop + BRICK.offSetTop, lives);
                }
            }
        }

        displayScore(){
            ctx.fillStyle = "blue";
            ctx.font = "40px Germania One";
            ctx.drawImage(CAT, 20, 20, 30, 30)
            ctx.fillText(this.score, 55, 50);
        }

        displayLives(){
            ctx.fillStyle = "blue";
            ctx.font = "40px Germania One";

            for( let l = 0; l < this.lives; ++l)
                ctx.drawImage(HEART, Math.ceil(canvas.width*0.75 +l*45), 10, 40, 40);

            ctx.fillText(this.score, 55, 50);
        }

        ballHitBrick(){
            for(let r = 0; r < this.bricks.length; ++r)
                for(let c = 0; c < this.bricks[r].length; ++c)
                    if(this.bricks[r][c]){
                        if(this.ball.x + BALL_RADIUS/2 < this.bricks[r][c].x || this.ball.x  - BALL_RADIUS/2 > this.bricks[r][c].x + BRICK.width)
                            continue;
                        if( this.ball.y  - BALL_RADIUS/2 > this.bricks[r][c].y + BRICK.height || this.ball.y + BALL_RADIUS/2 < this.bricks[r][c].y)
                            continue;

                        this.ball.dy = -this.ball.dy;

                        if(this.ball.x < this.bricks[r][c].x || this.ball.x > this.bricks[r][c].x + BRICK.width )
                            this.ball.dx = -this.ball.dx;

                        if(--this.bricks[r][c].lives < 0){
                            this.score += this.bricks[r][c].scorePotential;
                            this.bricks[r][c] = null;
                        }
                    }

        }

        nextFrame() {
            
            this.paddle.move();
            const ballLost = this.ball.move(this.paddle);
            this.ballHitBrick();
            this.draw();

            if (ballLost) {
                if (--this.lives > 0){
                    this.ball = new Ball(this.paddle.x + PADDLE_WIDTH/2, this.paddle.y - BALL_RADIUS);
                    setTimeout(() => { requestAnimationFrame(this.nextFrame.bind(this)); }, 1000);
                    return;
                }
                else{
                    showYouLose();
                    return;
                }

            }
            
            requestAnimationFrame(this.nextFrame.bind(this));
        }

        draw() {
            // drawing code
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ctx.fillStyle = "#162269";
            // roundedRect(ctx, 122, this.y++, 50, 50, 10);
            this.drawPaddle();
            this.ball.draw();
            for(let r = 0; r < this.bricks.length; ++r)
                for(let c = 0; c < this.bricks[r].length; ++c)
                    if(this.bricks[r][c])
                        this.bricks[r][c].draw();

            this.displayScore();
            this.displayLives();
        }

        drawPaddle() {
            ctx.fillStyle = "#4b2894";
            ctx.lineWidth = 2;
            ctx.fillRect(this.paddle.x, this.paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.strokeStyle = ctx.fillStyle = "silver";
            ctx.strokeRect(this.paddle.x, this.paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.lineWidth = 3;
            roundedRect(ctx, this.paddle.x + 5, this.paddle.y + 5, PADDLE_WIDTH - 10, PADDLE_HEIGHT - 10, 5);
            //ctx.fillRect(this.paddle.x+5, this.paddle.y+5, PADDLE_WIDTH-10, PADDLE_HEIGHT-10);
        }

        clear() {
            ctx.clear(0, 0, canvas.width, canvas.height);
        }

    }
    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.lineTo(x + width - radius, y + height);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.lineTo(x + width, y + radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.lineTo(x + radius, y);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.stroke();
        ctx.closePath();
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // SHOW GAME OVER MESSAGE
/* SELECT ELEMENTS */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
//const restart = document.getElementById("restart");

// // CLICK ON PLAY AGAIN BUTTON
// restart.addEventListener("click", function(){
//     location.reload(); // reload the page
// })

// SHOW YOU WIN
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

// SHOW YOU LOSE
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}
    

    let game = new Game();
    game.newLevel();
    game.nextFrame();
  //  game.draw();

    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "orange";
    ctx.arc(55, 5, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();



})();
