// Copyright (C) 2017-2023 Smart code 203358507
// Copyright JRC DEV 2017-2023

const Wallet = require('./Wallet');
const Tmdb = require('../Tmdb');
const { verifySignature, validateEvent, relayInit } = require('nostr-tools');

const rateChangedEvent = new Event('rateChanged');
const relay = relayInit('wss://nos.lol/'); //wss://purplepag.es
//let profile = {};
let contactList = []; //TODO: Temporary

relay.on('connect', async () => {
    //console.log(`connected to ${relay.url}`);
});

relay.on('error', () => {
    //console.err(`failed to connect to ${relay.url}`);
});

/**
 * Generate review of movies on nostr
 * @type {NostrReview}
 */

function Review() {

    this.rate = async function (movie) {
        await relay.connect();
        const pubkey = await window.nostr.getPublicKey();
        movie.tmdbId = await tmdbId(movie.id);
        const eventAlreadyRated = await findReviewById({ movieId: movie.id, pubkey });
        if (eventAlreadyRated) {
            await removeById({ movieId: movie.id, pubkey }, 'updating');
        }
        const resultRate = await rate(movie);
        if (resultRate && movie.postReview) {
            await postReview(movie);
        }
        return resultRate;
    };

    this.remove = async function (movie) {
        const pubkey = await window.nostr.getPublicKey();
        await relay.connect();
        const result = await removeById({ movieId: movie.id, pubkey });
        return result;
    };

    this.get = async function (movie) {
        await relay.connect();
        const pubkey = await window.nostr.getPublicKey();
        const result = await findReviewById({ movieId: movie.id, pubkey });
        return result;
    };

    this.getRate = async function (movie) {
        await relay.connect();
        const pubkey = await window.nostr.getPublicKey();
        const review = await findReviewById({ movieId: movie.id, pubkey });
        const resultRate = getReviewQuality(review);
        return resultRate;
    };

    this.calculateAverage = async function (movie) {
        await relay.connect();
        const pubkey = await window.nostr.getPublicKey();
        const result = await calculateAverage({ movieId: movie.id, pubkey });
        return result;
    };

    this.subscribeRateEvents = async function (movie) {
        await relay.connect();
        const pubkey = await window.nostr.getPublicKey();
        watchRateEvents({ movieId: movie.id, pubkey });
    };

}

/**
 * Granular scale 0-1 of review to NIP-32
 */
function normalizeReview(review) {
    return Math.min(1, Math.max(0, review / 10));
}

async function rate(movie) {
    let event = {
        kind: 1985,
        pubkey: `${await window.nostr.getPublicKey()}`,
        tags: [
            ['t', movie.id.toString()],
            ['l', 'nostr-potatos/review', movie.id, `{'quality': ${normalizeReview(movie.rating)}}`],
            ['l', 'ImdbId', movie.id.toString()],
            ['l', 'tmdbId', movie.tmdbId],
            ['l', 'name', movie.name],
            ['l', 'year', movie.year.toString()]
        ],
        content: `Just publishing the metadata review for ${movie.name}.`

    };
    event = await Wallet.mineEvent(event, 15, 5000);
    event = await Wallet.signEvent(event);
    const ok = validateEvent(event);
    const veryOk = verifySignature(event);
    if (ok && veryOk) {
        await publish(event);
        return true;
    }
}

async function postReview(movie) {
    let event = {
        kind: 1,
        pubkey: `${await window.nostr.getPublicKey()}`,
        created_at: Math.round(Date.now() / 1000),
        tags: [
            ['r', movie.background],
            ['t', movie.id.toString()],
        ],
        content: movie.content
    };
    event = await Wallet.signEvent(event);
    const ok = validateEvent(event);
    const veryOk = verifySignature(event);
    if (ok && veryOk) {
        await publish(event);
        return true;
    }
}

async function publish(event) {
    await relay.publish(event);
}

async function removeById(e, act = 'removing') {

    const event = await relay.get(
        {
            kinds: [1985],
            authors: [e.pubkey],
            '#t': [
                e.movieId.toString()
            ]
        }
    );
    if (!event) {
        return { ok: false, message: 'Event review wasn\'t found for your Nostr Public Key' };
    }
    let eventDelete = {
        kind: 5,
        pubkey: e.pubkey,
        tags: [
            ['e', event.id],
            ['t', e.movieId.toString()]
        ],
        content: `just ${act} event review`,
        created_at: Math.round(Date.now() / 1000)
    };
    eventDelete = await Wallet.signEvent(eventDelete);
    const ok = validateEvent(eventDelete);
    const veryOk = verifySignature(eventDelete);
    if (ok && veryOk) {
        await publish(eventDelete);
        return { ok: true };
    } else {
        return { ok: false, message: 'Error removing event' };
    }
}

