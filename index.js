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
    this.position = {
      x: 0,
      y: 0
    };

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

class Bomb {
  static radius = 30;
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 0;
    this.color = 'red';
    this.opacity = 1;
    this.active = false;

    gsap.to(this, {
      radius: 30
    });
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x + this.radius + this.velocity.x >= canvas.width ||
      this.position.x - this.radius + this.velocity.x <= 0) {
      this.velocity.x = -this.velocity.x;
    } else if (this.position.y + this.radius + this.velocity.y >= canvas.height ||
      this.position.y -this.radius + this.velocity.y <= 0) {
      this.velocity.y = -this.velocity.y;
    }
  }

  explode() {
    this.active = true;
    this.velocity.x = 0;
    this.velocity.y = 0;
    gsap.to(this, {
      radius: 200,
      color: 'white'
    });

    gsap.to(this, {
      delay: 0.1,
      opacity: 0,
      duration: 0.15
    });
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const bombs = [];

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

function createScoreLabel({score = 100, object}) {
  const scoreLabel = document.createElement('label');
  scoreLabel.innerHTML = score;
  scoreLabel.style.position = 'absolute';
  scoreLabel.style.color = 'white';
  scoreLabel.style.top = object.position.y + 'px';
  scoreLabel.style.left = object.position.x + 'px';
  scoreLabel.style.userSelect = 'none';
  document.querySelector('#parentDiv').appendChild(scoreLabel);
  // document.body.appendChild(scoreLabel);

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      document.querySelector('#parentDiv').removeChild(scoreLabel);
    }
  });
}

function animate() {
  if (!game.active) return;
  window.requestAnimationFrame(animate);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (frames % 200 === 0 && bombs.length < 4) {
    bombs.push(new Bomb({
      position: {
        x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
        y: randomBetween(Bomb.radius, canvas.height - Bomb.radius),
      },
      velocity: {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6
      }
    }));
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    let bomb = bombs[i];

    if (bomb.opacity <= 0) {
      bombs.splice(i, 1);
    }
    bomb.update();
  }

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

    for (let j = bombs.length - 1; j >= 0; j--) {
      let bomb = bombs[j];
      let bombIndex = j;

      // Projectile - bomb collision
      if (Math.hypot(projectile.position.x - bomb.position.x, projectile.position.y - bomb.position.y) < projectile.radius + bomb.radius && !bomb.active) {
        projectiles.splice(projectileIndex, 1);
        bomb.explode();
      }
    }

    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(projectileIndex, 1);
    } else {
      projectile.update();
    }
  };

  // Grids of enemies drawing
  for (let k = grids.length - 1; k >= 0; k--) {
    let grid = grids[k];
    let gridIndex = k;
    grid.update();

    // Spawn projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      let invader = grid.invaders[i];
      let invaderIndex = i;
      invader.update({velocity: grid.velocity});

      for (let j = bombs.length - 1; j >= 0; j--) {
        let bomb = bombs[j];
        let bombIndex = j;

        const invaderRadius = 15;
        // Invader - bomb collision
        if (Math.hypot(invader.position.x - bomb.position.x, invader.position.y - bomb.position.y) < invaderRadius + bomb.radius && bomb.active) {
          grid.invaders.splice(invaderIndex, 1);
          // Dynamic score labels
          score += 50;
          scoreEl.innerHTML = score;
          createScoreLabel({score: 50, object: invader});
          createParticles({
            object: invader,
            fades: true
          });
        }
      }

      // Collision invader - projectile
      for (let i = projectiles.length - 1; i >= 0; i--) {
        let projectile = projectiles[i];
        let projectileIndex = i;
        if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
            projectile.position.x + projectile.radius >= invader.position.x &&
            projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
            projectile.position.y + projectile.radius >= invader.position.y) {
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

                // Dynamic score labels
                createScoreLabel({object: invader});

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
        }
      };
    };
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