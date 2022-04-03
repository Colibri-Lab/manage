


App.Modules.Manage = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('Manage');
    }

    InitializeModule() {

        console.log('Initializing module Manage');

        this._formWindow = null;

        this._store = App.Store.AddChild('app.manage');
        this._store.AddPathLoader('manage.storages', () => this.Storages(true));

    }

    Render() {
        console.log('Rendering Module Manage');
        

    }

    RegisterEvents() {
        console.log('Registering module events for Manage');
    }

    RegisterEventHandlers() {
        console.log('Registering event handlers for Manage');
    }

    FilesByGuid(guid, storage, field, name, mimetype) {
        return new Promise((resolve, reject) => {
            this.Call('Files', 'ByGuid', {guid: guid, storage: storage, field: field}).then((response) => {
                if(response.status === 200) {
                    const file = Base2File(response.result, name, mimetype)
                    resolve(file);
                }
            });
        });
    }

    Storages(returnPromise = false) {
        const promise = this.Call('Storages', 'Config');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.storages', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    
    get FormWindow() {
        if(this._formWindow) {
            return this._formWindow;
        }

        this._formWindow = new App.Modules.Manage.Windows.FormWindow('form-window', document.body);
        if(!this._formWindow.isConnected) {
            this._formWindow.ConnectTo(document.body);
        }

        return this._formWindow;
    }


}

const Manage = new App.Modules.Manage();

