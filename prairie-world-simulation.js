let count = 0;
main();

function main() {
    let screen = document.getElementById('canvas').getContext('2d');
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight;
    let world = {
        grass: [],
        cows: [],
        wolves: [],
        dimensions: {x: screen.canvas.width, y: screen.canvas.height},
    };
    for (let i = 0; i < 6 + Math.round(10 * Math.random()); i++) {
        world.grass.push(makeGrass({x: screen.canvas.width * Math.random(), y: screen.canvas.height * Math.random()}));
    }
    for (let i = 0; i < 6 + Math.round(10 * Math.random()); i++) {
        world.cows.push(makeCow({x: screen.canvas.width * Math.random(), y: screen.canvas.height * Math.random()}));
    }

    function tick() {
        count++;
        count %= 60;
        update(world);
        draw(world, screen);
        requestAnimationFrame(tick);
    }

    tick();
}

function update(world) {
    updateGrass(world);
    updateCows(world);
    updateWolves(world);
}

function updateGrass(world) {
    for (let i = 0; i < world.grass.length; i++) {
        let grass = world.grass[i];
        if (grass.age >= 10 + 5 * random()) {
            world.grass.splice(i, 1);
        }
    }
    let grassNumber = world.grass.length;
    for (let i = 0; i < world.grass.length; i++) {
        let grass = world.grass[i];
        grass.age += 0.02;
        grass.energy = 2 + grass.age;
        grass.radius = Math.min(10, 5 + grass.age);
        if (grass.multiplication <= 3 && Math.random() <= Math.max(0, 0.01 * (1 - grassNumber / 200))) {
            world.grass.push(makeGrass(nearbyPosition(world, grass)));
            grass.multiplication--;
        }
    }
}

function updateCows(world) {
    for (let i = 0; i < world.cows.length; i++) {
        let cow = world.cows[i];
        if (cow.energy <= 0 || cow.age >= 15 + 10 * random()) {
            world.cows.splice(i, 1);
        }
    }
    for (let i = 0; i < world.cows.length; i++) {
        let cow = world.cows[i];
        cow.age += 0.02;
        cow.energy -= 0.004;
        cow.lastMultiplication++;
        if (cow.multiplication <= 3 && cow.energy > 10 && cow.lastMultiplication > 100) {
            world.cows.push(makeCow(nearbyPosition(world, cow)));
            cow.multiplication++;
            cow.energy -= 5;
            cow.lastMultiplication = 0;
        }
        cow.radius = Math.min(10, Math.max(3, cow.energy));
        cow.velocity.x += random() - 0.5;
        cow.velocity.y += random() - 0.5;
        if (random() > 0.9) {
            cow.velocity.x = 2 * (random() - 0.5);
            cow.velocity.y = 2 * (random() - 0.5);
        }
        cow.center.x += cow.velocity.x;
        if (cow.center.x < 0) {
            cow.center.x = 0;
            cow.velocity.x = 0;
        } else if (cow.center.x > world.dimensions.x) {
            cow.center.x = world.dimensions.x;
            cow.velocity.x = 0;
        }
        cow.center.y += cow.velocity.y;
        if (cow.center.y < 0) {
            cow.center.y = 0;
            cow.velocity.y = 0;
        } else if (cow.center.y > world.dimensions.y) {
            cow.center.y = world.dimensions.y;
            cow.velocity.y = 0;
        }
        if (count % 10 === 0) {
            for (let i = 0; i < world.grass.length; i++) {
                let grass = world.grass[i];
                if (capture(cow, grass)) {
                    cow.energy += grass.energy;
                    world.grass.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function updateWolves(world) {
    for (let i = 0; i < world.wolves.length; i++) {
        let wolf = world.wolves[i];
        wolf.center.x += wolf.velocity.x;
        wolf.center.y += wolf.velocity.y;
    }
}

function draw(world, screen) {
    screen.clearRect(0, 0, world.dimensions.x, world.dimensions.y);
    let organisms = world.grass.concat(world.cows).concat(world.wolves);
    for (let i = 0; i < organisms.length; i++) {
        organisms[i].draw(screen);
    }
}

function makeGrass(center) {
    return {
        age: 0,
        energy: 5,
        velocity: {x: 0, y: 0},
        center: center,
        radius: 10,
        multiplication: 0,
        draw: function (screen) {
            screen.beginPath();
            screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
            screen.closePath();
            screen.fillStyle = "#00cc00";
            screen.fill();
        }
    };
}

function makeCow(center) {
    return {
        age: 0,
        energy: 5,
        multiplication: 0,
        lastMultiplication: 0,
        velocity: {x: 1, y: 1},
        center: center,
        radius: 5,
        draw: function (screen) {
            screen.beginPath();
            screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
            screen.closePath();
            screen.fillStyle = "#ffffff";
            screen.fill();
        }
    };
}

function makeWolf(center) {
    return {
        center: center,
        velocity: {x: 1, y: 1},
        radius: 5,
        draw: function (screen) {
            screen.beginPath();
            screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
            screen.closePath();
            screen.fillStyle = "#808080";
            screen.fill();
        }
    };
}

function random() {
    return Math.round(Math.random() * 10) / 10;
}

function nearbyPosition(world, object) {
    return {
        x: Math.max(0, Math.min(world.dimensions.x, object.center.x + (random() - 0.5) * 100)),
        y: Math.max(0, Math.min(world.dimensions.y, object.center.y + (random() - 0.5) * 100))
    }
}

function capture(a, b) {
    return Math.abs(a.center.x - b.center.x) < 7 && Math.abs(a.center.y - b.center.y) < 7;
}
