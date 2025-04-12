// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {

    // --- Referencias DOM ---
    const starfieldCanvas = document.getElementById("starfield");
    const ctx = starfieldCanvas.getContext("2d");
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");
    const body = document.body;
    const wallE = document.getElementById('wall-e');
    const spaceship = document.getElementById('spaceship');
    const floatingBody = document.getElementById('body-float');
    const meteorElements = document.querySelectorAll('.meteor');
    const flashOverlay = document.getElementById('flash-overlay'); // Referencia al overlay

    // --- NUEVO: Referencias para el botón interactivo ---
    const emergencyButtonContainer = document.getElementById('emergencyButtonContainer'); // Contenedor principal
    const emergencyButton = document.getElementById('emergencyButton');           // El botón <button> clickeable

    // --- Configuración y Lógica de Estrellas (sin cambios) ---
    let stars = []; const numStars = 3000;
    class Star { constructor(){this.reset()}reset(){const t=starfieldCanvas.width||window.innerWidth,e=starfieldCanvas.height||window.innerHeight;this.x=Math.random()*t;this.y=Math.random()*e;this.z=Math.random()*t;this.size=Math.random()*1.5+.2;this.speedFactor=Math.random()*1.5+.5}update(){this.z-=1*this.speedFactor;if(this.z<=0)this.reset()}draw(){const t=starfieldCanvas.width||window.innerWidth,e=starfieldCanvas.height||window.innerHeight;if(0===t||0===e||this.z<=0)return;const a=t/this.z,i=(this.x-t/2)*a+t/2,o=(this.y-e/2)*a+e/2,s=this.size*a;if(i>=0&&i<=t&&o>=0&&o<=e){ctx.beginPath();const r=Math.max(.1,s>0?s:.1);ctx.arc(i,o,r,0,2*Math.PI);ctx.fillStyle="white";ctx.fill()}} }
    function initStars() { stars = []; if (starfieldCanvas.width > 0 && starfieldCanvas.height > 0) { for (let i = 0; i < numStars; i++) stars.push(new Star()); } }
    function resizeCanvas() { starfieldCanvas.width = window.innerWidth; starfieldCanvas.height = window.innerHeight; initStars(); }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // --- Funciones Auxiliares (sin cambios) ---
    function getElementDimensions(element, defaultWidth, defaultHeight) { return { width: element ? (element.offsetWidth || defaultWidth) : defaultWidth, height: element ? (element.offsetHeight || defaultHeight) : defaultHeight }; }

    // --- Lógica de Elementos Flotantes Individuales (sin cambios) ---
    function createFloatingElementState(element, defaultWidth, defaultHeight, speedMultiplier = 1, rotationMultiplier = 1) {
        const dims = getElementDimensions(element, defaultWidth, defaultHeight);
        const state = { el: element, posX: Math.random() * window.innerWidth, posY: Math.random() * window.innerHeight, speedX: (Math.random() - 0.5) * 0.8 * speedMultiplier, speedY: (Math.random() - 0.5) * 0.8 * speedMultiplier, angle: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 0.4 * rotationMultiplier, width: dims.width, height: dims.height, visible: false };
        if (element) {
            element.style.opacity = '0'; element.style.transition = 'opacity 0.5s ease';
            const makeVisible = () => { state.width = element.offsetWidth || defaultWidth; state.height = element.offsetHeight || defaultHeight; state.visible = true; element.style.opacity = '1'; };
            element.onload = makeVisible;
            element.onerror = () => { console.error(`Error al cargar ${element.id || element.src}`); if(element) element.style.display = 'none'; state.visible = false; };
            if (element.complete && element.naturalWidth !== 0) makeVisible();
            else if (!element.complete) element.addEventListener('load', makeVisible);
        }
        return state;
    }
    const wallEState = createFloatingElementState(wallE, 120, 120);
    const spaceshipState = createFloatingElementState(spaceship, 180, 180, 0.7, 0.3);
    const bodyState = createFloatingElementState(floatingBody, 80, 80, 1.2, 0.6);

    // --- Lógica de Meteoros (sin cambios) ---
    const meteorStates = []; let baseMeteorWidth = 100; let baseMeteorHeight = 100;
    function resetMeteor(state) {
        const W = window.innerWidth; const H = window.innerHeight;
        const startSide = Math.floor(Math.random() * 4); let speedX, speedY; const baseSpeed = 0.5 + Math.random() * 2;
        switch (startSide) {
            case 0: state.posX = Math.random() * W; state.posY = -state.height; speedX = (Math.random() - 0.5) * baseSpeed * 0.8; speedY = baseSpeed; break;
            case 1: state.posX = W + state.width; state.posY = Math.random() * H; speedX = -baseSpeed; speedY = (Math.random() - 0.5) * baseSpeed * 0.8; break;
            case 2: state.posX = Math.random() * W; state.posY = H + state.height; speedX = (Math.random() - 0.5) * baseSpeed * 0.8; speedY = -baseSpeed; break;
            case 3: default: state.posX = -state.width; state.posY = Math.random() * H; speedX = baseSpeed; speedY = (Math.random() - 0.5) * baseSpeed * 0.8; break;
        }
        state.speedX = speedX; state.speedY = speedY;
        state.angle = Math.atan2(state.speedY, state.speedX) * (180 / Math.PI) + 90; // Calcular ángulo
    }
    meteorElements.forEach((el, index) => {
        const state = { el: el, posX: 0, posY: 0, speedX: 0, speedY: 0, angle: 0, width: baseMeteorWidth, height: baseMeteorHeight, active: true };
        el.style.opacity = '0'; el.style.transition = 'opacity 0.5s ease';
        const makeMeteorVisible = () => {
            if (index === 0) { baseMeteorWidth = el.offsetWidth || 100; baseMeteorHeight = el.offsetHeight || 100; meteorStates.forEach(s => { s.width = baseMeteorWidth; s.height = baseMeteorHeight; if (s.speedX === 0) resetMeteor(s); }); }
            state.width = baseMeteorWidth; state.height = baseMeteorHeight; if (state.speedX === 0) resetMeteor(state); el.style.opacity = '1';
        };
        el.onload = makeMeteorVisible;
        el.onerror = () => { console.error("Error al cargar meteoro.png"); state.active = false; el.style.display = 'none'; }
        if (el.complete && el.naturalWidth !== 0) makeMeteorVisible();
        else if (!el.complete) el.addEventListener('load', makeMeteorVisible);
        state.width = baseMeteorWidth; state.height = baseMeteorHeight; resetMeteor(state); meteorStates.push(state);
    });


    // --- Bucle Principal de Animación (sin cambios) ---
    let animationFrameId = null;
    function animate() {
        const W = window.innerWidth; const H = window.innerHeight;
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); // Limpiar canvas
        for (let i = 0; i < stars.length; i++) { stars[i].update(); stars[i].draw(); } // Estrellas

        // Animar elementos flotantes individuales
        function animateFloatingElement(state) {
            if (!state || !state.el || !state.visible) return;
            state.posX += state.speedX; state.posY += state.speedY; state.angle += state.rotationSpeed;
            const validWidth = state.width || 100; const validHeight = state.height || 100;
            //const buffer = Math.max(validWidth, validHeight) / 1.5; // Buffer no usado activamente
            if (state.speedX > 0 && state.posX - validWidth / 2 > W) { state.posX = -validWidth / 2; state.posY = Math.random() * H; }
            else if (state.speedX < 0 && state.posX + validWidth / 2 < 0) { state.posX = W + validWidth / 2; state.posY = Math.random() * H; }
            if (state.speedY > 0 && state.posY - validHeight / 2 > H) { state.posY = -validHeight / 2; state.posX = Math.random() * W; }
            else if (state.speedY < 0 && state.posY + validHeight / 2 < 0) { state.posY = H + validHeight / 2; state.posX = Math.random() * W; }
            state.el.style.left = `${state.posX - validWidth / 2}px`; state.el.style.top = `${state.posY - validHeight / 2}px`; state.el.style.transform = `rotate(${state.angle}deg)`;
        }
        animateFloatingElement(wallEState);
        animateFloatingElement(spaceshipState);
        animateFloatingElement(bodyState);

        // Animar Meteoros (con rotación direccional)
        meteorStates.forEach(state => {
            if (!state || !state.el || !state.active) return;
            state.posX += state.speedX; state.posY += state.speedY;
            state.el.style.left = `${state.posX - state.width / 2}px`; state.el.style.top = `${state.posY - state.height / 2}px`;
            state.el.style.transform = `rotate(${state.angle}deg)`; // Aplicar rotación
            const outOfBounds = (state.speedX > 0 && state.posX - state.width / 2 > W) || (state.speedX < 0 && state.posX + state.width / 2 < 0) || (state.speedY > 0 && state.posY - state.height / 2 > H) || (state.speedY < 0 && state.posY + state.height / 2 < 0);
            if (outOfBounds) resetMeteor(state);
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // --- Inicialización y Lógica de Carga ---
    animate(); // Iniciar el bucle

    const loadTime = 3000; // 3 segundos

    setTimeout(() => {
        loader.classList.add('hidden');
        loader.addEventListener('transitionend', () => {
            loader.style.display = 'none';
            // --- MODIFICADO: Muestra el CONTENEDOR del nuevo botón ---
            if (emergencyButtonContainer) {
                 emergencyButtonContainer.style.display = 'block'; // Usa 'block' o 'flex' según el layout interno si fuera necesario
                 void emergencyButtonContainer.offsetWidth; // Reflow
                 emergencyButtonContainer.style.opacity = '1'; // Fade-in
            } else {
                 console.error("#emergencyButtonContainer no encontrado.");
            }
        }, { once: true });
    }, loadTime);

    // --- Funcionalidad del NUEVO Botón de Emergencia ---
    if (emergencyButton && emergencyButtonContainer && flashOverlay) {

        // --- Lógica de clic (Navegación y Overlay) ---
        emergencyButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevenir comportamiento por defecto del botón si lo tuviera
            const nextPageUrl = 'intro.html'; // !! ASEGÚRATE QUE ESTA ES LA PÁGINA CORRECTA !!
            const fadeDuration = 1500; // 1.5 segundos (debe coincidir con CSS transition)

            // Mostrar el overlay e iniciar fade-in
            flashOverlay.style.display = 'block';
            void flashOverlay.offsetWidth; // Forzar reflow
            flashOverlay.style.opacity = '1';

            // Esperar y navegar
            setTimeout(() => {
                window.location.href = nextPageUrl;
            }, fadeDuration);
        });

        // --- NUEVO: Lógica del estado ".pressed" (copiada del JS del botón) ---
        emergencyButton.addEventListener('mousedown', () => {
            // Solo permitir presionar si el contenedor está en hover (tapa abierta)
            // Usamos matches(':hover') en el CONTENEDOR
            if (emergencyButtonContainer.matches(':hover')) {
              emergencyButton.classList.add('pressed');
            }
        });

        emergencyButton.addEventListener('mouseup', () => {
            emergencyButton.classList.remove('pressed');
        });

        // Si el ratón sale del BOTÓN mientras está presionado, soltarlo
        emergencyButton.addEventListener('mouseleave', () => {
            emergencyButton.classList.remove('pressed');
        });

        // Si el ratón sale del CONTENEDOR mientras el botón está presionado, soltarlo también
        emergencyButtonContainer.addEventListener('mouseleave', () => {
             emergencyButton.classList.remove('pressed');
        });

        // Prevenir el comportamiento de arrastre
        emergencyButton.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

    } else {
         // Mensajes de error más específicos
         if (!emergencyButtonContainer) console.error("Listener no añadido: #emergencyButtonContainer no encontrado.");
         if (!emergencyButton) console.error("Listener no añadido: #emergencyButton (el botón interno) no encontrado.");
         if (!flashOverlay) console.error("Efecto fade no funcionará: #flash-overlay no encontrado.");
    }

}); // Fin DOMContentLoaded