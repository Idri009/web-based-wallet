


export default class AlarmProvider {

    constructor() {
        this.setupAlarms();
    }

    private setupAlarms() {
        chrome.alarms.create('checkUnlockExpiry', { periodInMinutes: 1 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if(alarm.name === 'checkUnlockExpiry') {
                this.checkAndExpireUnlock();
            }
        });
    }

    private checkAndExpireUnlock() {
        
    }

}