const CHUNK_SIZE = 16;
const TILE_DATA = {
    0: { x: 15, y: 1, solid: false, break: null, name: "Air" },

    1: { x: 0, y: 0, solid: false, break: [{ id: 6, min: 1, max: 2 }], name: "Grass" },
    6: { x: 0, y: 1, solid: false, break: [{ id: 6, amount: 1 }], name: "Dirt" },
    12: { x: 1, y: 2, solid: false, break: [{ id: 12, amount: 1 }], name: "Tree Sapling" },
    7: { x: 1, y: 1, solid: true, break: [{ id: 12, amount: 1 }, { id: 4, min: 5, max: 7 }, { id: 5, min: 1, max: 3 }, { id: 20, amount: 1, chance: 0.1 }], name: "Tree" },

    2: { x: 1, y: 0, solid: false, break: [{ id: 2, amount: 1 }, { id: 11, amount: 1, chance: 0.1 }], name: "Rock" },
    3: { x: 2, y: 0, solid: false, break: [{ id: 3, amount: 1 }], name: "Butter" },
    4: { x: 3, y: 0, hardness: 0.5, solid: true, break: [{ id: 4, amount: 1 }], name: "Wood" },
    5: { x: 4, y: 0, solid: false, break: [{ id: 5, amount: 1 }], name: "Floor" },
    11: { x: 0, y: 2, hardness: 2, solid: true, break: [{ id: 11, amount: 1 }], name: "Metal" },

    13: { x: 2, y: 2, hardness: 9999, solid: false, speedModifier: 0.5, break: null, name: "Water" },
    14: { x: 3, y: 2, hardness: 9999, solid: true, break: [{ id: 14, amount: 1 }], name: "Explosion-proof Rock" },
    16: { x: 0, y: 3, solid: false, speedModifier: 3, break: [{ id: 16, amount: 1 }], name: "Speed Road" },

    8: { x: 2, y: 1, solid: false, break: [{ id: 8, amount: 1 }], explosionPower: 2.5, name: "TNT" },
    9: { x: 3, y: 1, solid: false, break: [{ id: 9, amount: 1 }], explosionPower: 5, name: "C4" },
    10: { x: 4, y: 1, solid: false, break: [{ id: 10, amount: 1 }], explosionPower: 10, name: "Nuclear Bomb" },
    17: { x: 1, y: 3, solid: false, break: [{ id: 17, amount: 1 }], name: "Powder Fuse" },
    18: { x: 2, y: 3, solid: false, break: [{ id: 17, amount: 1 }], name: "Lit Powder Fuse" },
    19: { x: 3, y: 3, solid: false, break: [{ id: 17, amount: 1 }], name: "Burned Powder Fuse" },

    20: { x: 5, y: 0, hardness: 0.5, solid: true, break: [{ id: 20, amount: 1 }], name: "Door" },
    21: { x: 6, y: 0, solid: false, break: [{ id: 20, amount: 1 }], name: "Open Door" },

    15: { x: 4, y: 2, solid: true, break: [{ id: 1001, min: 32, max: 64 }, { id: 16, min: 16, max: 32 }, { id: 8, min: 32, max: 64 }, { id: 9, min: 32, max: 64 }, { id: 10, min: 32, max: 64 }, { id: 17, min: 64, max: 128 }], name: "Supply Crate" },

    999: { x: 15, y: 0, solid: false, break: null, name: "Null" }
}

