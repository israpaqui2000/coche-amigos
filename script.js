
import nspell from "https://esm.sh/nspell@2.1.5";

// ======================================
// 1. VARIABLES
// ======================================

let numeroCorrecte = null;
let lletresCorrectes = [];
let corrector = null;
let partidaGenerada = false;
let partidaGuanyada = false;


// ======================================
// 2. NORMALITZAR PARAULES
// ======================================

function normalitzar(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "");
}


// ======================================
// 3. COMPROVAR L'ORDRE DE LES LLETRES
// ======================================

function conteLletres(paraula, lletres) {
    let posicio = 0;

    for (let i = 0; i < paraula.length; i++) {

        if (paraula[i] === lletres[posicio]) {
            posicio++;
        }

        if (posicio === lletres.length) {
            return true;
        }
    }

    return false;
}


// ======================================
// 4. CALCULAR OPERACIONS
// ======================================

function calcularExpressio(nums, ops) {

    let valors = [nums[0]];
    let operacionsPendents = [];

    // Primer multiplicacions i divisions

    for (let i = 0; i < ops.length; i++) {

        const operador = ops[i];
        const numero = nums[i + 1];

        if (operador === "×") {

            valors[valors.length - 1] *= numero;

        } else if (operador === "÷") {

            if (numero === 0) {
                return null;
            }

            const actual = valors[valors.length - 1];

            if (actual % numero !== 0) {
                return null;
            }

            valors[valors.length - 1] = actual / numero;

        } else {

            operacionsPendents.push(operador);
            valors.push(numero);

        }
    }

    // Després sumes i restes

    let resultat = valors[0];

    for (let i = 0; i < operacionsPendents.length; i++) {

        if (operacionsPendents[i] === "+") {
            resultat += valors[i + 1];
        } else {
            resultat -= valors[i + 1];
        }
    }

    return Number.isInteger(resultat) ? resultat : null;
}


// ======================================
// 5. GENERAR REPTE AMB LA MATRÍCULA
// ======================================

function novaPartida() {

    // Netejar partida anterior

    document.getElementById("victoria").classList.add("amagat");

    document.getElementById("missatge").textContent = "";

    document.getElementById("respostaNumero").value = "";
    document.getElementById("respostaParaula").value = "";

    partidaGenerada = false;
    partidaGuanyada = false;

    numeroCorrecte = null;

    // Llegir matrícula

    let numeros = document.getElementById("entradaNumeros").value.trim();

    let lletres = normalitzar(
        document.getElementById("entradaLletres").value.trim()
    );

    // Validar matrícula

    if (!/^\d{4}$/.test(numeros)) {

        document.getElementById("missatge").textContent =
            "Has d'introduir exactament 4 números.";

        return;
    }

    if (!/^[a-z]{3}$/.test(lletres)) {

        document.getElementById("missatge").textContent =
            "Has d'introduir exactament 3 lletres.";

        return;
    }

    // Guardar lletres

    lletresCorrectes = lletres.split("");

    // Llegir números

    let a = Number(numeros[0]);
    let b = Number(numeros[1]);
    let c = Number(numeros[2]);
    let d = Number(numeros[3]);

    let nums = [a, b, c, d];

    // Operadors possibles

    const operadors = ["+", "-", "×", "÷"];

    let resultat = null;
    let ops = [];

    // Buscar una combinació vàlida

    for (let intent = 0; intent < 1000; intent++) {

        ops = [];

        for (let i = 0; i < 3; i++) {

            let aleatori = Math.floor(Math.random() * operadors.length);

            ops.push(operadors[aleatori]);
        }

        resultat = calcularExpressio(nums, ops);

        if (resultat !== null) {
            break;
        }
    }

    // Si no trobem cap operació vàlida

    if (resultat === null) {

        document.getElementById("missatge").textContent =
            "No s'ha pogut generar una operació vàlida. Torna-ho a provar.";

        return;
    }

    numeroCorrecte = resultat;

    // Mostrar matrícula

    document.getElementById("matricula").textContent =
        numeros + " - " + lletres.toUpperCase();

    // Mostrar operació

    document.getElementById("operacio").textContent =
        `${a} ${ops[0]} ${b} ${ops[1]} ${c} ${ops[2]} ${d}`;

    // Mostrar lletres

    document.getElementById("lletres").textContent =
        lletresCorrectes.join(" - ").toUpperCase();

    // Activar comprovació

    partidaGenerada = true;

    document.getElementById("missatge").textContent =
        "Repte generat! Ara pots jugar.";
}


