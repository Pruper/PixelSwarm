const CHUNK_SIZE = 16;
const TILE_DATA = {
    0: { x: 15, y: 1, solid: false, break: null, name: "Air" },
    1: { x: 0, y: 0, solid: false, break: { 1: 1 }, name: "Grass" },
    6: { x: 0, y: 1, solid: false, break: { 6: 1 }, name: "Dirt" },
    7: { x: 1, y: 1, solid: false, break: { 6: 1, 4: 6, 5: 2 }, name: "Tree" },

    2: { x: 1, y: 0, solid: false, break: { 2: 1 }, name: "Rock" },
    3: { x: 2, y: 0, solid: false, break: { 3: 1 }, name: "Butter" },
    4: { x: 3, y: 0, hardness: 0.5, solid: true, break: { 4: 1 }, name: "Wood" },
    5: { x: 4, y: 0, solid: false, break: { 5: 1 }, name: "Floor" },
    11: { x: 0, y: 2, hardness: 2, solid: true, break: { 11: 1 }, name: "Metal" },

    8: { x: 2, y: 1, solid: false, break: { 8: 1 }, explosionPower: 2, name: "TNT" },
    9: { x: 3, y: 1, solid: false, break: { 9: 1 }, explosionPower: 4, name: "C4" },
    10: { x: 4, y: 1, solid: false, break: { 10: 1 }, explosionPower: 8, name: "Nuclear Bomb" },


    999: { x: 15, y: 0, solid: false, break: null, name: "Null" }
}

const MINIMUM_EXPLOSION_POWER = 0.4;

class Chunk {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(0);

        for (let i = 0; i < this.tiles.length; i++) {
            const randomNumber = Math.random();
            this.tiles[i] = randomNumber > 0.999 ? 3 : randomNumber > 0.96 ? 7 : randomNumber > 0.84 ? 2 : 1;
        }
    }

    getInternalTile(x, y) {
        return this.tiles[modFix(x, CHUNK_SIZE) + y * CHUNK_SIZE];
    }

    getInternalTileMapCoordinates(x, y) {
        return { x: this.x * CHUNK_SIZE + x, y: this.y * CHUNK_SIZE + y };
    }

    setInternalTile(x, y, tile, conditional = false) {
        let previousTile = this.tiles[(modFix(x, CHUNK_SIZE)) + y * CHUNK_SIZE];

        if (conditional && previousTile != 0) {
            if (previousTile == tile) return false;
            this.attemptDestroyInternalTile(x, y);
            // return false; // cant place on another tile (that isn't air)
        }
        this.tiles[(modFix(x, CHUNK_SIZE)) + y * CHUNK_SIZE] = tile;
        return true;
    }

    explodeInternalTile(x, y, explosionPower) {
        let blownUpTile = this.getInternalTile(x, y);
        let hardness = TILE_DATA[blownUpTile].hardness == null ? 0 : TILE_DATA[blownUpTile].hardness;

        if (explosionPower < hardness) return;
        this.attemptDestroyInternalTile(x, y);

        const boomExpansionBase = this.getInternalTileMapCoordinates(x, y);
        const newExplosionPower = (explosionPower - hardness) * randomRange(0.35, 0.75);

        if (newExplosionPower < MINIMUM_EXPLOSION_POWER) return;

        map.markForExplosion(boomExpansionBase.x + 1, boomExpansionBase.y, newExplosionPower);
        map.markForExplosion(boomExpansionBase.x - 1, boomExpansionBase.y, newExplosionPower);
        map.markForExplosion(boomExpansionBase.x, boomExpansionBase.y + 1, newExplosionPower);
        map.markForExplosion(boomExpansionBase.x, boomExpansionBase.y - 1, newExplosionPower);
    }

    attemptDestroyInternalTile(x, y) {
        const tileData = TILE_DATA[this.getInternalTile(x, y)];
        if (tileData.break == null) return;

        this.setInternalTile(x, y, 0);
        const keys = Object.keys(tileData.break);
        for (let i in keys) {
            for (let c = 0; c < tileData.break[keys[i]]; c++) {
                map.addEntity(new ItemEntity(this.x * CHUNK_SIZE + x + 0.5, this.y * CHUNK_SIZE + y + 0.5, keys[i]))
            }
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
                let spriteLocation = TILE_DATA[tile];
                spritesheet.draw(ctx, spriteLocation.x, spriteLocation.y, drawCoords.x + drawX * SPRITE_SIZE * scale, drawCoords.y + drawY * SPRITE_SIZE * scale, scale);
            }
        }

        // drawTextWithShadow(ctx, "chunk " + this.x + ", " + this.y, drawCoords.x + 10, drawCoords.y + 10, "#D7D700");
    }
}

