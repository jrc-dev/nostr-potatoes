// Copyright (C) 2017-2023 Smart code 203358507
// Copyright JRC DEV 2017-2023

const { getEventHash } = require('nostr-tools');

function Wallet() {

    this.getPublicKey = async function () {
        return window.nostr.getPublicKey();
    };

    this.signEvent = async function (event) {
        return window.nostr.signEvent(event);
    };

    this.mineEvent = function (event, difficulty, timeout = 5) {
        return mine(event, difficulty, timeout);
    };

    this.getRelays = async function () {
        return window.nostr.getRelays();
    };

    this.encrypt = async function (pubkey, plaintext) {
        return window.nostr.nip04.encrypt(pubkey, plaintext);
    };

    this.decrypt = async function (pubkey, ciphertext) {
        return window.nostr.decrypt(pubkey, ciphertext);
    };

    this.getRelays = async function () {
        return window.nostr.getRelays();
    };

    this.signEvent = async function (event) {
        return window.nostr.signEvent(event);
    };

}

module.exports = new Wallet();

const zeroLeadingBitsCount = (hex32) => {
    let count = 0;
    for (let i = 0; i < 64; i += 2) {
        const hexbyte = hex32.slice(i, i + 2); // grab next byte
        if (hexbyte === '00') {
            count += 8;
            continue;
        }
        // reached non-zero byte; count number of 0 bits in hexbyte
        const bits = parseInt(hexbyte, 16).toString(2).padStart(8, '0');
        for (let b = 0; b < 8; b++) {
            if (bits[b] === '1') {
                break; // reached non-zero bit; stop
            }
            count += 1;
        }
        break;
    }
    return count;
};

function mine(event, difficulty, timeout = 5) {
    const max = 256; // arbitrary
    if (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > max) {
        throw new Error(`difficulty must be an integer between 0 and ${max}`);
    }
    // continue with mining
    let n = BigInt(0);
    event.tags.unshift(['nonce', n.toString(), `${difficulty}`]);

    const until = Math.floor(Date.now() * 0.001) + timeout;
    const w = true;
    while (w) {
        const now = Math.floor(Date.now() * 0.001);
        if (timeout !== 0 && (now > until)) {
            throw 'timeout';
        }
        if (now !== event.created_at) {
            event.created_at = now;
        }
        event.tags[0][1] = (++n).toString();
        const id = getEventHash(event);
        if (zeroLeadingBitsCount(id) === difficulty) {
            event.id = id;
            return event;
        }
    }
}
