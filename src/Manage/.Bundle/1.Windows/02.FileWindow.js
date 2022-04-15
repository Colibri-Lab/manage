App.Modules.Manage.Windows.FileWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FileWindow'], 'Выбор файлов');

        this.AddClass('app-file-window-component');

        this._tabs = this.Children('tabs');
        this._tabs.AddHandler('SelectionChanged', (event, args) => this.__tabChanged(event, args));

        this._manager = this.Children('tabs/manager');
        this._manager.AddHandler('SelectionChanged', (event, args) => this.__selectionChangedOnManager(event, args));

        this._remotemanager = this.Children('tabs/remotemanager');
        this._remotemanager.AddHandler('SelectionChanged', (event, args) => this.__selectionChangedOnRemoteManager(event, args));


        this._cancel = this.Children('cancel');
        this._save = this.Children('save');

        
    }

    set multiple(value) {
        this._manager.multiple = value;
        this._remotemanager.multiple = value;
    }

    get multiple() {
        return this._manager.multiple;
    }

    __tabChanged(event, args) {
        this._save.enabled = false;
        this._manager.ClearSelection();
        this._remotemanager.ClearSelection();
    }

    __selectionChangedOnManager(event, args) {
        this._save.enabled = !!this._manager.selected || this._manager.checked.length > 0;
    }

    __selectionChangedOnRemoteManager(event, args) {
        this._save.enabled = !!this._remotemanager.selected || this._remotemanager.checked.length > 0;
    }


    Show(multiple = true, showRemote = true, showLocal = true) {

        this.multiple = multiple;
        this.shown = true;   

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

        App.Loading.Show();
        return new Promise((resolve, reject) => {
            App.Loading.Hide();

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