const DEFAULT_MAX_STACK_SIZE = 9999;
const ITEM_DATA = {
    1000: { x: 0, y: 7, handX: 1, handY: 7, handDistance: 0.6, maxStack: 1, name: "Colt Peacemaker" },
    1001: { x: 1, y: 6, handX: 1, handY: 6, handDistance: 0.5, name: "Matchstick" },
    1002: { x: 4, y: 6, handX: 4, handY: 6, handDistance: 0.5, name: "Dummy Hatcher" },




    0: { x: 15, y: 1, places: 0, handX: 15, handY: 1, name: "Air" },

    1: { x: 0, y: 0, places: 1, handX: 0, handY: 0, name: "Grass" },
    6: { x: 0, y: 1, places: 6, handX: 0, handY: 1, name: "Dirt" },
    12: { x: 0, y: 6, places: 12, handX: 0, handY: 6, handDistance: 0.5, name: "Tree Sapling" },
    7: { x: 1, y: 1, places: 7, handX: 1, handY: 1, name: "Tree" },

    2: { x: 1, y: 0, places: 2, handX: 1, handY: 0, name: "Rock" },
    3: { x: 2, y: 0, places: 3, handX: 2, handY: 0, name: "Butter" },
    4: { x: 3, y: 0, places: 4, handX: 3, handY: 0, name: "Wood" },
    5: { x: 4, y: 0, places: 5, handX: 4, handY: 0, name: "Floor" },
    11: { x: 0, y: 2, places: 11, handX: 0, handY: 2, name: "Metal" },

    13: { x: 2, y: 2, places: 13, handX: 2, handY: 2, name: "Water" },
    14: { x: 3, y: 2, places: 14, handX: 3, handY: 2, name: "Explosion-proof Rock" },
    16: { x: 0, y: 3, places: 16, handX: 0, handY: 3, name: "Speed Road" },

    8: { x: 2, y: 1, places: 8, handX: 2, handY: 1, name: "TNT" },
    9: { x: 3, y: 1, places: 9, handX: 3, handY: 1, name: "C4" },
    10: { x: 4, y: 1, places: 10, handX: 4, handY: 1, name: "Nuclear Bomb" },
    17: { x: 2, y: 6, places: 17, handX: 2, handY: 6, name: "Powder Fuse" },

    15: { x: 4, y: 2, places: 15, handX: 4, handY: 2, name: "Supply Crate" },

    20: { x: 3, y: 6, places: 20, handX: 3, handY: 6, handDistance: 0.5, name: "Door" },

    999: { x: 15, y: 0, places: 999, handX: 15, handY: 0, name: "Null" }
}


const MINIMUM_EXPLOSION_POWER = 0.4;

class Chunk {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tiles = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(0);

        for (let i = 0; i < this.tiles.length; i++) {
            const randomNumber = Math.random(); // 3: butter, 7: tree, 2: rock, 1: grass
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
        this.onUpdate(x, y, true);
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
        for (let i in tileData.break) {
            const amount = "amount" in tileData.break[i] ? tileData.break[i].amount : randomRangeInteger(tileData.break[i].min, (tileData.break[i].max));
            const chance = "chance" in tileData.break[i] ? tileData.break[i].chance : 1; // 100% chance unless defined

            if (amount >= 0 && randomRange(0, 1) <= chance) map.addEntity(new ItemEntity(this.x * CHUNK_SIZE + x + 0.5, this.y * CHUNK_SIZE + y + 0.5, tileData.break[i].id, amount));
            /*
            for (let c = 0; c < tileData.break[keys[i]]; c++) {
                map.addEntity(new ItemEntity(this.x * CHUNK_SIZE + x + 0.5, this.y * CHUNK_SIZE + y + 0.5, keys[i]))
            }
            */
        }
    }

    tickInternalTile(x, y) {
        const tile = this.getInternalTile(x, y);
        const mapCoords = this.getInternalTileMapCoordinates(x, y);

        switch (tile) {
            case (6): // dirt turns to grass if borders grass
                if (map.getTile(mapCoords.x + 1, mapCoords.y) === 1 || map.getTile(mapCoords.x - 1, mapCoords.y) === 1 || map.getTile(mapCoords.x, mapCoords.y + 1) === 1 || map.getTile(mapCoords.x, mapCoords.y - 1) === 1) {
                    this.setInternalTile(x, y, 1);
                }
                break;
            case (12): // saplings grow into trees
                this.setInternalTile(x, y, 7);
                break;
        }

        return false;
    }

