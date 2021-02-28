import { PropItem, PropList, PropOptions, PropType, WS } from '@casthub/types';
//


export default class extends window.casthub.card.action {

    ws: WS;
    hotkeyName: string;

    constructor() {
        super();

        /**
         * The OBS WebSocket Instance for the action.
         *
         * @type {WS|null}
         */
        this.ws = null;

        /**
         * Holds the property set by the user
         *
         * @type {string|null}
         */
        this.hotkeyName = null
    }

    public async prepareProps(): Promise<PropList> {
        const hotkeyNameProp: PropItem = {
            type: PropType.Text,
            required: true,
            default: null,
            label: 'Hotkey Name',
            help: 'Enter the underlying hotkey name. I.e. ReplayBuffer.Save'
        };

        return {
            hotkeyNameProp
        }
    }

    onPropChange(key: string, value: any, initial: boolean): void {
        //
        (key === 'hotkeyNameProp') ? this.hotkeyName = value : this.hotkeyName = null;
    }

    /**
     * Called once when the Action is booted on App
     * launch or when installed for the first time.
     *
     * @return {Promise}
     */
    public async mounted(): Promise<void> {

        const { id } = this.identity;

        try {
            this.ws = await window.casthub.ws(id);
        } catch (err) {
            console.error(err);
            throw new Error('Unable to connect to OBS Web Socket');
        }

        await super.mounted();
    }

    /**
     * Called when a Trigger has executed and all Conditions have passed.
     *
     * @param {Object} input The output, if any, from the Trigger.
     */
    public async run(): Promise<void> {

        if(this.hotkeyName === null) {
            console.log('No hotkey property set');
            return;
        }

        const hotkey = this.hotkeyName.trim();

        // TODO: Might want to notify user, for now do nothing.
        if(!hotkey) { 
            console.log('Empty String');
            return; 
        }

        try {
            await this.ws.send('TriggerHotkeyByName', { 
                'hotkeyName': hotkey
            });

            window.casthub.notify(`Triggered ${hotkey}`);
        } catch (err) {
            window.casthub.notify(`Unable to trigger the hotkey: ${hotkey}`);
            console.error(err);
        }
        
    }

};
