/**
 * @class
 * @extends Colibri.UI.Window
 * @memberof App.Modules.Manage.Windows
 */
App.Modules.Manage.Windows.FileWindow = class extends Colibri.UI.Window {

    /**
     * Constructor
     * @constructor
     * @param {string} name component name
     * @param {Colibri.UI.IContainer} container component container
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FileWindow'], '#{manage-filewindow-title}');

        this.AddClass('app-file-window-component');

        this._tabs = this.Children('tabs');
        this._tabs.AddHandler('SelectionChanged', this.__tabChanged, false, this);

        this._manager = this.Children('tabs/manager');
        this._manager.AddHandler('SelectionChanged', this.__selectionChangedOnManager, false, this);

        this._remotemanager = this.Children('tabs/remotemanager');
        this._remotemanager.AddHandler('SelectionChanged', this.__selectionChangedOnRemoteManager, false, this);


        this._cancel = this.Children('cancel');
        this._save = this.Children('save');

        
    }

    /**
     * Set multiple selection
     * @type {boolean}
     */    
    set multiple(value) {
        this._manager.multiple = value;
        this._remotemanager.multiple = value;
    }

    /**
     * Get multiple selection
     * @type {boolean}
     */
    get multiple() {
        return this._manager.multiple;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __tabChanged(event, args) {
        this._save.enabled = false;
        this._manager.ClearSelection();
        this._remotemanager.ClearSelection();
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __selectionChangedOnManager(event, args) {
        this._save.enabled = !!this._manager.selected || this._manager.checked.length > 0;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */  
    __selectionChangedOnRemoteManager(event, args) {
        this._save.enabled = !!this._remotemanager.selected || this._remotemanager.checked.length > 0;
    }

    /**
     * Show the file window
     * @param {boolean} multiple allow multiple selection
     * @param {boolean} showRemote show remote files tab
     * @param {boolean} showLocal show local files tab
     * @returns {Promise} promise with selected files
     * @public
     */
    Show(multiple = true, showRemote = true, showLocal = true) {

        this.multiple = multiple;
        this.shown = true;   
        this.BringToFront();

        if(!showRemote || !showLocal) {
            this._tabs.headerContainer = false;
            if(showRemote) {
                this._tabs.selectedIndex = 1;
            }
            else {
                this._tabs.selectedIndex = 0;
            }
        }
        else {
            this._tabs.headerContainer = true;
        }


        return new Promise((resolve, reject) => {

            this._save.ClearHandlers();
            this._save.AddHandler('Clicked', () => {
                if(this._tabs.selectedIndex == 0) {
                    resolve(this._manager.files);
                }
                else {
                    resolve(this._remotemanager.files);
                }
                this.Hide();
            });

            this._cancel.ClearHandlers();
            this._cancel.AddHandler('Clicked', () => {
                reject();
                this.Hide();
            });
        
        });

    }

}