async function findReviewById(e) {
    let veryOk = false;
    const event = await relay.get(
        {
            kinds: [1985],
            authors: [e.pubkey],
            '#t': [
                e.movieId.toString()
            ]
        }
    );
    if (event) {
        veryOk = verifySignature(event);
    }
    if (veryOk) {
        return event;
    } else {
        return null;
    }
}

let subscribeCreated = {};
let subscribeRemoved = {};
/**
 * Watch events kind 1985.
 * If event is valid, verify signature and the event is me or my friends, update with calculateAverage.
 */
function watchRateEvents(e) {
    if (subscribeCreated) {
        return;
    }
    subscribeCreated = relay.sub([
        {
            kinds: [1985],
            '#t': [
                e.movieId.toString()
            ]
        }
    ]);
    subscribeCreated.on('event', (event) => {
        if (event) {
            const veryOk = verifySignature(event);
            const isProbablyMyEvent = (Date.now() - event.created_at * 1000) <= 5000;
            if (veryOk && isProbablyMyEvent) {
                getContactList(e).then((contacts) => {
                    if (event.pubkey === e.pubkey || contacts.includes(event.pubkey)) {
                        document.dispatchEvent(rateChangedEvent);
                    }
                });
            }
        }
    });
    subscribeRemoved = relay.sub([
        {
            kinds: [5],
            '#t': [
                e.movieId.toString()
            ]
        }
    ]);
    subscribeRemoved.on('event', (event) => {
        if (event) {
            const veryOk = verifySignature(event);
            const isProbablyMyEvent = (Date.now() - event.created_at * 1000) <= 5000;
            if (veryOk && isProbablyMyEvent) {
                getContactList(e).then((contacts) => {
                    if (event.pubkey === e.pubkey || contacts.includes(event.pubkey)) {
                        document.dispatchEvent(rateChangedEvent);
                    }
                });
            }
        }
    });
}

function getReviewQuality(review) {
    let rate = 0;
    if (!review) return rate;
    const lArray = review.tags.find((tag) => tag[0] === 'l' && tag[1] === 'nostr-potatos/review');
    if (lArray && lArray.length > 3) {
        const jsonStr = lArray[3];
        try {
            const json = JSON.parse(jsonStr);
            const qualityValue = json.quality;
            rate = qualityValue * 10;
            if (rate > 10 || rate < 0) {
                rate = 0;
            }
        } catch (error) {
            console.error('Erro ao analisar o JSON:', error);
        }
    }
    return rate;
}

// Bad code, just for demo, move this to a server
//TODO Fix this, calculating the average reviews of friends' films must be done on a server and use caching.
async function calculateAverage(e) {
    const myContactList = await getContactList(e);

    //add myself to the contact list in order to calculate the average
    if (!myContactList || myContactList.length === 0 || !myContactList.includes(e.pubkey)) {
        myContactList.push(e.pubkey);
    }

    const myFriendsReviewPromises = myContactList.map((pub) => {
        return findReviewById({ pubkey: pub, movieId: e.movieId.toString() });
    });

    // Wait for all asynchronous operations to complete
    const myFriendsReviews = await Promise.all(myFriendsReviewPromises);
    let totalFriendsReviews = 0;
    const sumOfRates = myFriendsReviews.reduce((accumulator, review) => {
        const rate = getReviewQuality(review);
        if (review !== null && rate > 0 && verifySignature(review)) {
            totalFriendsReviews++;
            return accumulator + rate;
        }
        return accumulator;
    }, 0);
    if (totalFriendsReviews > 0)
        return sumOfRates / totalFriendsReviews;
    else
        return 0;

}

// async function getProfile(e) {
//     if (profile) return profile;
//     const profileMetada = await relay.get(
//         {
//             kinds: [0],
//             authors: [e.pubkey]
//         }
//     );
//     if (profileMetada && profileMetada.content) {
//         profile = JSON.parse(profileMetada.content);
//     }
//     return profile;
// }

async function getContactList(e) {
    if (contactList.length !== 0) return contactList;
    const actualContactList = await relay.get(
        {
            kinds: [3],
            authors: [e.pubkey]
        }
    );
    contactList = actualContactList?.tags?.map((c) => c[1]);
    return contactList || [];
}

async function tmdbId(id) {
    const tmdbId = await Tmdb.getTmdbIdFromImdbId(id);
    return tmdbId;
}

module.exports = new Review();
