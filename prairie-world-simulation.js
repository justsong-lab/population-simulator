let count = 0;
let world = undefined;
main();

function main() {
    let screen = document.getElementById('canvas').getContext('2d');
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight;
    world = {
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
    for (let i = 0; i < 6 + Math.round(10 * Math.random()); i++) {
        world.wolves.push(makeWolf({x: screen.canvas.width * Math.random(), y: screen.canvas.height * Math.random()}));
    }

    function tick() {
        update(world);
        draw(world, screen);
        requestAnimationFrame(tick);
    }

    tick();
}

function update(world) {
    count++;
    count %= 60;
    if (count === 15) {
        world.grass.push(makeGrass({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
    } else if (count === 35) {
        world.cows.push(makeCow({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
    } else if (count === 55) {
        world.wolves.push(makeWolf({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
    }

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
                if (capture(cow, grass, 7)) {
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
        if (wolf.energy <= 0 || wolf.age >= 15 + 10 * random()) {
            world.wolves.splice(i, 1);
        }
    }
    for (let i = 0; i < world.wolves.length; i++) {
        let wolf = world.wolves[i];
        wolf.age += 0.02;
        wolf.energy -= 0.006;
        wolf.lastMultiplication++;
        if (wolf.multiplication <= 3 && wolf.energy > 10 && wolf.lastMultiplication > 100) {
            world.wolves.push(makeWolf(nearbyPosition(world, wolf)));
            world.wolves.push(makeWolf(nearbyPosition(world, wolf)));
            wolf.multiplication++;
            wolf.energy -= 5;
            wolf.lastMultiplication = 0;
        }
        wolf.radius = Math.min(10, Math.max(3, wolf.energy));
        wolf.velocity.x += random() - 0.5;
        wolf.velocity.y += random() - 0.5;
        if (random() > 0.9) {
            wolf.velocity.x = 2 * (random() - 0.5);
            wolf.velocity.y = 2 * (random() - 0.5);
        }
        wolf.center.x += wolf.velocity.x;
        if (wolf.center.x < 0) {
            wolf.center.x = 0;
            wolf.velocity.x = 0;
        } else if (wolf.center.x > world.dimensions.x) {
            wolf.center.x = world.dimensions.x;
            wolf.velocity.x = 0;
        }
        wolf.center.y += wolf.velocity.y;
        if (wolf.center.y < 0) {
            wolf.center.y = 0;
            wolf.velocity.y = 0;
        } else if (wolf.center.y > world.dimensions.y) {
            wolf.center.y = world.dimensions.y;
            wolf.velocity.y = 0;
        }
        if (count % 10 === 0) {
            for (let i = 0; i < world.cows.length; i++) {
                let cow = world.cows[i];
                if (capture(wolf, cow, 14)) {
                    wolf.energy += cow.energy;
                    world.cows.splice(i, 1);
                    break;
                }
            }
        }
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
        age: 0,
        energy: 2.5,
        multiplication: 0,
        lastMultiplication: 0,
        velocity: {x: 2, y: 2},
        center: center,
        radius: 5,
        draw: function (screen) {
            screen.beginPath();
            screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
            screen.closePath();
            screen.fillStyle = "#ff0002";
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

function capture(a, b, distance) {
    return Math.abs(a.center.x - b.center.x) < distance && Math.abs(a.center.y - b.center.y) < distance;
}

document.onkeydown = function (e) {
    switch (e.code) {
        case "KeyR":
            location.reload();
            break;
        case "KeyG":
            world.grass.push(makeGrass({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
            break;
        case "KeyC":
            world.cows.push(makeCow({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
            break;
        case "KeyW":
            world.wolves.push(makeWolf({x: world.dimensions.x * Math.random(), y: world.dimensions.y * Math.random()}));
            break;
        case "F11":
            location.reload();
            break;
        default:
            break;
    }
};
