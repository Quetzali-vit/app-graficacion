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
    can.style.cursor = "none";

    var mouse = {
        x: can.width / 2,
        y: -can.height
    };

    // Objeto que representa al jugador
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

        // Método para hacer que el jugador diga un mensaje
        say: function (s) {
            this.message = s;
            if (!this.speak)
                this.speak = true;
        },

        // Lista de armas en modo "Softcore" (armas menos poderosas)
        softcore: [
            "Revolver",
            "Shotgun",
            "Machine Gun",
            "Sniper Rifle"
        ],

        // Lista de armas en modo "Hardcore" (armas más poderosas)
        hardcore: [
            "Minigun",
            "Mega Shotgun",
            "Laser Gun",
            "Ring of Fire"
        ],

        // Propiedad del jugador que almacena el arma actual
        weapon: "Revolver",
        // Método que aplica las propiedades del arma seleccionada
        applyWeaponProperties: function () {
            switch (this.weapon) {
                case "Revolver":
                    this.magSize = 6;        // Capacidad del cargador
                    this.barrelSize = 1.5;   // Tamaño del cañón
                    this.bulletSize = 1;     // Tamaño de la bala
                    this.girth = 1;          // Grosor del arma
                    this.hits = 2;           // Cantidad de impactos que puede hacer
                    this.spray = 1;          // Dispersión de los disparos
                    this.reloadTime = 1000;  // Tiempo de recarga en milisegundos
                    this.velocity = 1;       // Velocidad de la bala
                    this.shade = 200;        // Sombra del arma (posiblemente para efectos gráficos)
                    this.laser = false;      // Indica si el arma dispara un láser
                    this.fire = false;       // Indica si el arma tiene efecto de fuego
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

                case "Minigun":
                    this.magSize = 500;     // Cargador enorme
                    this.barrelSize = 2.5;
                    this.bulletSize = 2;
                    this.girth = 2;
                    this.hits = 3;
                    this.spray = 1;
                    this.fireRate = 5;      // Disparo extremadamente rápido
                    this.reloadTime = 2000;
                    this.velocity = 3;
                    this.shade = 0;
                    this.laser = false;
                    break;

                case "Laser Gun":
                    this.magSize = Infinity; // No necesita recarga
                    this.barrelSize = 2;
                    this.bulletSize = 2;
                    this.girth = 1.5;
                    this.hits = Infinity;
                    this.spray = 1;
                    this.velocity = 3;
                    this.shade = 0;
                    this.laser = true;       // Dispara un láser en lugar de balas
                    this.fireRate = 20;
                    break;

                case "Ring of Fire":
                    this.magSize = 74;
                    this.barrelSize = 0;
                    this.bulletSize = 2;
                    this.girth = 0;
                    this.hits = 2;
                    this.spray = 37;         // Dispara en todas direcciones
                    this.reloadTime = 2000;
                    this.velocity = 2;
                    this.shade = 0;
                    this.laser = true;
                    this.fireRate = 5;
                    this.fire = false;
            }
        },
        // Propiedades adicionales del jugador
        out: false,           // Indica si el jugador está fuera de la partida
        fire: false,          // Indica si el jugador está disparando
        showGun: true,        // Controla la visibilidad del arma en pantalla
        showMode: true,       // Controla la visibilidad del modo de juego en pantalla
        hardcoreMode: 30,     // Nivel de dificultad en modo hardcore
        lives: 3,             // Número de vidas del jugador
        plantasKilled: 0,     // Contador de plantas eliminados
        bullets: [],          // Almacena las balas disparadas

        // Método para disparar un proyectil
        fireRound: function (n) {
            if (n === void 0) n = 0; // Si no se proporciona un valor, se usa 0 por defecto

            // Calcular el ángulo de disparo basado en la posición del mouse
            let a = Math.atan2(mouse.y - this.y, mouse.x - this.x);

            if (!this.out) // Si el jugador no está fuera de la partida, dispara una bala
                this.bullets.push({

                    // Posición inicial del proyectil
                    x: this.weapon == "Ring of Fire" ? this.x : this.x +
                        Math.cos(a) * 2 * this.s,
                    y: this.weapon == "Ring of Fire" ? this.y : this.y +
                        Math.sin(a) * 2 * this.s,

                    hit: false, // Indica si la bala ha impactado un objetivo
                    hits: 0,    // Contador de impactos realizados por la bala

                    // Dirección en la que se mueve la bala
                    px: Math.cos(a + n),
                    py: Math.sin(a + n)
                });

            // Si el jugador tiene activada la visibilidad del arma y el número de balas disparadas 
            // es un múltiplo del tamaño del cargador, entra en estado de recarga
            if (this.showGun && this.bullets.length % this.magSize === 0) {
                this.out = true;          // Indica que el arma está descargada
                this.say("Reload!");      // Muestra un mensaje de recarga
            } else this.speak = false;  // Si no necesita recargar, el jugador no habla
        }
    };
    // Aplicar las propiedades del arma seleccionada al jugador
    player.applyWeaponProperties();

    var plantas = [];             // Array para almacenar las plantas
    var Planta = function () {    // Constructor para crear un plantas
        let s = rand(20, 30);       // Tamaño de las plantas

        let a = rand(plantas.length < player.hardcoreMode ? 25 : 50) === 0;
        let sp = rand(plantas.length + 10) === 0;
        let speed = (sp ? 0 : 0) * randFloat(0, 0);

        speed += plantas.length / 20;

        let x = a ? rand(-s * rand(2, 10), can.width + s * rand(2, 10)) :
            rand([-s * rand(2, 10), can.width + s * rand(2, 10)]);
        let y = a ? rand([-s * rand(2, 10), can.height + s * rand(2, 10)]) :
            rand(-s * rand(2, 10), can.height + s * rand(2, 10));

        // Propiedades de la planta
        return {
            x: x,               // Posición en X
            y: y,               // Posición en Y
            wx: x,              // Posición original en X
            wy: y,              // Posición original en Y
            s: s,               // Tamaño
            a: 0,               // Ángulo de movimiento
            d: 1,               // Dirección de movimiento
            special: sp,        // Es una planta especial

            // Ajuste de velocidad, asegurando que no sea más rápido que el jugador por mucho
            speed: speed < 2 * player.speed ? speed : player.speed * 1.5
        };
    };

    for (let i = 0; i < 10; i++)  // Crea 10 plantas
        plantas.push(new Planta());

    var frames = 0;               // Cuenta de frames
    (function update() {          // Función de actualización
        ctx.beginPath();
        ctx.clearRect(0, 0, can.width, can.height);   // Función de actualización

        ctx.strokeStyle = "black";
        if (!gameover) {            // Si el juego no ha terminado, actualizar balas del jugador
            for (let i in player.bullets) {
                p = player.bullets[i];

                if (!p.hit) {                             // Si la bala no ha impactado
                    ctx.beginPath();

                    // Si el jugador está disparando un láser, dibujar una línea roja
                    if (player.laser) {
                        ctx.lineWidth = player.s / 10 * player.bulletSize;   // Ancho del laser
                        ctx.strokeStyle = "red";              // Color del laser
                        ctx.moveTo(p.x - p.px * player.s, p.y - p.py * player.s / 2);
                        ctx.lineTo(p.x, p.y);
                        ctx.stroke();
                    } else {
                        // Si no es un láser, dibujar una bala circular
                        ctx.fillStyle = "black";
                        ctx.arc(p.x, p.y, player.s / 10 * player.bulletSize, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                    // Mover la bala en la dirección en la que fue disparada
                    p.x += p.px * 10 * player.velocity;
                    p.y += p.py * 10 * player.velocity;
                }

                for (let x in plantas) {
                    let z = plantas[x];

                    if (p.x > z.x - z.s &&
                        p.x < z.x + z.s &&
                        p.y > z.y - z.s &&
                        p.y < z.y + z.s &&
                        !(z.x + z.s < 0 ||
                            z.x - z.s > can.width ||
                            z.y + z.s < 0 ||
                            z.y - z.s > can.height) &&
                        !p.hit) {

                        p.hits++;

                        // Si los hits alcanzan el máximo de los hits permitidos, se marca al jugador como golpeado
                        if (p.hits == player.hits)
                            p.hit = true;

                        player.plantasKilled++;
                        if (plantas.length == player.hardcoreMode &&
                            player.showMode) {
                            player.say("Hardcore Mode Entered!");  // Mensaje al jugador
                            player.mark = frames;                  // Marca el tiempo en el que el jugador entró en este modo
                            player.showMode = false;               // Evita que el mensaje se repita
                        }

                        plantas[x] = new Planta();

                        if (player.plantasKilled % 10 === 0) {
                            plantas.push(new Planta());

                            if (plantas.length == player.hardcoreMode) {
                                player.weapon = rand(player.hardcore);   // Elegimos un arma aleatoria del modo Hardcore
                                player.applyWeaponProperties();          // Aplicamos las propiedades del arma al jugador
                            }
                        }
                        if (z.special) {    // Si el zombie tiene la propiedad especial

                            // Cambiamos el arma del jugador a una aleatoria de las disponibles
                            player.weapon = function () {
                                let a = [];
                                let w = plantas.length < player.hardcoreMode ?
                                    player.softcore : player.hardcore;

                                // Filtramos las armas que ya tiene el jugador
                                for (let n = 0; n < w.length; n++)
                                    if (player.weapon != w[n])
                                        a.push(w[n]);
                                return rand(a);  // Devolvemos un arma aleatoria de las filtradas
                            }();

                            player.applyWeaponProperties(); // Aplicamos las propiedades de la nueva arma
                            player.lives++;                 // Aumentamos las vidas del jugador
                            // Marcamos el tiempo actual en el que el jugador obtuvo el objeto especial
                            player.mark = frames;
                            // Reseteamos la salida del jugador después de un breve tiempo y eliminamos las balas
                            setTimeout(function () {
                                player.out = false;
                                player.bullets = [];
                            });

                            // Mostramos un mensaje indicando que el jugador encontró un arma especial
                            player.say("You found a " + player.weapon.
                                toLowerCase() + "!");
                        }
                    }
                }
            }

            if (frames == player.mark + 500)
                player.speak = false;

            p = player;

            let a = Math.atan2(mouse.y - p.y, mouse.x - p.x); // Calcula el ángulo 'a' entre el jugador y la posición del ratón usando la función atan2
            for (let x = -1; x <= 1; x += 2) { // Iteramos sobre los dos posibles ángulos
                ctx.beginPath();  // Inicia el trazado de una nueva forma (círculo)
                ctx.lineWidth = p.s / 10;  // Establece el grosor de la línea en función del tamaño del jugador

                // Se selecciona el color del trazo dependiendo del arma del jugador
                ctx.strokeStyle = p.weapon == "Ring of Fire" &&
                    !p.out ? "red" : "black";

                ctx.fillStyle = "rgb(201, 117, 0)";  // Establece el color de relleno del círculo

                ctx.arc(p.x + p.s * Math.cos(a + x * 30 * Math.PI / 180) // Calcula la coordenada X del círculo
                    + x * p.a * Math.cos(a),                             // Ajusta la posición en X según la amplitud 'a'
                    p.y + p.s * Math.sin(a + x * 30 * Math.PI / 180)
                    + x * p.a * Math.sin(a), p.s / 3, 0, 2 * Math.PI);

                ctx.fill();     // Rellena el círculo con el color definido anteriormente
                ctx.stroke();   // Traza el contorno del círculo con el color de trazo definido anteriormente
            }

            if (p.showGun) {   // Verifica si el jugador tiene el arma visible antes de dibujarla
                ctx.beginPath();
                ctx.lineWidth = p.s / 2 * p.girth;   // Define el grosor de la línea del arma

                // Define el color del arma en escala de grises usando el valor de 'shade'
                ctx.strokeStyle = "rgb(" + [p.shade, p.shade, p.shade] + ")";

                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(a) * p.barrelSize * p.s,  // Calcula la posición X del extremo del arma
                    p.y + Math.sin(a) * p.barrelSize * p.s);
                ctx.stroke();
            }

            ctx.beginPath();            // Inicia un nuevo trazado para dibujar al jugador
            ctx.lineWidth = p.s / 10;   // Define el grosor del contorno del jugador
            ctx.strokeStyle = p.weapon == "Ring of Fire" && !p.out ? "red" : "black";

            // Define el color de relleno del cuerpo del jugador (tono marrón)
            ctx.fillStyle = "rgb(150, 100, 50)";
            ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);  // p.x, p.y posición del jugador
            ctx.fill();
            ctx.stroke();

            for (let x = -1; x <= 1; x += 2) {
                ctx.beginPath();    // Inicia un nuevo trazo para dibujar un ojo
                ctx.fillStyle = "white";    // Color blanco para la parte exterior del ojo
                ctx.strokeStyle = "black";  // Contorno negro para el ojo
                // Dibuja la parte blanca del ojo
                ctx.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.s / 2,
                    p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.s / 2,
                    p.s / 4, 0, 2 * Math.PI); // Posición X y Y de ojos y radio
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = "black";  // Inicia un nuevo trazo para dibujar la pupila

                ctx.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.s / 2 + Math.cos(a) * p.s / 8,
                    p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.s / 2 + Math.sin(a) * p.s / 8,
                    p.s / 8, 0, 2 * Math.PI); // Posición X y Y de la pupila y radio
                ctx.fill();
            }

            // Si el jugador está hablando, muestra su mensaje sobre su cabeza
            if (p.speak) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = p.s + "px creepster";
                ctx.fillText(p.message, p.x, p.y - p.s * 2);
            }

            // Si el jugador está disparando y el tiempo coincide con la cadencia de disparo
            if (p.fire && frames % p.fireRate === 0)
                switch (p.weapon) {
                    case "Laser Gun":
                        for (let i = -45; i <= 45; i += 45)
                            p.fireRound(i / 10);
                        break;
                    default:
                        p.fireRound();
                }
            // Actualiza la posición del jugador basándose en su velocidad y dirección
            p.x += p.mx * p.speed;
            p.y += p.my * p.speed;

            // Anima el movimiento del personaje
            p.a += (p.mx === 0 && p.my === 0 ? 0 : 1) * p.speed / 2 * p.d;
            if (p.a < -5) p.d = 1;       // Si la inclinación es menor a -5, cambia la dirección
            else if (p.a > 5) p.d = -1;
        }


        // Itera sobre cada planta carnívora en la lista de enemigos
        for (let i in plantas) {
            p = plantas[i];







            if (gameover) {
                a = rand() === 0;  // Si el juego ha terminado, la planta carnívora se mueve aleatoriamente
                a = Math.atan2(p.wy - p.y, p.wx - p.x);
            }
            // Si el juego sigue, la planta carnívora se mueve hacia el jugador
            else a = Math.atan2(player.y - p.y, player.x - p.x);

            // Dibuja el cuerpo de la planta carnívora (más detallado)
            ctx.beginPath();
            ctx.lineWidth = p.s / 10;
            ctx.fillStyle = "rgb(0, 128, 0)";  // Verde más oscuro para el tallo
            ctx.ellipse(p.x, p.y, p.s / 3, p.s / 1.5, 0, 0, 2 * Math.PI);  // Tallo de la planta
            ctx.fill();
            ctx.stroke();

            // Añadimos sombreado en el cuerpo para un efecto más 3D
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 128, 0, 0.7)";  // Sombras para el tallo
            ctx.ellipse(p.x, p.y + p.s / 6, p.s / 3, p.s / 2, 0, 0, Math.PI);  // Sombra en la base
            ctx.fill();

            // Dibuja las hojas de la planta carnívora con detalles
            for (let x = -1; x <= 1; x += 2) {
                ctx.beginPath();
                ctx.ellipse(p.x + x * p.s / 2, p.y + p.s / 2, p.s / 2.5, p.s / 3, 0, 0, Math.PI);  // Hojas
                ctx.fillStyle = "rgb(0, 100, 0)";  // Color verde más oscuro para las hojas
                ctx.fill();
                ctx.stroke();

                // Sombra de la hoja
                ctx.beginPath();
                ctx.fillStyle = "rgba(0, 100, 0, 0.5)";
                ctx.ellipse(p.x + x * p.s / 2, p.y + p.s / 2 + 5, p.s / 2.5, p.s / 3, 0, 0, Math.PI);  // Sombra de la hoja
                ctx.fill();
            }

            // Dibuja la boca de la planta carnívora (más compleja)
            ctx.beginPath();
            ctx.ellipse(p.x, p.y - p.s / 2, p.s / 1.5, p.s / 1.8, 0, 0, 2 * Math.PI);  // Boca abierta
            ctx.fillStyle = "rgb(255, 0, 0)";  // Boca roja
            ctx.fill();
            ctx.stroke();

            // Dibuja los dientes de la planta carnívora (más grandes y con detalles)
            let teethCount = 12;  // Aumentamos el número de dientes
            for (let i = 0; i < teethCount; i++) {
                let angle = (Math.PI * 2 / teethCount) * i;
                let toothX = p.x + Math.cos(angle) * p.s / 1.5;
                let toothY = p.y - p.s / 2 + Math.sin(angle) * p.s / 1.8;
                ctx.beginPath();
                ctx.moveTo(toothX, toothY);
                ctx.lineTo(toothX + Math.cos(angle) * p.s / 10, toothY + Math.sin(angle) * p.s / 10);  // Dientes
                ctx.stroke();
            }

            // Dibuja los ojos de la planta carnívora con más detalle
            ctx.beginPath();
            let eyeOffset = p.s / 4; // Definimos el desplazamiento de los ojos
            ctx.fillStyle = "rgb(255, 255, 255)";  // Ojos blancos
            ctx.arc(p.x - eyeOffset, p.y - p.s / 2.2, p.s / 6, 0, 2 * Math.PI);  // Ojo izquierdo
            ctx.arc(p.x + eyeOffset, p.y - p.s / 2.2, p.s / 6, 0, 2 * Math.PI);  // Ojo derecho
            ctx.fill();
            ctx.stroke();

            // Detalles del ojo (brillo)
            ctx.beginPath();
            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.arc(p.x - eyeOffset + p.s / 15, p.y - p.s / 2.2 - p.s / 15, p.s / 15, 0, 2 * Math.PI);  // Brillo en el ojo izquierdo
            ctx.arc(p.x + eyeOffset + p.s / 15, p.y - p.s / 2.2 - p.s / 15, p.s / 15, 0, 2 * Math.PI);  // Brillo en el ojo derecho
            ctx.fill();
            ctx.stroke();

            // Mueve la planta carnívora hacia la dirección del jugador
            p.x += Math.cos(a) * p.speed;
            p.y += Math.sin(a) * p.speed;

            // Animación del movimiento de la planta carnívora
            p.a += p.speed / 2 * p.d;
            if (p.a < -5) p.d = 1;
            else if (p.a > 5) p.d = -1;

            // Verifica colisión entre el jugador y la planta carnívora
            if (player.x + player.s > p.x - p.s &&
                player.x - player.s < p.x + p.s &&
                player.y + player.s > p.y - p.s &&
                player.y - player.s < p.y + p.s) {
                player.lives--;

                if (player.lives < 0) {
                    if (!gameover) {
                        // Si el jugador muere, convierte su cuerpo en una planta carnívora
                        let plant = new Planta();  // Usamos la misma clase, pero es una planta
                        plant.x = player.x;
                        plant.y = player.y;
                        plant.s = player.s;
                        plant.speed = player.speed;
                        plant.eyeColor = [255, 255, 255];
                        plantas.push(plant);
                    }
                    gameover = true; // Fin del juego
                } else plantas[i] = new Planta(); // Resetea la planta carnívora
            }
        }

        function drawHeart(ctx, x, y, size, color) {
            ctx.fillStyle = color;
            ctx.strokeStyle = "black"; // Contorno para mejor visibilidad
            ctx.lineWidth = 2;

            ctx.beginPath();

            // Dos arcos para la parte superior del corazón
            ctx.arc(x - size / 4, y, size / 4, Math.PI, 0, false);
            ctx.arc(x + size / 4, y, size / 4, Math.PI, 0, false);

            // Triángulo en la parte inferior
            ctx.lineTo(x, y + size * 0.8);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
        }
        if (!gameover) {
            for (let i = 0; i < player.lives; i++) {
                drawHeart(ctx, i * 30 + 30, 15, 20, "red");
            }
        }

        if (gameover) {
            can.style.cursor = "default";
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, can.width, can.height);
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.font = "100px creepster";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("YOU DIED! " + (player.plantasKilled < 1 ? "No" :
                player.plantasKilled.toLocaleString()) + " Zombie" +
                (player.plantasKilled == 1 ? "" : "s") +
                " Killed", can.width / 2, can.height / 2);

            // Mensaje de reinicio
            ctx.font = "50px creepster";
            ctx.fillText("PRESS ENTER TO RESTART", can.width /
                2, 0.75 * can.height);
        } else {
            // Inicia el trazado de texto
            ctx.beginPath();
            ctx.fillStyle = "black";  // Establece el color de relleno del texto

            // Alineación y base del texto
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "20px roboto mono";
            ctx.fillText("Weapon: " + player.weapon, 0, 20);

            // Dibuja el texto de las armas y munición en la pantalla
            ctx.fillText((player.magSize - player.bullets.length) /
                player.spray + "/" + player.magSize /
                player.spray, 0, 40);

            // Inicia un nuevo trazo para un círculo
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.fillStyle = "red";
            ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
        // Aumenta el contador de frames
        frames++;
        requestAnimationFrame(update);
    }());

    // Maneja los eventos del ratón
    can.on("mousedown", function () {
        switch (player.weapon) {
            case "Machine Gun":
            case "Minigun":
            case "Laser Gun":
                player.fire = true;
        }
    }).on("mouseup", function () {
        // Cuando se suelta el botón del ratón, dispara dependiendo del arma
        switch (player.weapon) {
            case "Revolver":
            case "Sniper Rifle":
            case "Laser Gun":
                player.fireRound();
                break;
            case "Shotgun":
                for (let i = -1; i <= 1; i++)
                    player.fireRound(i / 10);
                break;
            case "Mega Shotgun":
                for (let i = -2; i <= 2; i++)
                    player.fireRound(i / 10);
                break;
            case "Ring of Fire":
                for (let i = -90; i <= 90; i += 5)
                    player.fireRound(i);
        }
        player.fire = false;
    }).on("mousemove", function (e) {
        // Actualiza la posición del ratón
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
    });

    var move = function (e) {
        if (gameover)
            switch (e.which || e.keyCode) {
                case 32: // Espacio
                case 13: // Enter
                    play(false); // Inicia el juego
                    this.off("keydown", move); // Detiene el movimiento
            }
        else switch (e.which || e.keyCode) {
            case 37: // Flecha izquierda
            case 65: // Tecla 'A'
                player.mx = -1;
                break;
            case 39: // Flecha derecha
            case 68: // Tecla 'D'
                player.mx = 1;
                break;
            case 38: // Flecha arriba
            case 87: // Tecla 'W'
                player.my = -1;
                break;
            case 40: // Flecha abajo
            case 83: // Tecla 'S'
                player.my = 1;
        }
    };
    // Maneja el ajuste de tamaño de la ventana
    window.on("resize", function () {
        can.width = this.innerWidth;    // Ajusta el ancho del canvas
        can.height = this.innerHeight;  // Ajusta el alto del canvas
    }).on("keydown", move)              // Detecta cuando se presionan teclas
        .on("keyup", function (e) {
            switch (e.which || e.keyCode) {
                case 37: // Flecha izquierda
                case 65: // Tecla 'A'
                case 39: // Flecha derecha
                case 68: // Tecla 'D'
                    player.mx = 0;
                    break;
                case 38: // Flecha arriba
                case 87: // Tecla 'W'
                case 40: // Flecha abajo
                case 83: // Tecla 'S'
                    player.my = 0;
                    break;
                case 82: // Tecla 'R' para recargar
                    if (player.bullets.length > 0) {
                        player.showGun = false;
                        if (player.speak)
                            player.speak = false;

                        // Simula la recarga
                        setTimeout(function () {
                            player.out = false;
                            player.bullets = [];
                            player.showGun = true;
                        }, player.reloadTime);
                    }
                    break;
            }
        });
}(false));