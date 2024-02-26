App.Modules.Manage.Windows.FilterWindow = class extends Colibri.UI.Window {

    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FilterWindow']);

        this.AddClass('app-filter-window-component');

        this._form = this.Children('form');
        this._fieldEvents = {};

        this._cancel = this.Children('cancel');
        this._save = this.Children('save');
        this._clear = this.Children('clear');
        
        this.movable = true;
        
    }

    _performChanges(storage, s, p) {

        Object.forEach(storage.fields, (name, field) => {
            
            if(field.component === 'Number' || field.component === 'Colibri.UI.Forms.Number') {
                field.component = field.component === 'Colibri.UI.Forms.Number' ? 'Colibri.UI.Forms.NumberRange' : 'NumberRange';
            } else if(field.component == 'Date' || field.component == 'Colibri.UI.Forms.Date') {
                field.component = field.component == 'Colibri.UI.Forms.Date' ? 'Colibri.UI.Forms.DateRange' : 'DateRange';
            } else if(field.component == 'DateTime' || field.component == 'Colibri.UI.Forms.DateTime') {
                field.component = field.component == 'Colibri.UI.Forms.DateTime' ? 'Colibri.UI.Forms.DateTimeRange' : 'DateRangeTime';
            } else if(field.component == 'Select' || field.component == 'Colibri.UI.Forms.Select') {
                field.params.multiple = true;
            } else if(field.component === 'Array' || field.component === 'Colibri.UI.Forms.Array') {
                field.params.addlink = null;
            } else if(field.component === 'Checkbox' || field.component === 'Colibri.UI.Forms.Checkbox') {
                field.component = 'Colibri.UI.Forms.Radio';
                field.values = [{
                    value: '',
                    title: '#{manage-formwindow-buttons-nometter}'
                }, {
                    value: 0,
                    title: '#{manage-formwindow-buttons-no}'
                }, {
                    value: 1,
                    title: '#{manage-formwindow-buttons-yes}'
                }];
                field.params.default = null;
            }
            field.params.readonly = false;
            field.params.enabled = true;
            delete field.default;
            delete field.params.default;
            delete field.params.valuegenerator;
            delete field.params.fieldgenerator;
            delete field.params.onchangehandler;

            if(
                field.component === 'File' || 
                field.component === 'Colibri.UI.Forms.File' || 
                field.component === 'Files' || 
                field.component === 'Colibri.UI.Forms.Files') {
                delete storage.fields[name];
                return true;
            }

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

    _cleanFilters(formData) {
        const newFormData = {};
        Object.forEach(formData, (name, value) => {
            if(Array.isArray(value)) {
                let newValue = [];
                value.forEach((v, index) => {
                    if(Object.isObject(v)) {
                        v = this._cleanFilters(v);
                        if(Object.countKeys(v) > 0) {
                            newValue.push(v);
                        }
                    } else {
                        if(v) {
                            newValue.push(v);
                        }
                    }
                });
                if(newValue.length > 0) {
                    newFormData[name] = newValue;
                }
            } else if(Object.isObject(value)) {
                value = this._cleanFilters(value);
                if(Object.countKeys(value) > 0) {
                    newFormData[name] = value;
                }
            } else {
                if(value !== null && value !== '') {
                    newFormData[name] = value;
                }
            }
        });
        return newFormData;
    }

    Show(title, width, fieldBinding, dataBinding, className = '', fieldEvents = {}) {

        this.title = title;
        this.width = width;
        if(className) {
            this.AddClass(className);
        }
 
        this.shown = true;   
        this._fieldEvents = fieldEvents;

        App.Loading.Show();
        return new Promise((resolve, reject) => {

            const promiseDataBinding = dataBinding && typeof dataBinding === 'string' ? App.Store.AsyncQuery(dataBinding) : new Promise((rs, rj) => rs(dataBinding));
            const promiseFieldsBinding = fieldBinding && typeof fieldBinding === 'string' ? App.Store.AsyncQuery(fieldBinding) : new Promise((rs, rj) => rs(fieldBinding));

            Promise.all([promiseFieldsBinding, promiseDataBinding])
                .then((response) => {
        
                    const storage = Object.cloneRecursive(response[0]);
                    const value = response[1];
        
                    this.ReCreateForm(this._performChanges(storage).fields, value);
                    
                    App.Loading.Hide();

                    this._save.ClearHandlers();
                    this._save.AddHandler('Clicked', () => {
                        resolve(this._cleanFilters(this._form.value));
                        this.Hide();
                    });

                    this._cancel.ClearHandlers();
                    this._cancel.AddHandler('Clicked', () => {
                        reject();
                        this.Hide();
                    });

                    this._clear.ClearHandlers();
                    this._clear.AddHandler('Clicked', () => {
                        resolve({});
                        this.Hide();
                    });
        
                });
    
        });

    }

    ReCreateForm(fields, value) {

        let newFields = Object.assign({
            id: {
                component: 'NumberRange',
                desc: '#{manage-formwindow-id-desc}'
            },
            datecreated: {
                component: 'DateTimeRange',
                desc: '#{manage-formwindow-datecreated-desc}'
            },
            datemodified: {
                component: 'DateTimeRange',
                desc: '#{manage-formwindow-datemodified-desc}'
            },
        }, fields);
        

        this._form.Clear();
        this._form.fields = newFields;

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