    updateInternalTile(x, y) {
        const tile = this.getInternalTile(x, y);
        const mapCoords = this.getInternalTileMapCoordinates(x, y);

        switch (tile) {
            case (0): // water spreads to air
                if (map.getTile(mapCoords.x + 1, mapCoords.y) === 13 || map.getTile(mapCoords.x - 1, mapCoords.y) === 13 || map.getTile(mapCoords.x, mapCoords.y + 1) === 13 || map.getTile(mapCoords.x, mapCoords.y - 1) === 13) {
                    this.setInternalTile(x, y, 13);
                    return true;
                }
                break;
            case (18): // lit fuse spreads to fuse
                let litUp = false;

                if (map.getTile(mapCoords.x + 1, mapCoords.y) === 17) {
                    map.setTile(mapCoords.x + 1, mapCoords.y, 18);
                    litUp = true;
                }
                if (map.getTile(mapCoords.x - 1, mapCoords.y) === 17) {
                    map.setTile(mapCoords.x - 1, mapCoords.y, 18);
                    litUp = true;
                }
                if (map.getTile(mapCoords.x, mapCoords.y + 1) === 17) {
                    map.setTile(mapCoords.x, mapCoords.y + 1, 18);
                    litUp = true;
                }
                if (map.getTile(mapCoords.x, mapCoords.y - 1) === 17) {
                    map.setTile(mapCoords.x, mapCoords.y - 1, 18);
                    litUp = true;
                }

                // IGNITE EXPLOSIVES

                if ("explosionPower" in TILE_DATA[map.getTile(mapCoords.x + 1, mapCoords.y)]) {
                    map.markForExplosion(mapCoords.x + 1, mapCoords.y, TILE_DATA[map.getTile(mapCoords.x + 1, mapCoords.y)].explosionPower);
                }
                if ("explosionPower" in TILE_DATA[map.getTile(mapCoords.x - 1, mapCoords.y)]) {
                    map.markForExplosion(mapCoords.x - 1, mapCoords.y, TILE_DATA[map.getTile(mapCoords.x - 1, mapCoords.y)].explosionPower);
                }
                if ("explosionPower" in TILE_DATA[map.getTile(mapCoords.x, mapCoords.y + 1)]) {
                    map.markForExplosion(mapCoords.x, mapCoords.y + 1, TILE_DATA[map.getTile(mapCoords.x, mapCoords.y + 1)].explosionPower);
                }
                if ("explosionPower" in TILE_DATA[map.getTile(mapCoords.x, mapCoords.y - 1)]) {
                    map.markForExplosion(mapCoords.x, mapCoords.y - 1, TILE_DATA[map.getTile(mapCoords.x, mapCoords.y - 1)].explosionPower);
                }


                map.setTile(mapCoords.x, mapCoords.y, 19);
                return litUp;
                break;
        }

        return false;
    }

    onUpdate(x, y, includeThis = false) {
        const mapCoords = this.getInternalTileMapCoordinates(x, y);
        if (includeThis) map.markForUpdate(mapCoords.x, mapCoords.y);
        map.markForUpdate(mapCoords.x + 1, mapCoords.y);
        map.markForUpdate(mapCoords.x - 1, mapCoords.y);
        map.markForUpdate(mapCoords.x, mapCoords.y + 1);
        map.markForUpdate(mapCoords.x, mapCoords.y - 1);
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
            spritesheet.draw(ctx, ITEM_DATA[this.items[slot].id].x, ITEM_DATA[this.items[slot].id].y, 37.5 + slot * 75, 415, RENDER_SCALE * 0.5);
            if (this.items[slot].amount != 1) drawTextWithShadow(ctx, this.items[slot].amount, 52.5 + slot * 75, 405, "#FFFFFF", "center");
        }

