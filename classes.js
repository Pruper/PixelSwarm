const CHUNK_SIZE = 16;
const TILE_SPRITESHEET_VALUES = {
    0: { x: 0, y: 0 }, // grass tile
    1: { x: 1, y: 0 }, // rock tile
    2: { x: 2, y: 0 } // butter tile
}

class Chunk {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(0);

        for (let i = 0; i < this.tiles.length; i++) {
            const randomNumber = Math.random();
            this.tiles[i] = randomNumber > 0.999 ? 2 : randomNumber > 0.9 ? 1 : 0;
        }
    }

    visible() {
        let topLeft = screenPositionFromCoordinates(this.x * CHUNK_SIZE, this.y * CHUNK_SIZE)
        let bottomRight = screenPositionFromCoordinates((this.x + 1) * CHUNK_SIZE, (this.y + 1) * CHUNK_SIZE);

        return boundingBoxWithinScreen(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    }

    draw(ctx, spritesheet, scale) {
        if (!this.visible()) return;
        let drawCoords = screenPositionFromCoordinates(this.x * CHUNK_SIZE, this.y * CHUNK_SIZE);

        for (let drawY = 0; drawY < CHUNK_SIZE; drawY++) {
            for (let drawX = 0; drawX < CHUNK_SIZE; drawX++) {
                let tile = this.tiles[drawY * CHUNK_SIZE + drawX];
                let spriteLocation = TILE_SPRITESHEET_VALUES[tile];
                spritesheet.draw(ctx, spriteLocation.x, spriteLocation.y, drawCoords.x + drawX * SPRITE_SIZE * scale, drawCoords.y + drawY * SPRITE_SIZE * scale, scale);
            }
        }

        drawTextWithShadow(ctx, "chunk " + this.x + ", " + this.y, drawCoords.x + 10, drawCoords.y + 10, "#D7D700");
    }
}

const VISIBILITY_PADDING = 0.2;

class Entity {
    constructor(x, y, rotation, spriteX, spriteY) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.movement = { x: 0, y: 0 }
        this.hitbox = { type: "circle", radius: 0.36 };

        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.renderScale = 1;
    }

    visible() {
        let topLeft = screenPositionFromCoordinates(this.x - (0.5 * this.renderScale) - VISIBILITY_PADDING, this.y - (0.5 * this.renderScale) - VISIBILITY_PADDING);
        let bottomRight = screenPositionFromCoordinates(this.x - (0.5 * this.renderScale) + SPRITE_SIZE + VISIBILITY_PADDING, this.y - (0.5 * this.renderScale) + SPRITE_SIZE + VISIBILITY_PADDING);

        return boundingBoxWithinScreen(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    }


    interpolatedCoordinates() {
        const timeSinceLastTick = Date.now() - lastTick;
        const interpolationFactor = timeSinceLastTick / (1000 / TICKRATE);
        return pointBoundaryCheck(this.x + this.movement.x * interpolationFactor, this.y + this.movement.y * interpolationFactor);
    }

    tick() {
        this.x += this.movement.x;
        this.y += this.movement.y;
    }

    fixPosition() {
        const coords = pointBoundaryCheck(this.x, this.y);
        this.x = coords.x;
        this.y = coords.y;
    }

    draw(ctx, spritesheet, scale) {
        if (!this.visible()) return;

        const interpolated = this.interpolatedCoordinates();

        let drawCoords = screenPositionFromCoordinates(interpolated.x - (0.5 * this.renderScale), interpolated.y - (0.5 * this.renderScale));
        spritesheet.drawRotated(ctx, this.spriteX, this.spriteY, drawCoords.x, drawCoords.y, this.rotation, scale * this.renderScale);
    }

    drawHitbox(ctx, scale) {
        if (this.hitbox.type == "circle") {
            const interpolated = this.interpolatedCoordinates();
            let drawCoords = screenPositionFromCoordinates(interpolated.x, interpolated.y); // center of circle should be in center of entity

            ctx.beginPath();
            ctx.arc(drawCoords.x, drawCoords.y, this.hitbox.radius * SPRITE_SIZE * scale, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
    }
}

class Dummy extends Entity {
    constructor(x, y) {
        const speed = randomRange(2 / TICKRATE, 6 / TICKRATE);
        super(x, y, 0, speed >= 5 / TICKRATE ? 5 : speed >= 4 / TICKRATE ? 4 : speed >= 3 / TICKRATE ? 3 : 2, 15);
        this.movementSpeed = speed;
        this.directionChangeTimer = 0;
    }

    tick() {
        super.tick();
        this.directionChangeTimer--;
        if (this.directionChangeTimer <= 0) {
            const movementVector = normalizeVector(Math.random() - 0.5, Math.random() - 0.5, this.movementSpeed);
            this.movement.x = movementVector.x;
            this.movement.y = movementVector.y;
            this.directionChangeTimer = randomRange(30, 50);
        }
        this.rotation = getAngleTowards(0, 0, this.movement.x, this.movement.y);
    }
}

class Player extends Entity {
    // player code here
}

class Rock extends Entity {
    constructor(x, y) {
        super(x, y, 0, 1, 14);

        const randomScale = 1 + Math.random();

        this.hitbox = { type: "circle", radius: 0.36 * randomScale };

        this.renderScale = randomScale;
    }

    tick() {
        super.tick();
        this.movement.x = 0;
        this.movement.y = 0;
    }
}


const SPRITE_SIZE = 16;

class SpriteSheet {
    constructor(image) {
        this.image = image;
    }

    draw(ctx, sheetX, sheetY, x, y, scale = 1) {
        if (!this.image.complete) return;

        ctx.imageSmoothingEnabled = false;

        const inset = 0.1; // change if issues
        const sourceX = sheetX * SPRITE_SIZE + inset;
        const sourceY = sheetY * SPRITE_SIZE + inset;
        const sourceWidth = SPRITE_SIZE - inset * 2;
        const sourceHeight = SPRITE_SIZE - inset * 2;

        ctx.drawImage(
            this.image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            x,
            y,
            SPRITE_SIZE * scale,
            SPRITE_SIZE * scale
        );
    }

    drawRotated(ctx, sheetX, sheetY, x, y, rotation = 0, scale = 1) {
        ctx.save();
        ctx.translate(x + (SPRITE_SIZE * scale) / 2, y + (SPRITE_SIZE * scale) / 2);
        ctx.rotate(rotation * (Math.PI / 180)); // convert to radians
        this.draw(ctx, sheetX, sheetY, -(SPRITE_SIZE * scale) / 2, -(SPRITE_SIZE * scale) / 2, scale);
        ctx.restore();
    }
}