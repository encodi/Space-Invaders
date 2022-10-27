const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    };

    this.rotation = 0;

    const image = new Image();
    image.src = './img/spaceship.png';
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20
      };
    };
  }

  draw() {
    // context.fillStyle = 'red';
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.save();
    context.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
    context.rotate(this.rotation);
    context.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
    if (this.image) {
      context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    context.restore()
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({position, velocity}) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 3;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player();
const projectiles = [];
const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  space: {
    pressed: false
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    let projectileIndex = i;
    let projectile = projectiles[i];
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(projectileIndex, 1);
    } else {
      projectile.update();
    }
  };

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }
}

animate();

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'a':
      //console.log('left');
      keys.a.pressed = true;
      break;
    case 'd':
      //console.log('right');
      keys.d.pressed = true;
      break;
    case ' ':
      //console.log('space');
      keys.space.pressed = true;
      projectiles.push(new Projectile({
        position: {
          x: player.position.x + player.width / 2,
          y: player.position.y
        },
        velocity: {
          x: 0,
          y: -10
        }
      }));
      console.log(projectiles);
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'a':
      // console.log('left');
      keys.a.pressed = false;
      break;
    case 'd':
      // console.log('right');
      keys.d.pressed = false;
      break;
    case ' ':
      // console.log('space');
      keys.space.pressed = false;
      break;
    default:
      break;
  }
});