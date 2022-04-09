


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
        this._store.AddPathLoader('manage.datapoints', () => this.DataPoints(true));
        this._store.AddPathLoader('manage.modules', () => this.Modules(true));

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

    Modules(returnPromise = false) {
        const promise = this.Call('Modules', 'Config');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.storages', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    DataPoints(returnPromise = false) {
        const promise = this.Call('DataPoints', 'Config');
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

    get Store() {
        return this._store;
    }


}

Colibri.UI.FieldIcons['App.Modules.Manage.UI.TinyMCETextArea'] = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H5V25H3V3Z" fill="black"/><path d="M23 3H25V25H23V3Z" fill="black"/><path d="M25 3V5L3 5L3 3H25Z" fill="black"/><path d="M25 23V25H3V23L25 23Z" fill="black"/><path d="M17.1917 20L22 14L17.1917 8L16.0603 9.41177L19.7373 14L16.0603 18.5882L17.1917 20Z" fill="black"/><path d="M10.8083 8L6 14L10.8083 20L11.9397 18.5882L8.26274 14L11.9397 9.41177L10.8083 8Z" fill="black"/></svg>';


const Manage = new App.Modules.Manage();

