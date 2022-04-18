App.Modules.Manage.Windows.FormWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FormWindow']);

        this.AddClass('app-form-window-component');

        this._form = this.Children('form');
        this._validator = new Colibri.UI.FormValidator(this._form);

        this._cancel = this.Children('cancel');
        this._save = this.Children('save');
        this.movable = true;

        this._validator.AddHandler('Validated', () => this._save.enabled = this._validator.Validate());
        
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

    Show(title, width, fieldBinding, dataBinding, className = '') {

        this.title = title;
        this.width = width;
        if(className) {
            this.AddClass(className);
        }
 
        this.shown = true;   
        this._save.enabled = false;
        App.Loading.Show();
        return new Promise((resolve, reject) => {

            const promiseDataBinding = dataBinding && typeof dataBinding === 'string' ? App.Store.AsyncQuery(dataBinding) : new Promise((rs, rj) => rs(dataBinding));
            const promiseFieldsBinding = fieldBinding && typeof fieldBinding === 'string' ? App.Store.AsyncQuery(fieldBinding) : new Promise((rs, rj) => rs(fieldBinding));

            Promise.all([promiseFieldsBinding, promiseDataBinding])
                .then((response) => {
        
                    const storage = response[0];
                    const value = response[1];
        
                    this._form.fields = this._performChanges(storage).fields;
                    this._form.value = value;
                    
                    App.Loading.Hide();

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
        
                });
    
        });

    }

}