        if (this.getItem(inventorySelection) != null) {
            drawTextWithShadow(ctx, "Selected: " + ITEM_DATA[this.getItem(inventorySelection).id].name, 25, 370);
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

    amountCanFit(id, amount) {
        const maxStack = ITEM_DATA[id].maxStack || DEFAULT_MAX_STACK_SIZE;
        let fitAmount = 0;
        let remaining = amount;

        for (let slot = 0; slot < this.size; slot++) {
            const item = this.items[slot];
            if (item?.id === id) {
                // how much can be added to stack?
                fitAmount += Math.min(remaining, maxStack - item.amount);
                remaining -= Math.min(remaining, maxStack - item.amount);
                if (remaining <= 0) return fitAmount; // requested amount met
            }
        }

        for (let slot = 0; slot < this.size; slot++) {
            if (!this.items[slot]) {
                fitAmount += Math.min(remaining, maxStack);
                remaining -= Math.min(remaining, maxStack);
                if (remaining <= 0) return fitAmount; // requested amount met
            }
        }

        return fitAmount; // total fittable amount
    }

    getEmptySlots() {
        let empties = 0;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] == null) empties++;
        }
        return empties;
    }

    addItem(id, amount) {
        let remaining = amount;
        const maxStack = ITEM_DATA[id].maxStack || DEFAULT_MAX_STACK_SIZE;

        for (let slot = 0; slot < this.size; slot++) {
            const item = this.items[slot];
            if (item?.id === id) {
                const addAmount = Math.min(remaining, maxStack - item.amount);
                item.amount += addAmount;
                remaining -= addAmount;
                if (!remaining) return 0;
            }
        }

        for (let slot = 0; slot < this.size; slot++) {
            if (!this.items[slot]) {
                const addAmount = Math.min(remaining, maxStack);
                this.items[slot] = { id, amount: addAmount };
                remaining -= addAmount;
                if (!remaining) return 0;
            }
        }

        return remaining;
    }
}

const NOCLIP_CHECK_STEP_SIZE = 0.2;
const VISIBILITY_PADDING = 0.2;

class Entity {
    constructor(x, y, rotation, spriteX, spriteY) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.movement = { x: 0, y: 0 }
        this.hitbox = { type: "circle", radius: 0.36 };
        this.collisionChannel = "main";

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
        let interpolatedX = this.x;
        let interpolatedY = this.y;

        let remainingX = this.movement.x * this.getTileSpeedModifier() * interpolationFactor;
        let remainingY = this.movement.y * this.getTileSpeedModifier() * interpolationFactor;

        while (remainingX || remainingY) {
            const stepX = Math.sign(remainingX) * Math.min(Math.abs(remainingX), NOCLIP_CHECK_STEP_SIZE);
            const stepY = Math.sign(remainingY) * Math.min(Math.abs(remainingY), NOCLIP_CHECK_STEP_SIZE);

            const { x, y } = this.fixedPosition(interpolatedX + stepX, interpolatedY + stepY, this.hitbox);
            interpolatedX = x;
            interpolatedY = y;

            remainingX -= stepX;
            remainingY -= stepY;
        }

