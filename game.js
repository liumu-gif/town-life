const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const TILE = 32;
const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

const map = [];

for (let y = 0; y < MAP_HEIGHT; y++) {

    map[y] = [];

    for (let x = 0; x < MAP_WIDTH; x++) {

        let type = 0;

        const r = Math.random();

        if (r < 0.08) type = 1;
        else if (r < 0.11) type = 2;

        map[y][x] = type;

    }

}

const trees = [];

for (let y = 0; y < MAP_HEIGHT; y++) {

    for (let x = 0; x < MAP_WIDTH; x++) {

        if (map[y][x] === 1) {

            trees.push({

                x: x * TILE + TILE / 2,
                y: y * TILE + TILE / 2,
                hp: 3

            });

        }

    }

}

const rocks = [];

for (let y = 0; y < MAP_HEIGHT; y++) {

    for (let x = 0; x < MAP_WIDTH; x++) {

        if (map[y][x] === 2) {

            rocks.push({

                x: x * TILE + TILE / 2,
                y: y * TILE + TILE / 2

            });

        }

    }

}

const player = {

    x: MAP_WIDTH * TILE / 2,
    y: MAP_HEIGHT * TILE / 2,

    size: 24,

    speed: 3.2,

    wood: 0,

    stone: 0

};

const camera = {

    x: 0,

    y: 0

};

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

});

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const actionBtn = document.getElementById("actionBtn");

let joyActive = false;
let joyX = 0;
let joyY = 0;

const center = {

    x: 60,

    y: 60

};

joystick.addEventListener("touchstart", e => {

    joyActive = true;

    moveStick(e.touches[0]);

});

joystick.addEventListener("touchmove", e => {

    e.preventDefault();

    moveStick(e.touches[0]);

});

joystick.addEventListener("touchend", () => {

    joyActive = false;

    joyX = 0;

    joyY = 0;

    stick.style.left = "35px";
    stick.style.top = "35px";

});

function moveStick(touch) {

    const rect = joystick.getBoundingClientRect();

    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;

    let dx = x - center.x;
    let dy = y - center.y;

    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 40) {

        dx *= 40 / d;
        dy *= 40 / d;

    }

    joyX = dx / 40;
    joyY = dy / 40;

    stick.style.left = (35 + dx) + "px";
    stick.style.top = (35 + dy) + "px";

}
function canMove(nx, ny) {

    for (const tree of trees) {

        const dx = nx - tree.x;
        const dy = ny - tree.y;

        if (Math.sqrt(dx * dx + dy * dy) < 24) {

            return false;

        }

    }

    for (const rock of rocks) {

        const dx = nx - rock.x;
        const dy = ny - rock.y;

        if (Math.sqrt(dx * dx + dy * dy) < 22) {

            return false;

        }

    }

    return true;

}

function update() {

    let nx = player.x;
    let ny = player.y;

    if (keys["w"] || keys["arrowup"]) ny -= player.speed;
    if (keys["s"] || keys["arrowdown"]) ny += player.speed;
    if (keys["a"] || keys["arrowleft"]) nx -= player.speed;
    if (keys["d"] || keys["arrowright"]) nx += player.speed;

    if (joyActive) {

        nx += joyX * player.speed;
        ny += joyY * player.speed;

    }

    nx = Math.max(player.size / 2,
        Math.min(nx, MAP_WIDTH * TILE - player.size / 2));

    ny = Math.max(player.size / 2,
        Math.min(ny, MAP_HEIGHT * TILE - player.size / 2));

    if (canMove(nx, player.y)) {

        player.x = nx;

    }

    if (canMove(player.x, ny)) {

        player.y = ny;

    }

    camera.x += (player.x - canvas.width / 2 - camera.x) * 0.15;
    camera.y += (player.y - canvas.height / 2 - camera.y) * 0.15;

}

