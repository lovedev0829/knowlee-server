import cron from 'node-cron';
import { processDoubleStepEntities } from '../services/entity.services';
import { checkingMidnightForInviteeEmail } from '../utils/userReferral.utils';

// Schedule a daily cron job at 12:00 AM
cron.schedule('0 0 * * *', () => {
    //console.log('cron is running...');

    processDoubleStepEntities();
    checkingMidnightForInviteeEmail();

});