// ======================================
// 6. COMPROVAR RESPOSTES
// ======================================

function comprovarResposta() {

    if (!partidaGenerada || partidaGuanyada) {
        return;
    }

    if (corrector === null) {

        document.getElementById("missatge").textContent =
            "El diccionari encara no està carregat.";

        return;
    }

    let numeroText =
        document.getElementById("respostaNumero").value.trim();

    let numeroUsuari = Number(numeroText);

    let paraulaOriginal =
        document.getElementById("respostaParaula").value.trim();

    let paraulaNormalitzada = normalitzar(paraulaOriginal);

    // Comprovar resultat matemàtic

    let numeroValid =
        numeroText !== "" &&
        Number.isInteger(numeroUsuari) &&
        numeroUsuari === numeroCorrecte;

    // Comprovar paraula amb Hunspell

    let paraulaValida =
        paraulaOriginal.length > 0 &&
        corrector.correct(paraulaOriginal) &&
        conteLletres(paraulaNormalitzada, lletresCorrectes);

    // Resultats

    if (numeroValid && paraulaValida) {

        guanyar(paraulaOriginal);

    } else if (!numeroValid && !paraulaValida) {

        document.getElementById("missatge").textContent =
            "Encara no! Revisa el resultat i la paraula.";

    } else if (!numeroValid) {

        document.getElementById("missatge").textContent =
            "La paraula és correcta, però l'operació no.";

    } else {

        document.getElementById("missatge").textContent =
            "L'operació és correcta, però la paraula no és vàlida o no té les lletres en ordre.";

    }
}


// ======================================
// 7. GUANYAR PARTIDA
// ======================================

function guanyar(paraula) {

    partidaGuanyada = true;

    let ara = new Date();

    let hora = ara.toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    document.getElementById("paraulaGuanyadora").textContent =
        "La paraula era: " + paraula.toUpperCase();

    document.getElementById("horaVictoria").textContent =
        `Perfecte! L'has trobat a les ${hora}.`;

    document.getElementById("missatge").textContent = "";

    document.getElementById("victoria").classList.remove("amagat");
}


// ======================================
// 8. CARREGAR DICCIONARI HUNSPELL
// ======================================

async function carregarDiccionari() {

    const estat = document.getElementById("estatDiccionari");

    try {

        estat.textContent = "Carregant diccionari català...";

        const [respostaAff, respostaDic] = await Promise.all([

            fetch("./diccionari/ca_ES.aff"),
            fetch("./diccionari/ca_ES.dic")

        ]);

        if (!respostaAff.ok || !respostaDic.ok) {

            throw new Error("No s'han trobat els fitxers del diccionari.");

        }

        const aff = await respostaAff.text();
        const dic = await respostaDic.text();

        corrector = nspell(aff, dic);

        estat.textContent =
            "✓ Diccionari català carregat correctament";

        estat.style.color = "#62d6a5";

        document.getElementById("botoGenerar").disabled = false;
        document.getElementById("botoComprovar").disabled = false;

    } catch (error) {

        estat.textContent =
            "Error carregant el diccionari. Revisa els fitxers.";

        estat.style.color = "#ff7777";

        console.error(error);

    }
}


// ======================================
// 9. CONNECTAR BOTONS
// ======================================

document.getElementById("botoGenerar").addEventListener(
    "click",
    novaPartida
);

document.getElementById("botoComprovar").addEventListener(
    "click",
    comprovarResposta
);

document.getElementById("botoNovaPartida").addEventListener(
    "click",
    novaPartida
);


// Permetre utilitzar Enter

document.getElementById("respostaParaula").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            comprovarResposta();
        }

    }
);


// ======================================
// 10. INICIAR JOC
// ======================================

carregarDiccionari();
