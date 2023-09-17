// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { Nostr } = require('stremio/services');
const Button = require('stremio/common/Button');
const useToast = require('stremio/common/Toast/useToast');
const styles = require('./styles');

const ShareNote = ({ className, id, name, year, background, closeShareModal }) => {
    const { t } = useTranslation();
    const [publishing, setPublishing] = React.useState(false);
    const toast = useToast();
    background = /\.(jpg|png|webp)$/.test(background) ? background : `${background}.jpg`;

    const handlePublishClick = async () => {
        try {
            const content = document.getElementById('textareaReview').value;
            if(content === '') {
                return;
            }
            setPublishing(true);
            const result = await Nostr.Rating.postReview({ id, name, year, background, content });
            if (result) {
                closeShareModal();
                toast.show({
                    type: 'success',
                    title: 'Your review was submited.',
                    message: result.message,
                    timeout: 4000,
                    dataset: {
                        type: 'CoreEvent'
                    }
                });
            }
            setPublishing(false);
        } catch (error) {
            window.alert(error);
        }
    };

    return (
        <div className={classnames(className, styles['share-prompt-container'])}>
            {
                <div>
                    <textarea id='textareaReview'
                        style={{ marginTop: '10px', marginBottom: '20px', color: 'white', border: 'solid 1px', borderRadius: '5px' }}
                        rows='7'
                        cols='46'
                        defaultValue={`🎬 Just watched ${name} 🍿 \n\n My verdict: 🔟! ✨ @NostrPotatoes🎥🥔😁 #NostrPotatoes \n\n ${background}`}
                    />
                    <div className={styles['buttons-container']}>
                        <Button className={classnames(styles['option-input-container'], styles['button-container'])} title={'Reload'} onClick={handlePublishClick} disabled={publishing}>
                            <div className={styles['label']}>{t('Publish')}</div>
                        </Button>
                    </div>
                </div>
            }
        </div>
    );
};

ShareNote.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    year: PropTypes.number,
    background: PropTypes.string,
    closeShareModal: PropTypes.func
};

module.exports = ShareNote;
