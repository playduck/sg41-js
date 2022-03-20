let PINS = [
    [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0]
];
let POSITIONS = [0, 0, 0, 0, 0, 0];

function generateWheel(num, alphabet, parent) {
    let output = `<div class=\"wheel\"><span class="wheel-label">${num.toString()}</span><div class=\"wheel-body\" id=\"wheel-${num.toString()}\">`;
    for (let c in alphabet) {
        let o = `<div class="wheel-row"><span class=\"alph wheel-item\">${alphabet[c]}</span><span class=\"pin wheel-item\">0</span></div>`;
        output += o;
    }
    output += "</div></div>"
    parent.insertAdjacentHTML("beforeend", output);
    document.getElementById(`wheel-${num.toString()}`).onclick = (e) => {
        const wheelEl = e.target.parentElement.parentElement;
        const wheelNum = wheelEl.id.substr("wheel-".length) - 1;

        for (let i = 0; i < wheelEl.children.length; i++) {
            if (e.target.classList.contains("alph")) {
                if (wheelEl.children[i].children[0] != e.target) {
                    wheelEl.children[i].children[0].classList.remove("active");
                } else {
                    POSITIONS[wheelNum] = i;
                    e.target.classList.add("active");
                }
            } else if (e.target.classList.contains("pin")) {
                if (wheelEl.children[i].children[1] == e.target) {
                    PINS[wheelNum][i] = PINS[wheelNum][i] ? 0 : 1;
                    e.target.innerHTML = PINS[wheelNum][i];
                    break;
                }
            }
        }
    }
}

window.onload = () => {
    const wheelsEl = document.getElementById("wheels");
    generateWheel(1, "ABCDEFGHIKLMNOPQRSTUVWXYZ".split(""), wheelsEl);
    generateWheel(2, "ABCDEFGHIKLMNOPQRSTUVWXYZ".split(""), wheelsEl);
    generateWheel(3, "ABCDEFGHIKLMNOPQRSTUVWX".split(""), wheelsEl);
    generateWheel(4, "ABCDEFGHIKLMNOPQRSTUVWX".split(""), wheelsEl);

    let wheel5 = [];
    let wheel6 = [];

    const f = (n) => {
        if (n == 0) {
            return 0
        }
        const w = (n % 2 == 0) ? 3 : 2
        const prev = f(n - 1) + w;
        return prev
    }

    for (let i = 0; i < 24; i++) {
        wheel5.push((i + 1).toString().padStart(2, "0"))
        wheel6.push((f(i)).toString().padStart(2, "0"))
    }
    generateWheel(5, wheel5, wheelsEl);
    generateWheel(6, wheel6, wheelsEl);

    for (let i = 0; i < 6; i++) {
        const wheelEl = document.getElementById("wheel-" + (i + 1).toString());
        wheelEl.children[POSITIONS[i]].children[0].classList.add("active")
        for (let j = 0; j < wheelEl.children.length; j++) {
            wheelEl.children[j].children[1].innerHTML = PINS[i][j];
        }
    }


    const decryptedEl = document.getElementById("decrypted");
    const encryptedEl = document.getElementById("encrypted");
    let lastEl = decryptedEl;

    document.getElementById("decrypt").onclick = () => {
        const inputVal = encryptedEl.value;
        const sg = new SG41(PINS, POSITIONS);
        if (inputVal.length > 0) {
            decryptedEl.value = sg.decrypt(inputVal);
        }
    }
    document.getElementById("encrypt").onclick = () => {
        const inputVal = decryptedEl.value;
        const sg = new SG41(PINS, POSITIONS);
        if (inputVal.length > 0) {
            encryptedEl.value = sg.encrypt(inputVal);;
        }
    }
};
