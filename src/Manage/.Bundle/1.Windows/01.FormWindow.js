App.Modules.Manage.Windows.FormWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FormWindow']);

        this.AddClass('app-form-window-component');

        this._form = this.Children('form');
        this._validator = new Colibri.UI.FormValidator(this._form);
        this._fieldEvents = {};

        this._cancel = this.Children('cancel');
        this._save = this.Children('save');
        this.movable = true;

        this.AddHandler('WindowClosed', this.__thisWindowClosed);
        this._validator.AddHandler('Validated', () => this._save.enabled = this._validator.Validate());
        
    }

    __thisWindowClosed(event, args) {
        this._form.Clear();
    }

    _performChanges(storage, s, p) {
        Object.forEach(storage.fields, (name, field) => {
            field.storage = s ? s.name : storage.name;
            field.field = (p ? p + '.' : '') + name;
            if(field?.params?.security && Security) {
                Object.forEach(field.params.security, (name, value) => {
                    field[name] = Security.IsCommandAllowed(value);
                });
            }
            if(field.fields) {
                this._performChanges(field, storage, field.field);
            }
        });
        return storage;
    }

    Show(title, width, fieldBinding, dataBinding, className = '', fieldEvents = {}) {

        this.title = title;
        this.width = width;
        if(className) {
            this.AddClass(className);
        }
 
        this.shown = true;   
        this._save.enabled = false;
        this._fieldEvents = fieldEvents;

        App.Loading.Show();
        return new Promise((resolve, reject) => {

            const promiseDataBinding = dataBinding && typeof dataBinding === 'string' ? App.Store.AsyncQuery(dataBinding) : new Promise((rs, rj) => rs(dataBinding));
            const promiseFieldsBinding = fieldBinding && typeof fieldBinding === 'string' ? App.Store.AsyncQuery(fieldBinding) : new Promise((rs, rj) => rs(fieldBinding));

            Promise.all([promiseFieldsBinding, promiseDataBinding])
                .then((response) => {
        
                    const storage = response[0];
                    const value = response[1];
        
                    this.ReCreateForm(this._performChanges(storage).fields, value);
                    
                    this._save.ClearHandlers();
                    this._save.AddHandler('Clicked', () => {
                        resolve(this._form.value);
                        this.Hide();
                    });

                    this._cancel.ClearHandlers();
                    this._cancel.AddHandler('Clicked', () => {
                        reject();
                        this.Hide();
                    });
        
                }).finally(() => {
                    App.Loading.Hide();
                });
    
        });

    }

    ReCreateForm(fields, value) {

        this._form.Clear();
        this._form.fields = fields;

        Object.forEach(this._fieldEvents, (name, eventData) => { 
            const component = this._form.Children(name);
            if(component) {
                component.AddHandler(eventData.event, eventData.handler);
            }
        });

        this._form.Focus();
        this._form.value = value;
        
    }

}