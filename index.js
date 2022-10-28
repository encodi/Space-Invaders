const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#scoreEl');
const context = canvas.getContext('2d');

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = 1024;
canvas.height = 576;

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
    this.opacity = 1;
  }

  draw() {
    // context.fillStyle = 'red';
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.save();
    context.globalAlpha = this.opacity;
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

class Invader {
  constructor({position}) {
    this.velocity = {
      x: 0,
      y: 0
    };

    this.rotation = 0;

    const image = new Image();
    image.src = './img/invader.png';
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y
      };
    };
  }

  draw() {
    // context.fillStyle = 'red';
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);
    if (this.image) {
      context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
  }

  update({velocity}) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(new InvaderProjectile({
      position: {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height
      },
      velocity: {
        x: 0,
        y: 5
      }
    }));
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    };
    this.velocity = {
      x: 3,
      y: 0
    };
    this.invaders = [];

    const rows = Math.floor(Math.random() * 5 + 2);
    const cols = Math.floor(Math.random() * 10 + 5);

    this.width = cols * 30;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(new Invader({
          position: {
            x: i * 30,
            y: j * 30
          }
        }));
      }
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}
class Projectile {
  constructor({position, velocity}) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
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

class Particle {
  constructor({position, velocity, radius, color, fades}) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
    context.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}

class InvaderProjectile {
  constructor({position, velocity}) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }

  draw() {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

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

let frames = 0;
let randomInterval = Math.floor((Math.random() * 500) + 500);
let game = {
  over: false,
  active: true
};
let score = 0;

for (let j = 0; j < 100; j++) {
  particles.push(new Particle({
    position: {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    },
    velocity: {
      x: 0,
      y: 0.2
    },
    radius: Math.random() * 2,
    color: 'white',
    fades: false
  }));
}

function createParticles({object, color = '#BAA0DE', fades = true}) {
  for (let j = 0; j < 15; j++) {
    particles.push(new Particle({
      position: {
        x: object.position.x + object.width / 2,
        y: object.position.y + object.height / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      radius: Math.random() * 3,
      color: color,
      fades: fades
    }));
  }
}

function animate() {
  if (!game.active) return;
  window.requestAnimationFrame(animate);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    const particleIndex = i;

    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  };

  invaderProjectiles.forEach((invaderProjectile, invaderProjectileIndex) => {
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(invaderProjectileIndex, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    // Invaders kill player, die, game over, end
    if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
        invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
        invaderProjectile.position.x <= player.position.x + player.width) {
          console.log('YOU LOSE!');
          setTimeout(() => {
            invaderProjectiles.splice(invaderProjectileIndex, 1);
            player.opacity = 0;
            game.over = true;
          }, 0);
          setTimeout(() => {
            game.active = false;
          }, 2000);
          createParticles({
            object: player,
            color: 'white',
            fades: true
          });
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    let projectileIndex = i;
    let projectile = projectiles[i];
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(projectileIndex, 1);
    } else {
      projectile.update();
    }
  };

  // Grids of enemies drawing
  grids.forEach((grid, gridIndex) => {
    grid.update();

    // Spawn projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
    }

    grid.invaders.forEach((invader, invaderIndex) => {
      invader.update({velocity: grid.velocity});

      // Collision invader - projectile
      for (let i = projectiles.length - 1; i >= 0; i--) {
        let projectile = projectiles[i];
        let projectileIndex = i;
        if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
            projectile.position.x + projectile.radius >= invader.position.x &&
            projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
            projectile.position.y + projectile.radius >= invader.position.y) {

              setTimeout(() => {
                const invaderFound = grid.invaders.find((invader2) => {
                  return invader2 === invader;
                });

                const projectileFound = projectiles.find((projectile2) => {
                  return projectile2 === projectile;
                });

                // remove invader and projectile
                if (invaderFound && projectileFound) {
                  score += 100;
                  scoreEl.innerHTML = score;

                  createParticles({
                    object: invader,
                    fades: true
                  });

                  grid.invaders.splice(invaderIndex, 1);
                  projectiles.splice(projectileIndex, 1);

                  if (grid.invaders.length > 0) {
                    let firstInvader = grid.invaders[0];
                    let lastInvader = grid.invaders[grid.invaders.length - 1];
                    grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                    grid.position.x = firstInvader.position.x;
                  } else {
                    grids.splice(gridIndex, 1);
                  }
                }
              }, 0);
        }
      };
    });
  });

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

  // Spawning enemies grids fix
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 0;
    randomInterval = Math.floor((Math.random() * 500) + 500);
  }

  frames++;
}

animate();

window.addEventListener('keydown', ({ key }) => {
  if (game.over) return;

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
  if (game.over) return;

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