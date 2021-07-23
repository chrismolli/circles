/*
*  Settings
* */
dt = 0.5;
gamma = 1;
fps = 24;
collision_decay = 0.5;

/*
*   Setup
* */

/* grab canvas */
let view = $("#view")
let c   = view[0];
let ctx = c.getContext("2d");

/* grab elements */
let tooltip = $("#tooltip");
let infotext = $("#infotext");

/* blow up canvas to window size */
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.scale(1, 1);

/* calc center */
center = {
    x : window.innerWidth / 2,
    y : window.innerHeight / 2
};

/*
*   Class Definition
* */

class Circle{
    constructor(x,y,r) {
        this.id = Math.round(Math.random()*1e5);
        this.pos = {
            x : x,
            y : y
        };
        this.vel = {
            x : Math.random()*10-5,
            y : Math.random()*10-5
        };
        this.acc = {
            x : 0,
            y : 0
        };
        this.radius = r;
        this.color="black";
    }

    collide(otherCircle){
        return (this.pos.x - otherCircle.pos.x) ** 2 + (this.pos.y - otherCircle.pos.y) ** 2 < (this.radius + otherCircle.radius) ** 2;
    }

    updatePos(dt){
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
    }

    updateVel(dt){
        this.vel.x += this.acc.x * dt;
        this.vel.y += this.acc.y * dt;
    }

    distance(otherCircle){
        return Math.sqrt((this.pos.x-otherCircle.pos.x)**2 + (this.pos.y-otherCircle.pos.y)**2);
    }

    contains(x,y){
        return Math.abs(x - this.pos.x) < this.radius && Math.abs(y - this.pos.y) < this.radius;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle=this.color;
        ctx.fill();
    }
}

/*
*   Setup Sim
* */

let circles = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation(){

    while(1) {

        // clear canvas
        ctx.clearRect(0, 0, c.width, c.height);

        for (let i = 0; i < circles.length; i++) {

            // update positions
            let oldPos = JSON.parse(JSON.stringify(circles[i].pos));
            circles[i].updatePos(dt);

            // check for collisions
            for (let j = 0; j < circles.length; j++) {
                if (i !== j) {
                    if (circles[i].collide(circles[j])) {
                        circles[i].pos = JSON.parse(JSON.stringify(oldPos));
                        circles[i].vel.x *= -collision_decay;
                        circles[i].vel.y *= -collision_decay;
                        break;
                    }
                }
            }

            // update velocities
            circles[i].updateVel(dt);

            // update accelerations
            circles[i].acc = {x: 0, y: 0};
            for (let j = 0; j < circles.length; j++) {
                if (i !== j) {
                    let distance = circles[i].distance(circles[j]);
                    circles[i].acc.x -= gamma * circles[i].radius * circles[j].radius / (distance ** 2) * (circles[i].pos.x - circles[j].pos.x);
                    circles[i].acc.y -= gamma * circles[i].radius * circles[j].radius / (distance ** 2) * (circles[i].pos.y - circles[j].pos.y);
                }
            }

            // draw circles
            circles[i].draw();
        }

        // sleep 1/24 frame
        await sleep(1000/fps);
    }

}

/*
*   Bind Events
* */
function mouseMoveEventHandler(e) {
    for(let i = 0; i < circles.length; i++){
        if(circles[i].contains(e.clientX,e.clientY)){
            tooltip.css("display","block");
            tooltip.html(`Circle #${circles[i].id}
                          \npos ${Math.round(circles[i].pos.x)},${Math.round(circles[i].pos.y)}
                          \nvel ${Math.round(circles[i].vel.x)},${Math.round(circles[i].vel.y)}`).wrap('<pre />');
            circles[i].color="red";
            break;
        }
        circles[i].color="black";
        tooltip.css("display","none");
    }
}

function mouseClickEventHandler(e){
    infotext.css("display","none");
    circles.push(new Circle(e.clientX,
                            e.clientY,
                            Math.random()*center.y*0.05+1));
}

view.mousemove(mouseMoveEventHandler);
view.click(mouseClickEventHandler);

/*
*  Start Simulation
* */
runSimulation();