actionBtn.addEventListener("click", () => {

    for (let i = trees.length - 1; i >= 0; i--) {

        const tree = trees[i];

        const dx = player.x - tree.x;
        const dy = player.y - tree.y;

        if (Math.sqrt(dx * dx + dy * dy) < 60) {

            tree.hp--;

            if (tree.hp <= 0) {

                trees.splice(i, 1);

                player.wood++;

            }

            return;

        }

    }

    for (let i = rocks.length - 1; i >= 0; i--) {

        const rock = rocks[i];

        const dx = player.x - rock.x;
        const dy = player.y - rock.y;

        if (Math.sqrt(dx * dx + dy * dy) < 60) {

            rocks.splice(i, 1);

            player.stone++;

            return;

        }

    }

});

function drawGround() {

    for (let y = 0; y < MAP_HEIGHT; y++) {

        for (let x = 0; x < MAP_WIDTH; x++) {

            const sx = x * TILE - camera.x;
            const sy = y * TILE - camera.y;

            if (sx < -TILE || sy < -TILE ||
                sx > canvas.width || sy > canvas.height)
                continue;

            ctx.fillStyle = "#6cc35d";
            ctx.fillRect(sx, sy, TILE, TILE);

            ctx.strokeStyle = "rgba(0,0,0,.05)";
            ctx.strokeRect(sx, sy, TILE, TILE);

        }

    }

}
function drawTrees() {

    for (const tree of trees) {

        const x = tree.x - camera.x;
        const y = tree.y - camera.y;

        // 树干
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(x - 5, y - 8, 10, 18);

        // 树冠
        ctx.beginPath();
        ctx.fillStyle = "#228B22";
        ctx.arc(x, y - 18, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x - 12, y - 10, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 12, y - 10, 14, 0, Math.PI * 2);
        ctx.fill();

    }

}

function drawRocks() {

    for (const rock of rocks) {

        const x = rock.x - camera.x;
        const y = rock.y - camera.y;

        ctx.fillStyle = "#808080";

        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x + 14, y);
        ctx.lineTo(x + 8, y + 12);
        ctx.lineTo(x - 10, y + 10);
        ctx.lineTo(x - 14, y - 2);
        ctx.closePath();
        ctx.fill();

    }

}

function drawPlayer() {

    const x = player.x - camera.x;
    const y = player.y - camera.y;

    // 身体
    ctx.fillStyle = "#2f7cff";
    ctx.fillRect(x - 10, y - 12, 20, 24);

    // 头
    ctx.fillStyle = "#ffd39b";
    ctx.beginPath();
    ctx.arc(x, y - 18, 8, 0, Math.PI * 2);
    ctx.fill();

}

function drawUI() {

    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(10, 10, 180, 70);

    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";

    ctx.fillText("🪵 木材：" + player.wood, 20, 35);
    ctx.fillText("🪨 石头：" + player.stone, 20, 60);

}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();

    drawTrees();

    drawRocks();

    drawPlayer();

    drawUI();

}
// ===========================
// 游戏主循环
// ===========================

let lastTime = 0;

function gameLoop(time) {

    const delta = time - lastTime;
    lastTime = time;

    update();

    draw();

    requestAnimationFrame(gameLoop);

}

requestAnimationFrame(gameLoop);

// ===========================
// 后续系统预留
// ===========================

// 背包
const inventory = {
    wood: 0,
    stone: 0,
    food: 0,
    seeds: 0
};

// 玩家属性
const stats = {
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    exp: 0,
    gold: 0
};

// NPC
const npcs = [];

// 怪物
const monsters = [];

// 作物
const crops = [];

// 建筑
const buildings = [];

// 掉落物
const drops = [];

// 任务
const quests = [];

// 后续功能接口
function updateNPCs() {}

function updateMonsters() {}

function updateDrops() {}

function updateCrops() {}

function drawNPCs() {}

function drawMonsters() {}

function drawDrops() {}

function drawBuildings() {}

function saveGame() {

    localStorage.setItem(
        "town-save",
        JSON.stringify({
            player,
            inventory,
            stats
        })
    );

}

function loadGame() {

    const save = localStorage.getItem("town-save");

    if (!save) return;

    const data = JSON.parse(save);

    Object.assign(player, data.player);
    Object.assign(inventory, data.inventory);
    Object.assign(stats, data.stats);

}

// 每30秒自动存档
setInterval(saveGame, 30000);

// 启动时读取存档
loadGame();