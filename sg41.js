/*
    This is a direct javascript port of
    https://github.com/hughcoleman/sg41
    by Hugh Coleman

    robin prillwitz 2022
*/

function mod(n, m) {
    return ((n % m) + m) % m;
}

class Keyboard {
    constructor() {
        this.DIGITS = {
            "0": "P",
            "1": "Q",
            "2": "W",
            "3": "E",
            "4": "R",
            "5": "T",
            "6": "Z",
            "7": "U",
            "8": "I",
            "9": "O",
        };
    }

    encode(message, sequence) {
        if (sequence == undefined) {
            sequence = ["J", "J"];
        }

        let shifted = false;
        let encoded = [];

        message = message.toUpperCase();

        for (let c of message) {
            if (c == "J") {
                c = "I";
            }

            if (c == " ") {
                c = "J";
            }

            if (c.search(/[A-Za-z]/) != -1) {
                if (shifted) {
                    encoded = [...encoded, ...sequence]
                    shifted = false;
                }
                encoded.push(c);
            } else if (c.search(/[0-9]/) != -1) {
                if (!shifted) {
                    encoded = [...encoded, ...sequence]
                    shifted = true;
                }
                encoded.push(this.DIGITS[c]);
            }
        };

        console.log(encoded)
        encoded = encoded.join("");
        return encoded;
    }

    decode(message, sequence) {
        if (sequence == undefined) {
            sequence = ["J", "J"];
        }

        let shifted = false;
        let decoded = [];
        let i = 0;

        while (i < message.length) {
            let c = message[i];

            if ((i < (message.length - 1)) && (
                    JSON.stringify(message.substr(i, sequence.length).split("")) == JSON.stringify(sequence)
                )) {
                shifted = !shifted;
                i = i + 2;
                continue;
            } else if (c == "J") {
                c = " ";
            } else if (shifted) {
                if (c.indexOf("PQWERTZUIO") >= 0) {
                    c = "?";
                } else {
                    c = "PQWERTZUIO".indexOf(c);
                }

            }
            decoded.push(c);
            i = i + 1;
        }
        return decoded.join("");
    }

}

class Wheel {
    constructor(_Pins, _Position)   {
        this.pins = _Pins;
        this.size = this.pins.length;
        this.position = _Position;
    }

    step()  {
        this.position = (this.position + 1) % this.size;
    }

    peek(offset)    {
        const m = mod((this.position + offset), this.size);
        return this.pins[m];
    }
}

class SG41 {
    constructor(internal, external)    {
        this.CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.WHEEL_SIZES = [25, 25, 23, 23, 24, 24];
        this.PRINT_INNER = "PAKRHFIDZQNXMTBWJVGSOCLYUE";
        this.PRINT_OUTER = "FHRKAPEUYLCOSGVJWBTMXNQZDI";
        this.keyboard = new Keyboard();
        this.wheels = {};

        const zip = (...arrays) => {
            const length = Math.min(...arrays.map(arr => arr.length));
            return Array.from({ length }, (value, index) => arrays.map((array => array[index])));
        };
        const zipped = zip(internal, external);
        for(let i = 0; i < zipped.length; i++)  {
            this.wheels[i+1] = new Wheel(zipped[i][0], zipped[i][1]);
        }
    }

    process(stream) {
        let output = "";
        for(let c in stream)    {
            if(this.wheels[6].peek(-5)) {
                for(let i = 6; i >= 1; i--) {
                    if((i > 1) && this.wheels[i-1].peek(-5))    {
                        this.wheels[i].step();
                    }
                    this.wheels[i].step();
                }
            }

            const inv = this.wheels[6].peek(8);
            const prn = (
                (inv ^ this.wheels[1].peek(8)) * 1 +
                (inv ^ this.wheels[2].peek(8)) * 2 +
                (inv ^ this.wheels[3].peek(8)) * 4 +
                (inv ^ this.wheels[4].peek(8)) * 8 +
                (inv ^ this.wheels[5].peek(8)) * 10
            );

            output = [
                output + this.PRINT_OUTER.split("")[
                    mod((this.PRINT_INNER.indexOf(stream[c]) + prn), 26)
                ]
            ];

            for(let i = 6; i >= 1; i--) {
                if((i > 1) && (this.wheels[i - 1].peek(-5)))    {
                    this.wheels[i].step();
                }
                this.wheels[i].step();
            }
        }
        return output[0];
    }

    encrypt(plaintext)  {
        const encoded = this.keyboard.encode(plaintext);

        for(let c in encoded) {
            if(this.CHARSET.indexOf(encoded.charAt(c)) == -1) {
                console.log("Invalid Char");
                return;
            }
        }

        return this.process(encoded);
    }

    decrypt(ciphertext) {
        for(let c in ciphertext) {
            if(this.CHARSET.indexOf(ciphertext.charAt(c)) == -1) {
                console.log("Invalid Char");
                return;
            }
        }

        const decoded = this.process(ciphertext);
        return this.keyboard.decode(decoded);
    }

}
