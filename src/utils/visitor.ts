import { v4 as uuidv4 } from 'uuid';

export const getVisitorId = (): string => {
    if (typeof window === 'undefined') return '';

    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        // Check if we have an old fingerprint or just generate new
        visitorId = uuidv4();
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
};
