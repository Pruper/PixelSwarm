// Define game name/version
const GAME_NAME = "Pixel Swarm"
const GAME_VERSION = "alpha"
const GAME_NAMEVER = GAME_NAME + " version " + GAME_VERSION;
// Add game info and credit to footer
document.getElementById("footer-information").innerHTML = GAME_NAMEVER + "<br>Made by Pruper";

// Basic variables
const TICKRATE = 20;
const PLAYER_SPEED = 4 / TICKRATE;

const MAP_CHUNK_SIZE = 2;
const MAP_INITIAL_ENTITIES = 100;
const WORLD_BOUNDARY = 16 / 2 * CHUNK_SIZE;

// Set up keybinds
let keybinds = {
    "w": false, // up
    "s": false, // down
    "a": false, // left
    "d": false, // right
    "b": false, // show hitboxes
    "r": false, // spawn rock entity
    "shift": false, // switch tile placement
    "f2": false, // take screenshots
}

// Key events
window.addEventListener('keydown', function (event) {
    if (!event.key.toLowerCase() in keybinds) return;

    if (!keybinds["f2"] && event.key.toLowerCase() == "f2") {
        screenshot();
    }

    if (numberKeys.contains(event.key.toLowerCase()) && !keybinds[event.key.toLowerCase]) {
        inventorySelection = Number.parseInt(event.key.toLowerCase()) - 1;
    };

    keybinds[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', function (event) {
    if (!event.key.toLowerCase() in keybinds) return;
    keybinds[event.key.toLowerCase()] = false;
});

// Inventory variables and related keybinds
const INVENTORY_SIZE = 5;
let inventorySelection = 0;
let numberKeys = [];
for (let i = 0; i < INVENTORY_SIZE; i++) {
    keybinds[(i + 1) + ""] = false;
    numberKeys.push((i + 1) + "");
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let fps = 0;
let tps = 0;
let lastTick = Date.now();

let debugText = fps + " fps, " + tps + " ticks";

let spritesImage = new Image();
spritesImage.src = "sprites.png";
spritesheet = new SpriteSheet(spritesImage);

let map = new Map(MAP_CHUNK_SIZE, MAP_INITIAL_ENTITIES);

let playerEntity = new Player(0, 0, 0, Math.round(Math.random()), 15);
map.addEntity(playerEntity);

function screenshot() {
    canvas.toBlob(blob => {
        if (!blob) {
            console.error('Failed to convert canvas to blob.');
            return;
        }

        const item = new ClipboardItem({ 'image/png': blob });

        navigator.clipboard.write([item]).then(
            () => {
                console.log('Canvas copied to clipboard successfully!');
            },
            err => {
                console.error('Failed to copy canvas to clipboard: ', err);
            }
        );
    }, 'image/png');
}


function screenPositionFromCoordinates(x, y) {
    let offset = playerEntity.interpolatedCoordinates();
    x = x - offset.x;
    y = y - offset.y;
    return { x: (x * RENDER_SCALE * SPRITE_SIZE) + canvas.width / 2, y: (y * RENDER_SCALE * SPRITE_SIZE) + canvas.height / 2 }
}

function coordinatesFromScreenPosition(x, y) {
    let offset = playerEntity.interpolatedCoordinates();
    x = (x - canvas.width / 2) / (RENDER_SCALE * SPRITE_SIZE);
    y = (y - canvas.height / 2) / (RENDER_SCALE * SPRITE_SIZE);

    return { x: x + offset.x, y: y + offset.y };
}

function pointWithinScreen(x, y) {
    return (x >= 0 && x <= canvas.width) && (y >= 0 && y <= canvas.height);
}

function boundingBoxWithinScreen(x1, y1, x2, y2) {
    return (x1 <= canvas.width && x2 >= 0 && y1 <= canvas.height && y2 >= 0);
}

let mousePosition = { x: 0, y: 0 };
let selectionBox = { x: 0, y: 0, visible: false }

canvas.addEventListener("mousemove", function (e) {
    let mouseCoords = getRelativeCoordinates(e, canvas);

    mousePosition.x = mouseCoords.x;
    mousePosition.y = mouseCoords.y;

    let ingameMouseCoords = coordinatesFromScreenPosition(mouseCoords.x, mouseCoords.y);

    playerEntity.rotation = getAngleTowards(playerEntity.x, playerEntity.y, ingameMouseCoords.x, ingameMouseCoords.y);
    selectionBox.visible = true;
});

canvas.addEventListener("mouseleave", function (e) {
    selectionBox.visible = false;
});

canvas.addEventListener("mousedown", function (e) {
    if (e.button == 2) {
        // right click
        if (map.useItem(selectionBox.x, selectionBox.y, playerEntity.inventory.getItem(inventorySelection))) {
            playerEntity.inventory.removeFromSlot(inventorySelection, 1);
        }
    } else {
        // left or middle click
        map.attemptDestroyTile(selectionBox.x, selectionBox.y);
    }
});

canvas.oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }

function tick() {
    if (keybinds["r"]) map.addEntity(new Rock(playerEntity.x, playerEntity.y));

    // entity ticking and movement

    for (let i = 0; i < map.entities.length; i++) {
        map.entities[i].tick();
    }

    playerEntity.movement.x = 0;
    playerEntity.movement.y = 0;

    if (keybinds["w"]) playerEntity.movement.y -= PLAYER_SPEED;
    if (keybinds["s"]) playerEntity.movement.y += PLAYER_SPEED;
    if (keybinds["a"]) playerEntity.movement.x -= PLAYER_SPEED;
    if (keybinds["d"]) playerEntity.movement.x += PLAYER_SPEED;

    const normalized = normalizeVector(playerEntity.movement.x, playerEntity.movement.y, PLAYER_SPEED);

    playerEntity.movement.x = normalized.x;
    playerEntity.movement.y = normalized.y;

    for (let i = 0; i < map.entities.length; i++) {
        for (let j = i + 1; j < map.entities.length; j++) {
            if (map.entities[i].collisionCheck(map.entities[j])) {
                resolveCollision(map.entities[i], map.entities[j]);
            }
        }
        const fixedCoords = map.entities[i].fixedPosition();
        map.entities[i].x = fixedCoords.x;
        map.entities[i].y = fixedCoords.y;
    }

    for (let i = 0; i < map.entities.length; i++) {
        if (map.entities[i].removed) { 
            map.entities.splice(i, 1);
            i--;
        }
    }

    lastTick = Date.now();
    tps++;
}

function resolveCollision(entity1, entity2) {
    if (entity1.hitbox.type != "circle" || entity2.hitbox.type != "circle") return;
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
        const offset = 0.01;
        entity2.x += offset;
        entity2.y += offset;
        return;
    }

    const overlap = entity1.hitbox.radius + entity2.hitbox.radius - distance;
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    entity1.x -= normalizedDx * overlap / 2;
    entity1.y -= normalizedDy * overlap / 2;
    entity2.x += normalizedDx * overlap / 2;
    entity2.y += normalizedDy * overlap / 2;

    entity1.movement.x -= normalizedDx * overlap / 2;
    entity1.movement.y -= normalizedDy * overlap / 2;
    entity2.movement.x += normalizedDx * overlap / 2;
    entity2.movement.y += normalizedDy * overlap / 2;
}