class Inventory {
    constructor(size) {
        this.size = size;
        this.items = [];
        for (let i = 0; i < this.size; i++) {
            this.items.push(null);
        }
    }

    drawAsHotbar(x, y) {
        for (let slot = 0; slot < this.size; slot++) {
            spritesheet.draw(ctx, slot === inventorySelection ? 1 : 0, 13, 20 + slot * 75, 400, RENDER_SCALE);
            drawTextWithShadow(ctx, slot + 1, 45 + slot * 75, 455, "#F0F0B0");
        }

        // draw this after so items/text is always on top
        for (let slot = 0; slot < this.size; slot++) {
            if (this.items[slot] == null) continue;
            spritesheet.draw(ctx, TILE_DATA[this.items[slot].id].x, TILE_DATA[this.items[slot].id].y, 37.5 + slot * 75, 415, RENDER_SCALE * 0.5);
            if (this.items[slot].amount != 1) drawTextWithShadow(ctx, this.items[slot].amount, 52.5 + slot * 75, 405, "#FFFFFF", "right");
        }

        if (this.getItem(inventorySelection) != null) {
            drawTextWithShadow(ctx, "Selected: " + TILE_DATA[this.getItem(inventorySelection).id].name, 25, 370);
        }
    }

    getItem(slot) {
        return this.items[slot];
    }

    setItem(slot, id, amount) {
        if (!slot in this.items) return;
        slot[this.items] = { id: id, amount: amount };
    }

    removeFromSlot(slot, amount) {
        if (this.items[slot] == null) return;
        this.items[slot].amount -= amount;
        if (this.items[slot].amount <= 0) this.items[slot] = null;
    }

    canFitItem(id, amount) {
        for (let slot = 0; slot < this.size; slot++) {
            if (this.items[slot] == null) return true; // empty slot = can fit gauranteed
            if (this.items[slot].id == id) return true; // same item id = can fit gauranteed
        }
        return false;
    }

    addItem(id, amount) {
        if (!this.canFitItem(id, amount)) return;
        for (let slot = 0; slot < this.size; slot++) {
            if (this.items[slot] == null) continue;
            if (this.items[slot].id == id) {
                this.items[slot].amount += amount;
                return;
            }
        }

        // this has to be done after to prevent empty slots getting filled with already held itemss
        for (let slot = 0; slot < this.size; slot++) {
            if (this.items[slot] == null) {
                this.items[slot] = { id: id, amount: amount };
                return;
            }
        }
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

        this.removed = false;
    }

    remove() {
        this.removed = true;
    }

