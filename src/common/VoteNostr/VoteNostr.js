// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const ReactStars = require('react-stars').default;
const { useTranslation } = require('react-i18next');
const { useRouteFocused } = require('stremio-router');
const { Nostr } = require('stremio/services');
const Switch = require('react-switch').default;
const Button = require('stremio/common/Button');
const useToast = require('stremio/common/Toast/useToast');
const styles = require('./styles');
const rateChangedEvent = new Event('rateChanged');

const VoteNostr = ({ className, id, name, year, background, closeVoteModal }) => {
    const { t } = useTranslation();
    const inputRef = React.useRef(null);
    const routeFocused = useRouteFocused();
    const [rating, setRating] = React.useState(0);
    const [voting, setVoting] = React.useState(false);
    const [reviewed, setReviewed] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [scaleFactor, setScaleFactor] = React.useState(1.2);
    const [checked, setChecked] = React.useState(true);
    const toast = useToast();
    background = /\.(jpg|png|webp)$/.test(background) ? background : `${background}.jpg`;

    const ratingChanged = (newRating) => {
        setRating(newRating);
        setScaleFactor(1 + (newRating / 20));
        document.getElementById('textareaReview').value = document.getElementById('textareaReview').value.replace(/My verdict:\s*[^]*\s*!/g, `My verdict: ${getEmoji(newRating)}!`);
    };

    const handleChangePostReview = () => {
        setChecked(!checked);
    };

    const handleVoteClick = async () => {
        try {
            setVoting(true);
            setLoading(true);
            const content = document.getElementById('textareaReview').value;
            const result = await Nostr.Review.rate({ id, name, year, background, rating, content, postReview: checked });
            if (result) {
                closeVoteModal();
                toast.show({
                    type: 'success',
                    title: 'Your review was saved.',
                    message: result.message,
                    timeout: 4000,
                    dataset: {
                        type: 'CoreEvent'
                    }
                });
                document.dispatchEvent(rateChangedEvent);
            }
            setVoting(false);
            setLoading(false);
        } catch (error) {
            window.alert(error);
        }
    };

    const handleRemoveVoteClick = async () => {
        if (window.confirm(t('Are you sure you want to remove your review?'))) {
            try {
                setVoting(true);
                const result = await Nostr.Review.remove({ id });
                if (result.ok) {
                    closeVoteModal();
                    toast.show({
                        type: 'success',
                        title: 'Review removed',
                        message: result.message,
                        timeout: 4000,
                        dataset: {
                            type: 'CoreEvent'
                        }
                    });
                    document.dispatchEvent(rateChangedEvent);
                } else {
                    toast.show({
                        type: 'error',
                        title: 'Error removing vote',
                        message: result.message,
                        timeout: 4000,
                        dataset: {
                            type: 'CoreEvent'
                        }
                    });
                }
                setVoting(false);
            } catch (error) {
                window.alert(error);
            }
        }
    };

    React.useEffect(() => {
        setLoading(true);
        Nostr.Review.getRate({ id }).then((rate) => {
            setLoading(false);
            setReviewed(false);
            if (rate === 0) {
                return;
            }
            setReviewed(true);
            ratingChanged(rate);
        });
    }, [id]);

    // const selectInputContent = React.useCallback(() => {
    //     if (inputRef.current !== null) {
    //         inputRef.current.select();
    //     }
    // }, []);

    // const copyToClipboard = React.useCallback(() => {
    //     if (inputRef.current !== null) {
    //         inputRef.current.select();
    //         document.execCommand('copy');
    //     }
    // }, []);

    React.useEffect(() => {
        if (routeFocused && inputRef.current !== null) {
            inputRef.current.select();
        }
    }, [routeFocused]);

    const getEmoji = (num) => ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][num];

    return (
        <div className={classnames(className, styles['share-prompt-container'])}>

            <div className={classnames(className, styles['ipc-rating-display'])} style={{ transform: `scale(${scaleFactor})`, transition: 'transform 200ms ease-out 0s' }}>
                <svg xmlns='http://www.w3.org/2000/svg' width='85' height='81' className={classnames(className, styles['ipc-rating-display__star'])} viewBox='0 0 85 81' fill='currentColor' role='presentation'>
                    <path d='M29.4278383,26.4913549 L2.77970363,28.6432143 L2.63541119,28.6580541 C0.066865676,28.979767 -0.941953299,32.2222005 1.05754936,33.9345403 L21.3502824,51.3123553 L15.1650027,77.2797478 L15.1355051,77.4163845 C14.6437005,79.9569202 17.4230421,81.9201545 19.6736611,80.5499671 L42.5,66.6529451 L65.3263389,80.5499671 L65.447392,80.6201968 C67.7156822,81.8722123 70.4448402,79.8400226 69.8349973,77.2797478 L63.6489629,51.3123553 L83.9424506,33.9345403 L84.0504483,33.8378644 C85.9390285,32.0703808 84.8461128,28.855226 82.2202964,28.6432143 L55.571407,26.4913549 L45.2865041,1.85440279 C44.2543406,-0.618134262 40.7456594,-0.618134262 39.7134959,1.85440279 L29.4278383,26.4913549 Z'></path>
                </svg>
                <div className={classnames(className, styles['ipc-rating-display__rating'])}>
                    {loading ? <div className={styles['loading']}></div> : rating}
                </div>
            </div>

            <div className={styles['buttons-container']} >
                {reviewed === true &&
                    <ReactStars
                        count={10}
                        value={rating}
                        size={37}
                        edit={false}
                        color1='dimgray'
                        color2='var(--primary-accent-color)'
                    />
                }
                {reviewed === false &&
                    <ReactStars
                        count={10}
                        onChange={ratingChanged}
                        value={rating}
                        edit={true}
                        size={37}
                        half={false}
                        color1='dimgray'
                        color2='var(--primary-accent-color)'
                    />
                }

            </div>

            <textarea id='textareaReview'
                style={{ marginTop: '10px', color: 'white', border: 'solid 1px', borderRadius: '5px' }}
                rows='4'
                cols='46'
                disabled={!checked || reviewed}
                defaultValue={`🎬 Just watched ${name} 🍿 \n\n My verdict: ${getEmoji(rating)}! ✨ #NostrPotatos🎥🥔😁 \n ${background}`}
            />
            <div style={{ marginTop: '10px', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', color: 'white' }}>Share this review on my feed: </span>
                <Switch onChange={handleChangePostReview} checked={checked} onColor='#7b5bf5' handleDiameter={1} height={20} width={40} disabled={reviewed} />
            </div>

            <div className={styles['buttons-container']}>
                <Button className={classnames(styles['option-input-container'], styles['button-container'])} title={'Reload'} onClick={handleVoteClick} disabled={rating === 0 || voting || reviewed}>
                    <div className={styles['label']}>{t('Rate')}</div>
                </Button>
            </div>

            <div className={styles['buttons-container']}>
                <Button className={classnames(styles['button-container'], styles['uninstall-button-container'])} onClick={handleRemoveVoteClick} disabled={rating === 0 || voting || !reviewed} title={'Remove rating'}>
                    <div className={styles['label']}>Remove rating</div>
                </Button>
            </div>

        </div>
    );
};

VoteNostr.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    year: PropTypes.number,
    background: PropTypes.string,
    closeVoteModal: PropTypes.func
};

module.exports = VoteNostr;
