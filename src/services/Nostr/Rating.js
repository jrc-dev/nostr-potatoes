// Copyright (C) 2017-2023 Smart code 203358507
// Copyright JRC DEV 2017-2023

const Wallet = require('./Wallet');
const Tmdb = require('../Tmdb');
const { verifySignature, validateEvent, relayInit } = require('nostr-tools');

const rateChangedEvent = new Event('rateChanged');
const relay = relayInit('wss://nos.lol/'); //wss://purplepag.es
let myProfile = null;
let friendsRates = [];
let contactList = []; //TODO: Temporary
let averageCount = 0; //TODO: Temporary
let extensionActive = true; //TODO: Temporary

relay.on('connect', async () => {
    //console.log(`Connected to ${relay.url}`);
});

relay.on('error', () => {
    //console.err(`Failed to connect to ${relay.url}`);
});

function Rating() {

    this.rate = async function (movie) {
        const rating = async (resolve) => {
            await relay.connect();
            const pubkey = await getPublicKey();
            movie.tmdbId = await tmdbId(movie.id);
            let postRatingId = '';
            const eventAlreadyRated = await findRatingById({ movieId: movie.id, pubkey });
            if (eventAlreadyRated) {
                await removeById({ movieId: movie.id, pubkey }, 'updating');
            }
            if (movie.postReview) {
                postRatingId = await postReview(movie, pubkey);
            }
            movie.postRatingId = postRatingId;
            const resultRate = await rate(movie, pubkey);
            if (resultRate) {
                resolve(resultRate);
            }
        };
        return new Promise(rating);
    };

    this.remove = async function (movie) {
        const pubkey = await getPublicKey();
        await relay.connect();
        const result = await removeById({ movieId: movie.id, pubkey });
        return result;
    };

    this.postReview = async function (movie) {
        await relay.connect();
        const pubkey = await getPublicKey();
        await postReview(movie, pubkey);
        return true;
    };

    this.getRating = async function (movie) {
        await relay.connect();
        const pubkey = await getPublicKey();
        const result = await findRatingById({ movieId: movie.id, pubkey });
        return result;
    };

    this.getRate = async function (movie) {
        await relay.connect();
        const pubkey = await getPublicKey();
        const rating = await findRatingById({ movieId: movie.id, pubkey });
        const resultRate = getRatingQuality(rating);
        return resultRate;
    };

    this.calculateAverage = async function (movie) {
        await relay.connect();
        const pubkey = await getPublicKey();
        const result = await calculateAverage({ movieId: movie.id, pubkey });
        averageCount = result;
        setTimeout(() => {
            fillProfiles({ pubkey }).then();
        }, 10);
        return result;
    };

    this.getProfile = async function () {
        await relay.connect();
        if (myProfile) {
            return myProfile.profile;
        } else {
            const pubkey = await getPublicKey();
            myProfile = { profile: await getProfile({ pubkey }) };
            return myProfile.profile;
        }
    };

    this.getTotalRating = function () {
        return friendsRates.length;
    };

    this.getAverage = function () {
        return averageCount;
    };

    this.getFriendsRating = function () {
        //return Array.from({ length: 50 }, () => [...friendsRates]).flat();
        return friendsRates;
    };

    this.subscribeRateEvents = async function (movie) {
        await relay.connect();
        const pubkey = await getPublicKey();
        watchRateEvents({ movieId: movie.id, pubkey });
    };

}

async function getPublicKey() {
    if (!window.nostr) {
        if (extensionActive) {
            window.alert('Nostr extension is not loaded, use desktop version!');
        }
        extensionActive = false;
        return;
    }
    return await window.nostr.getPublicKey();
}

/**
 * Granular scale 0-1 of rating to NIP-32
 */
function normalizeRating(rating) {
    return Math.min(1, Math.max(0, rating / 10));
}

async function rate(movie, pubkey) {
    let event = {
        kind: 1985,
        pubkey: pubkey,
        tags: [
            ['t', movie.id.toString()],
            ['l', 'nostr-movie/rating', movie.id, `{"quality": ${normalizeRating(movie.rating)}}`],
            ['l', 'ImdbId', movie.id.toString()],
            ['l', 'tmdbId', movie.tmdbId],
            ['l', 'name', movie.name],
            ['l', 'year', movie.year.toString()],
            ['l', 'postRatingId', movie?.postRatingId],
        ],
        content: `Just publishing the metadata rating for ${movie.name}.`
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

async function postReview(movie, pubkey) {
    if (movie.content) {
        movie.content = movie.content.replace('@NostrPotatoes', 'nostr:npub12zxgk9lpn2l5uzgtcraly54luqpa0nyv6a6jmuep298kcwfaru0qrg3sj2');
    }
    let event = {
        kind: 1,
        pubkey: pubkey,
        created_at: Math.round(Date.now() / 1000),
        tags: [
            ['r', movie.background],
            ['t', movie.id.toString()],
            ['p', '508c8b17e19abf4e090bc0fbf252bfe003d7cc8cd7752df321514f6c393d1f1e']
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
        return { ok: false, message: 'Event rating wasn\'t found for your Nostr Public Key' };
    }
    let eventDelete = {
        kind: 5,
        pubkey: e.pubkey,
        tags: [
            ['e', event.id],
            ['t', e.movieId.toString()]
        ],
        content: `Just ${act} movie rating event.`,
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

async function findRatingById(e) {
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

function getRatingQuality(rating) {
    let rate = 0;
    if (!rating) return rate;
    const lArray = rating.tags.find((tag) => tag[0] === 'l' && tag[1] === 'nostr-movie/rating');
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
//TODO Fix this, calculating the average rating of friends' films must be done on a server and use caching.
async function calculateAverage(e) {
    const myContactList = await getContactList(e);

    //add myself to the contact list in order to calculate the average
    if (!myContactList || myContactList.length === 0 || !myContactList.includes(e.pubkey)) {
        myContactList.push(e.pubkey);
    }

    const myFriendsRatingPromises = myContactList.map((pub) => {
        return findRatingById({ pubkey: pub, movieId: e.movieId.toString() });
    });

    // Wait for all asynchronous operations to complete
    const myFriendsRatings = await Promise.all(myFriendsRatingPromises);
    let totalFriendsRatings = 0;
    friendsRates = [];
    const sumOfRates = myFriendsRatings.reduce((accumulator, rating) => {
        const rate = getRatingQuality(rating);
        if (rating !== null && rate > 0 && verifySignature(rating)) {
            totalFriendsRatings++;
            const value = accumulator + rate;
            friendsRates.push({ profile: [], rate, pubkey: rating.pubkey, rating });
            return value;
        }
        return accumulator;
    }, 0);
    if (totalFriendsRatings > 0)
        return sumOfRates / totalFriendsRatings;
    else
        return 0;

}

async function getProfile(e) {
    const profileMetada = await relay.get(
        {
            kinds: [0],
            authors: [e.pubkey]
        }
    );
    if (profileMetada && profileMetada.content) {
        return JSON.parse(profileMetada.content);
    }
    return null;
}

async function fillProfiles(e) {
    for (let i = 0; i < friendsRates.length; i++) {
        friendsRates[i].profile = await getProfile(friendsRates[i]);
        if (e.pubkey === friendsRates[i].pubkey) {
            myProfile = friendsRates[i];
        }
    }
}

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

module.exports = new Rating();
