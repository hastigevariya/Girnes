import { getResponseMessage } from './multiLanguageService.js'

export default class response {
    static success = (res, languageCode, status, message, data) => {
        const response = {
            success: true,
            status: status,
            message: getResponseMessage(languageCode, message) || message || 'success',
            data: data || {}
        }
        return res.status(status || 200).json(response);
    };

    static error = (res, languageCode, status, message, data) => {
        const response = {
            success: false,
            status: status || 403,
            message: getResponseMessage(languageCode, message) || message || 'error',
            data: data || {}
        }
        return res.status(status || 200).json(response);
    };
};