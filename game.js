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

// 生成地图
const map = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[y][x] = 0;
    }
}

// 玩家
const player = {
    x: MAP_WIDTH * TILE / 2,
    y: MAP_HEIGHT * TILE / 2,
    size: 24,
    speed: 4
};

// 摄像机
const camera = {
    x: 0,
    y: 0
};

// 键盘控制（电脑调试用）
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function update() {

    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;

    // 限制地图范围
    player.x = Math.max(player.size / 2, Math.min(player.x, MAP_WIDTH * TILE - player.size / 2));
    player.y = Math.max(player.size / 2, Math.min(player.y, MAP_HEIGHT * TILE - player.size / 2));

    // 摄像机跟随
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}

function draw() {

    ctx.fillStyle = "#6bcf63";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地图
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {

            const sx = x * TILE - camera.x;
            const sy = y * TILE - camera.y;

            if (
                sx < -TILE ||
                sy < -TILE ||
                sx > canvas.width ||
                sy > canvas.height
            ) continue;

            ctx.fillStyle = "#74d66f";
            ctx.fillRect(sx, sy, TILE, TILE);

            ctx.strokeStyle = "rgba(0,0,0,.08)";
            ctx.strokeRect(sx, sy, TILE, TILE);
        }
    }

    // 玩家
    ctx.fillStyle = "#2b5cff";
    ctx.fillRect(
        player.x - player.size / 2 - camera.x,
        player.y - player.size / 2 - camera.y,
        player.size,
        player.size
    );
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();