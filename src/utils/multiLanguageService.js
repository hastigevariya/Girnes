import english from '../locales/english.js';
import hindi from '../locales/hindi.js';
import spanish from '../locales/spanish.js';

const LANGUAGES = {
    ENGLISH: 'en',
    HINDI: 'hi',
    SPANISH: 'es'
};

export function getResponseMessage(languageCode, msg) {
    switch (languageCode) {
        case LANGUAGES.ENGLISH:
            return english.resMsg[msg];
        case LANGUAGES.HINDI:
            return hindi.resMsg[msg];
        case LANGUAGES.SPANISH:
            return spanish.resMsg[msg];
        default:
            return english.resMsg[msg];
    };
};
