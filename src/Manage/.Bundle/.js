


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
Colibri.UI.FieldIcons['App.Modules.Manage.UI.RemoteFile'] = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H5V25H3V3Z" fill="black"/><path d="M23 3H25V25H23V3Z" fill="black"/><path d="M3 5V3H25V5L3 5Z" fill="black"/><path d="M3 25L3 23L25 23V25H3Z" fill="black"/><path d="M15.1824 16.5099C15.1824 16.2909 15.0048 16.1134 14.7859 16.1134H8.39648C8.17754 16.1134 8 16.2909 8 16.5099C8 16.7288 8.17754 16.9063 8.39648 16.9063H14.7859C15.0048 16.9063 15.1824 16.7288 15.1824 16.5099Z" fill="black"/><path d="M10.8231 9.91879H10.3968V10.3449H10.8231V9.91879Z" fill="black"/><path d="M12.7855 11.8813H12.3594V12.3075H12.7855V11.8813Z" fill="black"/><path d="M12.7855 13.8437H12.3594V14.2699H12.7855V13.8437Z" fill="black"/><path d="M10.8231 13.8437H10.3968V14.2699H10.8231V13.8437Z" fill="black"/><path d="M14.4407 8.66004C14.4407 8.44113 14.2632 8.26356 14.0443 8.26356H9.13814C8.91919 8.26356 8.74166 8.44113 8.74166 8.66004V15.5848H14.4407V8.66004ZM11.3781 14.5474C11.3781 14.7007 11.2539 14.8249 11.1006 14.8249H10.1194C9.96606 14.8249 9.84182 14.7007 9.84182 14.5474V13.5661C9.84182 13.4129 9.96606 13.2887 10.1194 13.2887H11.1006C11.2539 13.2887 11.3781 13.4129 11.3781 13.5661V14.5474ZM11.3781 12.5849C11.3781 12.7383 11.2539 12.8625 11.1006 12.8625H10.1194C9.96606 12.8625 9.84182 12.7383 9.84182 12.5849V11.6037C9.84182 11.4504 9.96606 11.3262 10.1194 11.3262H11.1006C11.2539 11.3262 11.3781 11.4504 11.3781 11.6037V12.5849ZM11.3781 10.6225C11.3781 10.7757 11.2539 10.9 11.1006 10.9H10.1194C9.96606 10.9 9.84182 10.7757 9.84182 10.6225V9.64125C9.84182 9.488 9.96606 9.36372 10.1194 9.36372H11.1006C11.2539 9.36372 11.3781 9.488 11.3781 9.64125V10.6225ZM13.3406 14.5474C13.3406 14.7007 13.2163 14.8249 13.063 14.8249H12.0818C11.9285 14.8249 11.8043 14.7007 11.8043 14.5474V13.5661C11.8043 13.4129 11.9285 13.2887 12.0818 13.2887H13.063C13.2163 13.2887 13.3406 13.4129 13.3406 13.5661V14.5474ZM13.3406 12.5849C13.3406 12.7383 13.2163 12.8625 13.063 12.8625H12.0818C11.9285 12.8625 11.8043 12.7383 11.8043 12.5849V11.6037C11.8043 11.4504 11.9285 11.3262 12.0818 11.3262H13.063C13.2163 11.3262 13.3406 11.4504 13.3406 11.6037V12.5849ZM13.3406 10.6225C13.3406 10.7757 13.2163 10.9 13.063 10.9H12.0818C11.9285 10.9 11.8043 10.7757 11.8043 10.6225V9.64125C11.8043 9.488 11.9285 9.36372 12.0818 9.36372H13.063C13.2163 9.36372 13.3406 9.488 13.3406 9.64125V10.6225Z" fill="black"/><path d="M10.8231 11.8813H10.3968V12.3075H10.8231V11.8813Z" fill="black"/><path d="M12.7855 9.91879H12.3594V10.3449H12.7855V9.91879Z" fill="black"/><path d="M19.8674 16.7771L18.396 15.4657C18.2457 15.3316 18.0188 15.3317 17.8685 15.4656L16.3971 16.777C16.3126 16.8522 16.2644 16.96 16.2644 17.073V19.3399C16.2644 19.5588 16.4419 19.7364 16.6608 19.7364H19.6036C19.8225 19.7364 20 19.5588 20 19.3399V17.073C20 16.96 19.9518 16.8523 19.8674 16.7771Z" fill="black"/><path d="M17.2709 14.5866C17.1394 14.7182 17.1394 14.9316 17.2709 15.0632C17.4026 15.1948 17.6159 15.1948 17.7476 15.0632C17.9596 14.851 18.3048 14.851 18.5168 15.0632C18.5827 15.129 18.6689 15.1619 18.7552 15.1619C18.8414 15.1619 18.9277 15.129 18.9935 15.0632C19.1251 14.9316 19.1251 14.7182 18.9935 14.5866C18.5185 14.1118 17.7459 14.1118 17.2709 14.5866Z" fill="black"/><path d="M16.5857 13.8203C16.4541 13.9519 16.4541 14.1653 16.5857 14.2969C16.7173 14.4284 16.9307 14.4284 17.0623 14.2968C17.3481 14.0111 17.7281 13.8536 18.1322 13.8536C18.5364 13.8536 18.9164 14.011 19.2021 14.2968C19.268 14.3626 19.3542 14.3955 19.4404 14.3955C19.5267 14.3955 19.6129 14.3626 19.6787 14.2969C19.8103 14.1653 19.8103 13.9519 19.6787 13.8203C19.2657 13.4071 18.7164 13.1796 18.1322 13.1796C17.548 13.1796 16.9988 13.4071 16.5857 13.8203Z" fill="black"/><path d="M15.3526 9.98816H17.5727V12.2083C17.5727 12.4272 17.7503 12.6048 17.9692 12.6048C18.1882 12.6048 18.3657 12.4272 18.3657 12.2083V9.59172C18.3657 9.37281 18.1882 9.19523 17.9692 9.19523H15.3526C15.1337 9.19523 14.9561 9.37281 14.9561 9.59172C14.9562 9.81063 15.1337 9.98816 15.3526 9.98816Z" fill="black"/><path d="M15.3526 18.6308H13.1324V17.7191C13.1324 17.5001 12.9549 17.3226 12.736 17.3226C12.517 17.3226 12.3395 17.5001 12.3395 17.7191V19.0273C12.3395 19.2463 12.517 19.4238 12.736 19.4238H15.3526C15.5715 19.4238 15.7491 19.2463 15.7491 19.0273C15.749 18.8084 15.5715 18.6308 15.3526 18.6308Z" fill="black"/></svg>';

const Manage = new App.Modules.Manage();

