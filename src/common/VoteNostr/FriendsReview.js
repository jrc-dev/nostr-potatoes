/* eslint-disable react/prop-types */
// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const ReactStars = require('react-stars').default;
const { Nostr } = require('stremio/services');
const Button = require('stremio/common/Button');
const styles = require('./styles');

const FriendsReview = () => {
    const getFriendsReviews = Nostr.Review.getFriendsReviews();
    const average = Nostr.Review.getAverage();

    const FriendsReviewRow = ({ friend }) => {
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
                            <div className={styles['email-label']}>{`${getFriendsReviews.length} friends`}</div>
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
                            <div className={styles['email-label']}>{`${getFriendsReviews.length} cinephile friends`}</div>
                        </div>
                    </div>
                </div>
            </div>

            <ul>
                {
                    getFriendsReviews.map((friend, index) => (
                        <FriendsReviewRow key={index} friend={friend} />
                    ))
                }
                {
                    getFriendsReviews.length === 0 && (
                        <div className={styles['user-noinfo-details']}>No ratings found!</div>
                    )
                }
            </ul>
        </div>
    );
};

FriendsReview.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    closeShareModal: PropTypes.func
};

module.exports = FriendsReview;
