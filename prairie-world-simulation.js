main();

function main() {
    let screen = document.getElementById('canvas').getContext('2d');
    screen.canvas.width = window.innerWidth;
    screen.canvas.height = window.innerHeight;
    let world = {
        grass: [makeGrass({x: 250, y: 400}), makeGrass({x: 340, y: 150})],
        cows: [makeCow({x: 90, y: 50}), makeCow({x: 20, y: 350})],
        wolves: [makeWolf({x: 450, y: 200}), makeWolf({x: 100, y: 200})],
        dimensions: {x: screen.canvas.width, y: screen.canvas.height},
    };

    function tick() {
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
        grass.radius = Math.min(15, 5 + grass.age);
        if (grass.multiplication <= 3 && Math.random() <= Math.max(0, 0.01 * (1 - grassNumber / 100))) {
            world.grass.push(makeGrass(nearbyPosition(world, grass)));
            grass.multiplication--;
        }
    }
}

function updateCows(world) {
    for (let i = 0; i < world.cows.length; i++) {
        let cow = world.cows[i];
        if (cow.energy <= 0) {
            world.cows.splice(i, 1);
        }
    }
    for (let i = 0; i < world.cows.length; i++) {
        let cow = world.cows[i];
        cow.age += 0.02;
        cow.energy -= 0.03;
        if (cow.multiplication <= 3 && cow.energy > 10) {
            world.cows.push(makeGrass(nearbyPosition(world, cow)));
            cow.multiplication--;
            cow.energy -= 5;
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
        velocity: {x: 0, y: 0},
        center: center,
        radius: 7,
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