        return { x: interpolatedX, y: interpolatedY };
    }

    getTileSpeedModifier() {
        const standingOnTiles = this.getOverlappingTiles();
        let speeds = [];

        for (let i = 0; i < standingOnTiles.length; i++) {
            const tileType = standingOnTiles[i];
            if (!("speedModifier" in TILE_DATA[tileType])) continue;
            const speedModifier = TILE_DATA[tileType].speedModifier;
            speeds.push(speedModifier);
        }

        if (speeds.length < 1) return 1;
        return speeds.reduce((a, b) => a + b) / speeds.length;
    }

    tick() {
        let { x: dx, y: dy } = this.movement;
        const speedModifier = this.getTileSpeedModifier();
        dx *= speedModifier;
        dy *= speedModifier;

        let foundCollision = {};

        while (dx || dy) {
            const stepX = Math.sign(dx) * Math.min(Math.abs(dx), NOCLIP_CHECK_STEP_SIZE);
            const stepY = Math.sign(dy) * Math.min(Math.abs(dy), NOCLIP_CHECK_STEP_SIZE);

            const { x, y, collided } = this.fixedPosition(this.x + stepX, this.y + stepY);
            this.x = x;
            this.y = y;
            foundCollision[collided] = true;

            dx -= stepX;
            dy -= stepY;
        }

        if (foundCollision["border"]) this.onBorderCollide();
        if (foundCollision["tile"]) this.onTileCollide();
    }

    onBorderCollide() { };
    onTileCollide() { };

    getOverlappingTiles() {
        const { x, y } = this;
        const { radius } = this.hitbox;
        const tileSize = 1;

        let tiles = [];
        const [minX, maxX, minY, maxY] = [
            Math.floor(x - radius), Math.ceil(x + radius),
            Math.floor(y - radius), Math.ceil(y + radius)
        ];

        for (let tx = minX; tx <= maxX; tx++) {
            for (let ty = minY; ty <= maxY; ty++) {
                const tileLeft = tx;
                const tileRight = tx + tileSize;
                const tileTop = ty;
                const tileBottom = ty + tileSize;

                // does tile overlap?
                const nearestX = Math.max(tileLeft, Math.min(x, tileRight));
                const nearestY = Math.max(tileTop, Math.min(y, tileBottom));
                const distanceX = x - nearestX;
                const distanceY = y - nearestY;

                if (Math.hypot(distanceX, distanceY) <= radius) {
                    tiles.push(map.getTile(tx, ty));
                }
            }
        }

        return tiles;
    }

    fixedPosition(thisX = this.x, thisY = this.y) {
        let collided = "none";
        // thisX and thisY used for interpolated coordinates
        const firstCoords = map.pointBoundaryCheckHitbox(thisX, thisY, this.hitbox);
        if (thisX != firstCoords.x || thisY != firstCoords.y) collided = "border";

        const topLeftSolidX = Math.floor(firstCoords.x - this.hitbox.radius);
        const topLeftSolidY = Math.floor(firstCoords.y - this.hitbox.radius);
        const bottomRightSolidX = Math.floor(firstCoords.x + 1 + this.hitbox.radius);
        const bottomRightSolidY = Math.floor(firstCoords.y + 1 + this.hitbox.radius);

        let facesToCheck = [];
        for (let x = topLeftSolidX; x < bottomRightSolidX; x++) {
            for (let y = topLeftSolidY; y < bottomRightSolidY; y++) {
                facesToCheck = facesToCheck.concat(map.createTileFaces(x, y));
            }
        }

        const secondCoords = map.pointBoundaryCheckFaces(firstCoords.x, firstCoords.y, this.hitbox, facesToCheck);
        if (firstCoords.x != secondCoords.x || firstCoords.y != secondCoords.y) collided = "tile";

        return { x: secondCoords.x, y: secondCoords.y, collided: collided };
    }

    draw(ctx, spritesheet, scale, pixelOffsetX = 0, pixelOffsetY = 0) {
        if (!this.visible()) return;

        const interpolated = this.interpolatedCoordinates();

        let drawCoords = screenPositionFromCoordinates(interpolated.x - (0.5 * this.renderScale), interpolated.y - (0.5 * this.renderScale));
        spritesheet.drawRotated(ctx, this.spriteX, this.spriteY, drawCoords.x + pixelOffsetX, drawCoords.y + pixelOffsetY, this.rotation, scale * this.renderScale);
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

class LivingEntity extends Entity {
    constructor(x, y, rotation, spriteX, spriteY) {
        super(x, y, rotation, spriteX, spriteY);
        this.health = 100;
        this.hurtTime = 0;
    }

    damage(amount) {
        if (this.hurtTime > 0) return;
        this.health -= amount;
        this.hurtTime += TICKRATE / 4;
    }

    projectileHit(projectileEntity) {
        if (!projectileEntity.removed) {
            this.damage(projectileEntity.damage)
        }
    }

    draw(ctx, spritesheet, scale) {
        super.draw(ctx, spritesheet, scale);
        // draw health
        //const interpolated = this.interpolatedCoordinates();
        //const drawPos = screenPositionFromCoordinates(interpolated.x, interpolated.y);
        //drawTextWithShadow(ctx, "❤︎ " + this.health, drawPos.x, drawPos.y - 60, "#F00000", "center");
    }

    tick() {
        super.tick();
        if (this.hurtTime > 0) this.hurtTime--;
        if (this.health <= 0) this.remove();
    }
}

class Player extends LivingEntity {
    constructor(x, y, rotation, spriteX, spriteY) {
        super(x, y, rotation, spriteX, spriteY);
        this.inventory = new Inventory(INVENTORY_SIZE);
        this.displayName = "You";
    }

    fireProjectile(entity) {
        if (!(entity instanceof Projectile)) return;
        map.addEntity(entity);
    }

    draw(ctx, spritesheet, scale) {
        const interpolated = this.interpolatedCoordinates();
        if (this.inventory.getItem(inventorySelection) != null) {
            const itemData = ITEM_DATA[this.inventory.getItem(inventorySelection).id];
            const itemDrawLocation = coordinatesAlongAngle(interpolated.x - (0.5 * 0.6), interpolated.y - (0.5 * 0.6), itemData.handDistance ? itemData.handDistance : 0.3, this.rotation - 90);
            const renderLocation = screenPositionFromCoordinates(itemDrawLocation.x, itemDrawLocation.y);
            spritesheet.drawRotated(ctx, itemData.handX, itemData.handY, renderLocation.x, renderLocation.y, this.rotation, RENDER_SCALE * 0.6);
        }
        /* use for later
        if (this.displayName != "") {
            const nameLocation = screenPositionFromCoordinates(interpolated.x, interpolated.y);
            drawTextWithShadow(ctx, this.displayName, nameLocation.x, nameLocation.y - 90, "#FFFFFF", "center");
        }
        */

        super.draw(ctx, spritesheet, scale);
    }

    dropItem(amount) {
        if (this.inventory.getItem(inventorySelection) == null) return;
        const item = this.inventory.getItem(inventorySelection);
        const spawnLocation = coordinatesAlongAngle(this.x, this.y, 0.1, this.rotation - 90);

        let entity = new ItemEntity(spawnLocation.x, spawnLocation.y, item.id, Math.min(item.amount, amount));
        entity.throwDelay = TICKRATE * 1;
        entity.movement.x = -(this.x - spawnLocation.x) * 4;
        entity.movement.y = -(this.y - spawnLocation.y) * 4;
        map.addEntity(entity);

        this.inventory.removeFromSlot(inventorySelection, amount);
    }

    collisionCheck(otherEntity) {
        let result = super.collisionCheck(otherEntity);
        if (result && otherEntity instanceof ItemEntity) {
            otherEntity.tryPickup(this);
        }
        return result;
    }
}

class Dummy extends LivingEntity {
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

        if (randomRangeInteger(1, TICKRATE * 300) === TICKRATE * 300) {
            map.addEntity(new ItemEntity(this.x, this.y, 1002, randomRangeInteger(1, 2)));
        }
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

const ITEM_MERGE_DISTANCE = 1;
const MULTI_ITEM_OFFSET_AMOUNT = 5;

class ItemEntity extends Entity {
    constructor(x, y, id, amount) {
        super(x, y, 0, ITEM_DATA[id].x, ITEM_DATA[id].y);
        this.hitbox = { type: "circle", radius: 0.25 };
        this.collisionChannel = "item";
        this.renderScale = 0.4;

        this.randomMovement(1);
        this.id = id;
        this.amount = amount;
        this.throwDelay = 0;
        this.removeTimer = TICKRATE * 30;
    }

    draw(ctx, spritesheet, scale) {
        if (this.amount >= 16) super.draw(ctx, spritesheet, scale, -MULTI_ITEM_OFFSET_AMOUNT, -MULTI_ITEM_OFFSET_AMOUNT);
        if (this.amount >= 8) super.draw(ctx, spritesheet, scale, MULTI_ITEM_OFFSET_AMOUNT, -MULTI_ITEM_OFFSET_AMOUNT);
        if (this.amount >= 4) super.draw(ctx, spritesheet, scale, -MULTI_ITEM_OFFSET_AMOUNT, MULTI_ITEM_OFFSET_AMOUNT);
        if (this.amount >= 2) super.draw(ctx, spritesheet, scale, MULTI_ITEM_OFFSET_AMOUNT, MULTI_ITEM_OFFSET_AMOUNT);
        super.draw(ctx, spritesheet, scale);
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
        this.removeTimer--;
        if (this.removeTimer <= 0) this.remove();
        if (this.throwDelay > 0) this.throwDelay--;
    }

    collisionCheck(otherEntity) {
        let result = super.collisionCheck(otherEntity);
        if (result && otherEntity instanceof Player) {
            this.tryPickup(otherEntity);
        }
        if (distanceBetween(this.x, this.y, otherEntity.x, otherEntity.y) <= ITEM_MERGE_DISTANCE && otherEntity instanceof ItemEntity) {
            if (otherEntity.id === this.id) this.merge(otherEntity);
        }
        return result;
    }

    tryPickup(player) {
        if (this.removed || this.throwDelay > 0) return;

        const canFit = player.inventory.amountCanFit(this.id, this.amount);
        if (canFit > 0) {
            const added = player.inventory.addItem(this.id, canFit);
            if (added === 0) {
                this.remove();
            } else {
                this.amount -= canFit;
                if (this.amount <= 0) this.remove();
            }
        }
    }

    merge(otherItem) {
        if (this.removed || otherItem.removed || this.throwDelay > 0 || otherItem.throwDelay > 0) return;

        const maxStack = ITEM_DATA[otherItem.id].maxStack || Number.MAX_VALUE;
        const availableSpace = maxStack - otherItem.amount;
        const amountToMerge = Math.min(this.amount, availableSpace);

        if (amountToMerge > 0) {
            otherItem.amount += amountToMerge;
            otherItem.randomMovement(0.5);
            this.amount -= amountToMerge;

            if (this.amount <= 0) {
                this.remove();
            }
        }
    }
}

class Projectile extends Entity {
    constructor(x, y, angle, velocity, spriteX, spriteY) {
        super(x, y, angle, spriteX, spriteY);
        this.renderScale = 0.5;
        this.collisionChannel = "projectile";
        this.collisionTimer = TICKRATE * 0.5;
        this.lifetime = TICKRATE * 10;

        const movement = coordinatesAlongAngle(0, 0, velocity, angle - 90);
        this.movement.x = movement.x;
        this.movement.y = movement.y;
        this.rotation = angle;
    }

    tick() {
        super.tick();
        if (this.collisionTimer > 0) this.collisionTimer--;
        this.lifetime--;
        if (this.lifetime <= 0) this.remove();
    }

    collisionCheck(otherEntity) {
        let result = super.collisionCheck(otherEntity);
        if (otherEntity instanceof Projectile) return;
        if (this.collisionTimer > 0) return;
        if (result) this.remove();
        return result;
    }

    onTileCollide() {
        this.remove();
    }

    onBorderCollide() {
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

const RANDOM_TILE_TICKS = 2;
const EXPLOSION_CYCLES_PER_TICK = 2;

class Map {
    constructor(size, debugEntities) {
        this.size = size;
        this.chunks = {};
        this.entities = [];
        this.explosions = [];
        this.updatesQueued = new Set();
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

    generateFeatures() {
        // water pools
        const waterPoolAmount = randomRangeInteger(24, 36);
        for (let i = 0; i < waterPoolAmount; i++) {
            let center = this.randomTileLocation();
            let radius = randomRangeInteger(2, 6);

            for (let x = center.x - radius; x <= center.x + radius; x++) {
                for (let y = center.y - radius; y <= center.y + radius; y++) {
                    let distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);

                    if (distance < radius - 0.5) {
                        this.setTile(x, y, 13); // water
                    } else if (distance < radius + 0.5) {
                        this.setTile(x, y, 14); // hard rock
                    }
                }
            }
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

        const thisTickUpdates = new Set(this.updatesQueued);
        thisTickUpdates.forEach((tile) => {
            const chunk = this.getChunkFromTile(tile.x, tile.y);
            if (!(chunk instanceof Chunk)) {
                this.updatesQueued.delete(tile);
                return;
            }
            if (chunk.updateInternalTile(modFix(tile.x, CHUNK_SIZE), modFix(tile.y, CHUNK_SIZE))) {
                this.markForUpdate(tile.x + 1, tile.y);
                this.markForUpdate(tile.x - 1, tile.y);
                this.markForUpdate(tile.x, tile.y + 1);
                this.markForUpdate(tile.x, tile.y - 1);
            }
            ups++;
            this.updatesQueued.delete(tile);
        });

        // tile ticks
        for (let i = 0; i < RANDOM_TILE_TICKS; i++) {
            const randomLocation = this.randomTileLocation();
            const chunk = this.getChunkFromTile(randomLocation.x, randomLocation.y);
            if (!(chunk instanceof Chunk)) return;
            chunk.tickInternalTile(modFix(randomLocation.x, CHUNK_SIZE), modFix(randomLocation.y, CHUNK_SIZE));
        }
    }

    markForUpdate(x, y) {
        this.updatesQueued.add({ x: x, y: y })
    }

    randomTileLocation() {
        return { x: Math.floor(randomRange(-(this.size / 2) * CHUNK_SIZE, (this.size / 2) * CHUNK_SIZE)), y: Math.floor(randomRange(-(this.size / 2) * CHUNK_SIZE, (this.size / 2) * CHUNK_SIZE)) };
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
            explosionPower = Math.max(explosionPower, TILE_DATA[this.getTile(x, y)].explosionPower);
            this.setTile(x, y, 0);
        }

        chunk.explodeInternalTile(modFix(x, CHUNK_SIZE), modFix(y, CHUNK_SIZE), explosionPower);
    }

    useItem(x, y, item) {
        const clickedTile = map.getTile(x, y);
        // any rightclick functions
        if (clickedTile === 20) { // closed door
            map.setTile(x, y, 21);
            return false;
        }

        if (clickedTile === 21) { // open door
            map.setTile(x, y, 20);
            return false;
        }


        // requires item functions
        if (item == null) return;
        const itemData = ITEM_DATA[item.id];

        // weapon
        if (item.id === 1000) {
            playerEntity.fireProjectile(new Projectile(playerEntity.x, playerEntity.y, playerEntity.rotation, 1, 1, 14));
            return false;
        }

        // matches
        if (item.id === 1001) {
            if (TILE_DATA[clickedTile].explosionPower >= MINIMUM_EXPLOSION_POWER) {
                map.markForExplosion(x, y, TILE_DATA[clickedTile].explosionPower);
                //this.setTile(x, y, 0);
                //this.explodeTile(x, y, TILE_DATA[clickedTile].explosionPower);
                return true;
            }

            else if (clickedTile === 17) { // unlit fuse
                map.setTile(x, y, 18);
                return true;
            }
        }

        // dummy egg
        if (item.id === 1002) {
            map.addEntity(new Dummy(x + 0.5, y + 0.5));
            return true;
        }

        // check if can place tile, if so place it
        if (item != null && "places" in ITEM_DATA[item.id]) {
            return this.setTile(x, y, ITEM_DATA[item.id].places, true);
        }


        // check if can place tile, if so place it
        if (item != null && "places" in ITEM_DATA[item.id]) {
            return this.setTile(x, y, ITEM_DATA[item.id].places, true);
        }
        return false;
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
        if (!(chunk instanceof Chunk)) return 999; // null tile
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