const RENDER_SCALE = 4;

function render() {
    ctx.fillStyle = "#555555";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let chunks = Object.values(map.chunks);
    for (let i = 0; i < chunks.length; i++) {
        chunks[i].draw(ctx, spritesheet, RENDER_SCALE);
    }

    if (selectionBox.visible) {
        let ingameMouseCoords = coordinatesFromScreenPosition(mousePosition.x, mousePosition.y);
        selectionBox.x = Math.floor(ingameMouseCoords.x);
        selectionBox.y = Math.floor(ingameMouseCoords.y);
        let selRenderCoords = screenPositionFromCoordinates(selectionBox.x, selectionBox.y);

        spritesheet.draw(ctx, 0, 14, selRenderCoords.x, selRenderCoords.y, RENDER_SCALE); // selection box
    }

    let renderedEntities = 0;
    for (let i = 0; i < map.entities.length; i++) {
        if (!map.entities[i].visible()) continue;
        renderedEntities++;
        map.entities[i].draw(ctx, spritesheet, RENDER_SCALE);
    }

    if (keybinds["b"]) {
        for (let i = 0; i < map.entities.length; i++) {
            map.entities[i].drawHitbox(ctx, RENDER_SCALE);
        }
    }

    playerEntity.inventory.drawAsHotbar();

    drawTextWithShadow(ctx, "Position: " + Number(playerEntity.x).toFixed(2) + ", " + Number(playerEntity.y).toFixed(2), 10, 10);
    drawTextWithShadow(ctx, debugText, 10, 35);
    drawTextWithShadow(ctx, renderedEntities + " / " + map.entities.length + " entities rendered", 10, 60);

    fps++;
    window.requestAnimationFrame(render);
}

function drawTextWithShadow(ctx, text, x, y, color = "#FFFFFF") {
    drawText(ctx, text, x + 2, y + 2, darkenHexColor(color, 170));
    drawText(ctx, text, x, y, color);
}

function drawText(ctx, text, x, y, color = "#FFFFFF", align = "left") {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    ctx.font = "bold " + (6 * RENDER_SCALE) + "px Courier";
    ctx.fillText(text, x, y);
}


window.requestAnimationFrame(render);
window.setInterval(tick, 1000 / TICKRATE);
window.setInterval(function () {
    //console.log("FPS: " + fps + ", TPS: " + tps);
    debugText = fps + " fps, " + tps + " ticks";
    fps = 0;
    tps = 0;
}, 1000);

function getRelativeCoordinates(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function newCoordinates(x1, y1, x2, y2, distance) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let length = Math.sqrt(dx * dx + dy * dy);

    let unitDx = dx / length;
    let unitDy = dy / length;

    let scaledDx = unitDx * distance;
    let scaledDy = unitDy * distance;

    let newX = x1 + scaledDx;
    let newY = y1 + scaledDy;

    return { x: newX, y: newY };
}

function getAngleTowards(x1, y1, x2, y2) {
    let x = x2 - x1;
    let y = y2 - y1;

    if (x < 0) return 270 - (Math.atan(y / -x) * 180 / Math.PI);
    return 90 + (Math.atan(y / x) * 180 / Math.PI);
}

function normalizeVector(x, y, length) {
    const currentLength = Math.hypot(x, y);
    return currentLength === 0 ? { x: 0, y: 0 } : { x: x * length / currentLength, y: y * length / currentLength };
}

function darkenHexColor(hex, amount) {
    hex = hex.replace(/^#/, '');
    return `#${[0, 1, 2].map(i =>
        Math.max(0, parseInt(hex.slice(i * 2, i * 2 + 2), 16) - amount)
            .toString(16)
            .padStart(2, '0')
    ).join('')
        }`.toUpperCase();
}

function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

// utils

Object.defineProperty(Array.prototype, "contains", {
    configurable: true,
    writable: true,
    value: function contains(x) {
        return this.indexOf(x) !== -1;
    }
});

function modFix(n, m) {
    return ((n % m) + m) % m;
}
