(function setup(window) {
    var document = window.document;
    Object.prototype.on = function (a, b) {
        this.addEventListener(a, b);
        return this;
    };
    Object.prototype.off = function (a, b) {
        this.removeEventListener(a, b);
        return this;
    };
    Array.prototype.remove = function (x) {
        let a = [];
        for (let i in this)
            if (i != x)
                a.push(this[i]);
        return a;
    };

    window.can = document.querySelector("canvas");
    window.ctx = window.can.getContext("2d");
    window.can.width = window.innerWidth;
    window.can.height = window.innerHeight;

    window.randInt = function (a, b) {
        if (a === void 0) return Math.round(Math.random());
        else if (b === void 0) return Math.floor(Math.random() * a);
        else return Math.floor(Math.random() * (b - a + 1) + a);
    };
    window.randFloat = function (a, b) {
        if (a === void 0) return Math.random();
        else if (b === void 0) return Math.random() * a;
        else return Math.random() * (b - a) + a;
    };
    window.rand = function (a, b) {
        return Array.isArray(a) ? a[Math.floor(Math.random()
            * a.length)] : window.randInt(a, b);
    };
}(window));

(function play(gameover) {
    var player = {
        x: can.width / 2,   // Posición inicial en el centro del canvas
        y: can.height / 2,  // Posición inicial en el centro del canvas
        s: 20,              // Tamaño del jugador (radio o lado, dependiendo de la forma)
        mx: 0,              // Movimiento en el eje X
        my: 0,              // Movimiento en el eje Y
        a: 0,               // Ángulo de rotación
        d: 1,               // Dirección (puede ser usado para invertir el movimiento)
        speed: 3,           // Velocidad de movimiento del jugador
        speak: false,       // Indica si el jugador está mostrando un mensaje

        softcore: [
            "Revolver",
            "Shotgun",
            "Machine Gun",
            "Sniper Rifle"
        ],

        weapon: "Revolver",
        applyWeaponProperties: function () {
            switch (this.weapon) {
                case "Revolver":
                    this.magSize = 6;        
                    this.barrelSize = 1.5;   
                    this.bulletSize = 1;    
                    this.girth = 1;          
                    this.hits = 2;          
                    this.spray = 1;        
                    this.reloadTime = 1000;
                    this.velocity = 1;       
                    this.shade = 200;       
                    this.laser = false;     
                    this.fire = false;      
                    break;

                case "Shotgun":
                    this.magSize = 9;
                    this.barrelSize = 2;
                    this.bulletSize = 0.75;
                    this.girth = 1.2;
                    this.hits = 1;
                    this.spray = 3;          // Dispersión mayoor
                    this.reloadTime = 1000;
                    this.velocity = 1;
                    this.shade = 100;
                    this.laser = false;
                    this.fire = false;
                    break;

                case "Machine Gun":
                    this.magSize = 30;
                    this.barrelSize = 2;
                    this.bulletSize = 1;
                    this.girth = 1.2;
                    this.hits = 1;
                    this.spray = 1;
                    this.reloadTime = 2000;
                    this.velocity = 0.75;
                    this.shade = 100;
                    this.fireRate = 10;      // Cadencia de disparo
                    this.laser = false;
                    break;

                case "Sniper Rifle":
                    this.magSize = 5;
                    this.barrelSize = 2.5;
                    this.bulletSize = 1.5;
                    this.girth = 1;
                    this.hits = Infinity;    // Puede atravesar múltiples objetivos
                    this.spray = 1;
                    this.reloadTime = 1000;
                    this.velocity = 2;       // Velocidad más alta por ser un rifle de precisión
                    this.shade = 50;
                    this.laser = false;
                    this.fire = false;
                    break;

                case "Mega Shotgun":
                    this.magSize = 50;
                    this.barrelSize = 2;
                    this.bulletSize = 1;
                    this.girth = 1.5;
                    this.hits = 1;
                    this.spray = 5;          // Mayor dispersión de disparo
                    this.reloadTime = 500;   // Recarga más rápida
                    this.velocity = 1.5;
                    this.shade = 100;
                    this.laser = false;
                    this.fire = false;
                    break;
            }
        },
        // Propiedades adicionales del jugador
        out: false,           // Indica si el jugador está fuera de la partida
        zombiesKilled: 0,     // Contador de zombies eliminados
        bullets: [],          // Almacena las balas disparadas

    };

    var zombies = [];             // Array para almacenar los zombies
    var Zombie = function () {    // Constructor para crear un zombie
        let s = rand(20, 30);       // Tamaño del zombie

        // Determinar si el zombie es agresivo (menos probable en modo hardcore)
        let a = rand(zombies.length < player.hardcoreMode ? 25 : 50) === 0;

        // Determinar si el zombie es especial (menos probable si hay pocos zombies)
        let sp = rand(zombies.length + 10) === 0;

        // Velocidad del zombie con variaciones aleatorias   let speed = (sp ? 2 : 1) * randFloat(0.5, 1);--------------------------------------------------------------------------------------
        let speed = (sp ? 0 : 0) * randFloat(0, 0);

        speed += zombies.length / 20;  // Aumenta la velocidad a medida que aumenta el número de zombies

        // Posición inicial del zombie
        let x = a ? rand(-s * rand(2, 10), can.width + s * rand(2, 10)) :
            rand([-s * rand(2, 10), can.width + s * rand(2, 10)]);
        let y = a ? rand([-s * rand(2, 10), can.height + s * rand(2, 10)]) :
            rand(-s * rand(2, 10), can.height + s * rand(2, 10));

        // Propiedades del zombie
        return {
            x: x,               // Posición en X
            y: y,               // Posición en Y
            wx: x,              // Posición original en X
            wy: y,              // Posición original en Y
            s: s,               // Tamaño
            a: 0,               // Ángulo de movimiento
            d: 1,               // Dirección de movimiento
            special: sp,        // Es un zombie especial
            color: [rand(50, 100), rand(100, 150), rand(50)], // Color del cuerpo (tonos verdes)

            // Ajuste de velocidad, asegurando que no sea más rápido que el jugador por mucho
            speed: speed < 2 * player.speed ? speed : player.speed * 1.5
        };
    };

    for (let i = 0; i < 10; i++)  // Crea 10 zombies
        zombies.push(new Zombie());

    var frames = 0;               // Cuenta de frames
    (function update() {          // Función de actualización
        ctx.beginPath();
        ctx.clearRect(0, 0, can.width, can.height);   // Función de actualización

        ctx.strokeStyle = "black";
        if (!gameover) {            // Si el juego no ha terminado, actualizar balas del jugador
            for (let i in player.bullets) {
                p = player.bullets[i];

                if (!p.hit) {                             // Si la bala no ha impactado
                    ctx.beginPath()
                }
            }

            if (frames == player.mark + 500)
                player.speak = false;

            p = player;

            for (let x = -1; x <= 1; x += 2) { // Iteramos sobre los dos posibles ángulos
            }

            ctx.beginPath();            // Inicia un nuevo trazado para dibujar al jugador
            ctx.lineWidth = p.s / 10;   // Define el grosor del contorno del jugador
            
            // Define el color de relleno del cuerpo del jugador (tono marrón)
            ctx.fillStyle = "rgb(150, 100, 50)";
            ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);  // p.x, p.y posición del jugador
            ctx.fill();
            ctx.stroke();
            
        }

        // Itera sobre cada zombie en la lista de enemigos
        for (let i in zombies) {
            p = zombies[i];

            if (gameover) {
                a = Math.atan2(p.wy - p.y, p.wx - p.x);
            } 
            // Si el juego sigue, el zombie se mueve hacia el jugador
            else a = Math.atan2(player.y - p.y, player.x - p.x);

            // Dibuja el cuerpo del zombie
            ctx.fillStyle = "rgb(" + p.color + ")";

            // Dibuja la cabeza del zombie
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Mueve al zombie hacia la dirección del jugador
            p.x += Math.cos(a) * p.speed;
            p.y += Math.sin(a) * p.speed;

            // Verifica colisión entre el jugador y el zombie
            if (player.x + player.s > p.x - p.s &&
                player.x - player.s < p.x + p.s &&
                player.y + player.s > p.y - p.s &&
                player.y - player.s < p.y + p.s) {
                player.lives--;
               
            }
        }

        if (gameover) 
            {
        } else {
            // Inicia el trazado de texto
            ctx.beginPath();
            ctx.fillStyle = "black";  // Establece el color de relleno del texto

            // Dibuja el texto de las armas y munición en la pantalla
            ctx.fillText((player.magSize - player.bullets.length) /
                player.spray + "/" + player.magSize /
                player.spray, 0, 40);
        }
        // Aumenta el contador de frames
        frames++;
        requestAnimationFrame(update);
    }());
   
}(false));