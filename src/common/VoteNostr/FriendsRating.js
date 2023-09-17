// Copyright (C) 2017-2023 Smart code 203358507
/* eslint-disable react/prop-types */

const React = require('react');
const PropTypes = require('prop-types');
const ReactStars = require('react-stars').default;
const { Nostr } = require('stremio/services');
const Button = require('stremio/common/Button');
const styles = require('./styles');

const FriendsRating = () => {
    const getFriendsRating = Nostr.Rating.getFriendsRating();
    const average = Nostr.Rating.getAverage();

    const FriendsRatingRow = ({ friend }) => {
        return <li key={friend.pubkey}>
            <Button className={styles['user-info-container']} href={`https://primal.net/p/${friend.pubkey}`} target={'_blank'}>
                <div
                    className={styles['avatar-container']}
                    style={{
                        backgroundImage: friend.profile?.picture ?
                            `url('${friend.profile?.picture}')`
                            :
                            `url('${require('/images/default_avatar.png')}')`
                    }}
                />
                <div className={styles['user-info-details']}>
                    <div className={styles['email-container']}>
                        <div className={styles['email-label']}>{friend.profile?.name}</div>
                        <div className={styles['email-label']}>
                            <ReactStars
                                count={10}
                                value={friend.rate}
                                size={30}
                                edit={false}
                                color1='dimgray'
                                color2='var(--primary-accent-color)'
                            />
                            <div className={styles['rate']}>
                                {`(${friend.rate}/10)`}
                            </div>
                        </div>
                    </div>
                </div>
            </Button>
        </li>;
    };

    return (
        <div>
            <div className={styles['score-container']}>
                <div className={styles['score-container-col']}>
                    <div className={styles['avatar-container']}
                        style={{ backgroundImage: `url('${require('/images/aud_friends.svg')}')` }}
                    />
                    <div className={styles['user-info-details']}>
                        <div className={styles['email-container']}>
                            <div className={styles['email-label']}>
                                <div className={styles['rate']}>
                                    {average.toFixed(1)}
                                </div>
                            </div>
                            <div className={styles['email-label']}>{`${getFriendsRating.length} friends`}</div>
                        </div>
                    </div>
                </div>
                <div className={styles['score-container-col']} title="Not Implemented! You will be able to choose among your friends, which ones are cinephiles.">
                    <div className={styles['avatar-container']}
                        style={{ backgroundImage: `url('${require('/images/fried-potatoes.png')}')` }}
                    />
                    <div className={`${styles['user-info-details']} ${styles['critics-info-details']}`}>
                        <div className={styles['email-container']}>
                            <div className={styles['email-label']}>
                                <div className={styles['rate']}>
                                    {average.toFixed(1)}
                                </div>
                            </div>
                            <div className={styles['email-label']}>{`${getFriendsRating.length} cinephile friends`}</div>
                        </div>
                    </div>
                </div>
            </div>

            <ul>
                {
                    getFriendsRating.map((friend, index) => (
                        <FriendsRatingRow key={index} friend={friend} />
                    ))
                }
                {
                    getFriendsRating.length === 0 && (
                        <div className={styles['user-noinfo-details']}>No ratings found!</div>
                    )
                }
            </ul>
        </div>
    );
};

FriendsRating.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    closeShareModal: PropTypes.func
};

module.exports = FriendsRating;