    visible() {
        let topLeft = screenPositionFromCoordinates(this.x - (0.5 * this.renderScale) - VISIBILITY_PADDING, this.y - (0.5 * this.renderScale) - VISIBILITY_PADDING);
        let bottomRight = screenPositionFromCoordinates(this.x - (0.5 * this.renderScale) + SPRITE_SIZE + VISIBILITY_PADDING, this.y - (0.5 * this.renderScale) + SPRITE_SIZE + VISIBILITY_PADDING);

        return boundingBoxWithinScreen(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
    }


    interpolatedCoordinates() {
        const timeSinceLastTick = Date.now() - lastTick;
        const interpolationFactor = timeSinceLastTick / (1000 / TICKRATE);
        return this.fixedPosition(this.x + this.movement.x * interpolationFactor, this.y + this.movement.y * interpolationFactor, this.hitbox);
    }

    tick() {
        this.x += this.movement.x;
        this.y += this.movement.y;
    }

    fixedPosition(thisX = this.x, thisY = this.y) {
        // thisX and thisY used for interpolated coordinates
        const firstCoords = map.pointBoundaryCheckHitbox(thisX, thisY, this.hitbox);

        const topLeftSolidX = Math.floor(thisX - this.hitbox.radius);
        const topLeftSolidY = Math.floor(thisY - this.hitbox.radius);
        const bottomRightSolidX = Math.floor(thisX + 1 + this.hitbox.radius);
        const bottomRightSolidY = Math.floor(thisY + 1 + this.hitbox.radius);

        let facesToCheck = [];
        for (let x = topLeftSolidX; x < bottomRightSolidX; x++) {
            for (let y = topLeftSolidY; y < bottomRightSolidY; y++) {
                facesToCheck = facesToCheck.concat(map.createTileFaces(x, y));
            }
        }

        const secondCoords = map.pointBoundaryCheckFaces(firstCoords.x, firstCoords.y, this.hitbox, facesToCheck);

        return { x: secondCoords.x, y: secondCoords.y };
    }

    draw(ctx, spritesheet, scale) {
        if (!this.visible()) return;

        const interpolated = this.interpolatedCoordinates();

        let drawCoords = screenPositionFromCoordinates(interpolated.x - (0.5 * this.renderScale), interpolated.y - (0.5 * this.renderScale));
        spritesheet.drawRotated(ctx, this.spriteX, this.spriteY, drawCoords.x, drawCoords.y, this.rotation, scale * this.renderScale);
    }

    drawHitbox(ctx, scale) {
        if (this.hitbox.type == "circle") {
            // const interpolated = this.interpolatedCoordinates();
            let drawCoords = screenPositionFromCoordinates(this.x, this.y); // center of circle should be in center of entity

            ctx.beginPath();
            ctx.arc(drawCoords.x, drawCoords.y, this.hitbox.radius * SPRITE_SIZE * scale, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();

            // collision search bounds
            const topLeft = screenPositionFromCoordinates(Math.floor(this.x - this.hitbox.radius), Math.floor(this.y - this.hitbox.radius));
            const bottomRight = screenPositionFromCoordinates(Math.floor(this.x + 1 + this.hitbox.radius), Math.floor(this.y + 1 + this.hitbox.radius));

            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FF00FF";
            ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        }
    }

    collisionCheck(otherEntity) {
        if (this.hitbox.type != "circle" || otherEntity.hitbox.type != "circle") return false;
        const dx = otherEntity.x - this.x;
        const dy = otherEntity.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = this.hitbox.radius + otherEntity.hitbox.radius;
        return distance < combinedRadius;
    }
}

class Player extends Entity {
    constructor(x, y, rotation, spriteX, spriteY) {
        super(x, y, rotation, spriteX, spriteY);
        this.inventory = new Inventory(INVENTORY_SIZE);
    }

    collisionCheck(otherEntity) {
        let result = super.collisionCheck(otherEntity);
        if (result && otherEntity instanceof ItemEntity) {
            otherEntity.tryPickup(this);
        }
        return result;
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

class ItemEntity extends Entity {
    constructor(x, y, id) {
        super(x, y, 0, TILE_DATA[id].x, TILE_DATA[id].y);
        this.id = id;
        this.hitbox = { type: "circle", radius: 0.1 };
        this.randomMovement(1);
        this.renderScale = 0.4;
    }

    randomMovement(intensity) {
        this.movement.x = intensity * (Math.random() - 0.5) / 4;
        this.movement.y = intensity * (Math.random() - 0.5) / 4;
    }

    tick() {
        super.tick();
        this.movement.x *= 0.8;
        this.movement.y *= 0.8;
        this.rotation += 10;
        if (TILE_DATA[map.getTile(this.x, this.y)].solid && Math.abs(this.movement.x) < 1) {
            this.randomMovement(3);
        }
    }

    collisionCheck(otherEntity) {
        let result = super.collisionCheck(otherEntity);
        if (result && otherEntity instanceof Player) {
            this.tryPickup(otherEntity);
        }
        return result;
    }

    tryPickup(player) {
        if (this.removed || !player.inventory.canFitItem(this.id, 1)) return;

        player.inventory.addItem(this.id, 1);
        this.remove();
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

const EXPLOSION_CYCLES_PER_TICK = 2;

class Map {
    constructor(size, debugEntities) {
        this.chunks = {};
        this.entities = [];
        this.explosions = [];
        this.worldBoundary = CHUNK_SIZE / 2 * size;

        for (let cx = -Math.floor(MAP_CHUNK_SIZE / 2); cx < Math.floor(MAP_CHUNK_SIZE / 2); cx++) {
            for (let cy = -Math.floor(MAP_CHUNK_SIZE / 2); cy < Math.floor(MAP_CHUNK_SIZE / 2); cy++) {
                this.chunks[cx + ", " + cy] = new Chunk(cx, cy);
            }
        }

        for (let i = 0; i < debugEntities; i++) {
            this.addEntity(new Dummy(randomRange(-this.worldBoundary, this.worldBoundary), randomRange(-this.worldBoundary, this.worldBoundary)));
        }
    }

    tick() {
        // explosion cycles
        for (let i = 0; i < EXPLOSION_CYCLES_PER_TICK; i++) {
            const explosionNumberThisCycle = this.explosions.length;
            for (let j = 0; j < explosionNumberThisCycle; j++) {
                this.explodeTile(this.explosions[0].x, this.explosions[0].y, this.explosions[0].explosionPower);
                this.explosions.splice(0, 1);
            }
        }
    }

    markForExplosion(x, y, explosionPower) {
        this.explosions.push({ x: x, y: y, explosionPower: explosionPower });
    }

    explodeTile(x, y, explosionPower) {
        x = Math.floor(x); y = Math.floor(y);
        const chunk = this.getChunkFromTile(x, y);
        if (!(chunk instanceof Chunk)) return;

        // chained explosion
        if (TILE_DATA[this.getTile(x, y)].explosionPower) {
            explosionPower += TILE_DATA[this.getTile(x, y)].explosionPower;
            this.setTile(x, y, 0);
        }

        chunk.explodeInternalTile(modFix(x, CHUNK_SIZE), modFix(y, CHUNK_SIZE), explosionPower)
    }

    useItem(x, y, item) {
        // other usage
        const clickedTile = map.getTile(x, y);
        if (TILE_DATA[clickedTile].explosionPower >= MINIMUM_EXPLOSION_POWER) {
            this.setTile(x, y, 0);
            this.explodeTile(x, y, TILE_DATA[clickedTile].explosionPower);
            return false;
        }

        // place tile otherwise
        if (item == null) return false;
        return this.setTile(x, y, item.id, true);
    }

    setTile(x, y, tile, conditional = false) {
        x = Math.floor(x); y = Math.floor(y);
        const chunk = this.getChunkFromTile(x, y);
        if (!(chunk instanceof Chunk)) return false;
        return chunk.setInternalTile(modFix(x, CHUNK_SIZE), modFix(y, CHUNK_SIZE), tile, conditional);
    }

    attemptDestroyTile(x, y, tile) {
        x = Math.floor(x); y = Math.floor(y);
        const chunk = this.getChunkFromTile(x, y);
        if (!(chunk instanceof Chunk)) return;
        chunk.attemptDestroyInternalTile(modFix(x, CHUNK_SIZE), modFix(y, CHUNK_SIZE));
    }

    getTile(x, y) {
        x = Math.floor(x); y = Math.floor(y);
        const chunk = this.getChunkFromTile(x, y);
        if (!(chunk instanceof Chunk)) return 999;
        return chunk.getInternalTile(modFix(x, CHUNK_SIZE), modFix(y, CHUNK_SIZE));
    }

    getChunk(x, y) {
        x = Math.floor(x); y = Math.floor(y);
        return this.chunks[x + ", " + y];
    }

    getChunkFromTile(x, y) {
        return this.getChunk(Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE))
    }

    addEntity(entity) {
        if (!(entity instanceof Entity)) return;

        this.entities.push(entity);
    }

    removeEntity(entity) {
        if (!(entity instanceof Entity)) return;

        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    pointBoundaryCheck(x, y) {
        if (x < -map.worldBoundary) {
            x = -map.worldBoundary;
        } else if (x > map.worldBoundary) {
            x = map.worldBoundary;
        }

        if (y < -map.worldBoundary) {
            y = -map.worldBoundary;
        } else if (y > map.worldBoundary) {
            y = map.worldBoundary;
        }

        return { x: x, y: y }
    }

    pointBoundaryCheckHitbox(x, y, hitbox) {
        if (hitbox == null || hitbox.type != "circle") return this.pointBoundaryCheck(x, y);

        if (x - hitbox.radius < -map.worldBoundary) {
            x = -map.worldBoundary + hitbox.radius;
        } else if (x + hitbox.radius > map.worldBoundary) {
            x = map.worldBoundary - hitbox.radius;
        }

        if (y - hitbox.radius < -map.worldBoundary) {
            y = -map.worldBoundary + hitbox.radius;
        } else if (y + hitbox.radius > map.worldBoundary) {
            y = map.worldBoundary - hitbox.radius;
        }

        return { x: x, y: y }
    }

    createTileFaces(x, y) {
        if (!TILE_DATA[this.getTile(x, y)].solid) return [];
        return [{ x: x, y: y, length: 1, collider: "top" }, { x: x, y: y + 1, length: 1, collider: "bottom" }, { x: x, y: y, length: 1, collider: "left" }, { x: x + 1, y: y, length: 1, collider: "right" }];
    }

    pointBoundaryCheckFaces(x, y, hitbox, faces) {
        let coords = { x: x, y: y };
        for (let i = 0; i < faces.length; i++) {
            coords = this.pointBoundaryCheckFace(coords.x, coords.y, hitbox, faces[i]);
        }
        return coords;
    }

    pointBoundaryCheckFace(x, y, hitbox, face) {
        if (hitbox == null || hitbox.type !== "circle") {
            return this.pointBoundaryCheck(x, y);
        }

        const hitboxLeft = x - hitbox.radius;
        const hitboxRight = x + hitbox.radius;
        const hitboxTop = y - hitbox.radius;
        const hitboxBottom = y + hitbox.radius;

        if (face.collider === "top") {
            if (hitboxBottom >= face.y && face.x <= x && face.x + face.length >= x) {
                if (hitboxTop <= face.y + 0.01) {
                    y = face.y - hitbox.radius;
                }
            }
        } else if (face.collider === "bottom") {
            if (hitboxTop <= face.y && face.x <= x && face.x + face.length >= x) {
                // Ensure hitbox overlaps with the face
                if (hitboxBottom >= face.y - 0.01) {
                    y = face.y + hitbox.radius;
                }
            }
        } else if (face.collider === "left") {
            if (hitboxLeft <= face.x && face.y <= y && face.y + face.length >= y) {
                // Ensure hitbox overlaps with the face
                if (hitboxRight >= face.x - 0.01) {
                    x = face.x - hitbox.radius;
                }
            }
        } else if (face.collider === "right") {
            if (hitboxRight >= face.x && face.y <= y && face.y + face.length >= y) {
                // Ensure hitbox overlaps with the face
                if (hitboxLeft <= face.x + 0.01) {
                    x = face.x + hitbox.radius;
                }
            }
        }

        return { x: x, y: y };
    }
}