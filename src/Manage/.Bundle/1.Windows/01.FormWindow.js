/**
 * @class
 * @extends Colibri.UI.Window
 * @memberof App.Modules.Manage.Windows
 */
App.Modules.Manage.Windows.FormWindow = class extends Colibri.UI.Window {

    /**
     * Constructor
     * @constructor
     * @param {string} name component name
     * @param {Colibri.UI.IContainer} container component container
     */
    constructor(name, container) {
        super(name, container, Colibri.UI.Templates['App.Modules.Manage.Windows.FormWindow']);

        this.AddClass('app-form-window-component');

        this._optionsImportJson = this.Children('options/import-json');
        this._optionsExportJson = this.Children('options/export-json');
        
        this._form = this.Children('form');
        this._validator = new Colibri.UI.FormValidator(this._form);
        this._fieldEvents = {};

        this._cancel = this.Children('cancel');
        this._save = this.Children('save');
        this.movable = true;

        this.AddHandler('WindowBeforeClosed', this.__thisWindowBeforeClosed);
        this.AddHandler('WindowClosed', this.__thisWindowClosed);
        this._validator.AddHandler('Validated', () => this._save.enabled = this._validator.Validate());

        this._save.AddHandler('Clicked', () => (this._saveCallback && this._saveCallback(this._form.value)));
        this._cancel.AddHandler('Clicked', () => (this._cancelCallback && this._cancelCallback()));

        this._optionsExportJson.AddHandler('Clicked', this.__optionsExportJsonClicked, false, this);
        this._optionsImportJson.AddHandler('Clicked', this.__optionsImportJsonClicked, false, this);

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     */
    __optionsExportJsonClicked(event, args) {
        const data = JSON.stringify(this._form.value, null, 4);
        data.copyToClipboard().then(() => {
            App.Notices.Add(new Colibri.UI.Notice('#{manage-formwindow-options-copied}', Colibri.UI.Notice.Success));
        });
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     */
    __optionsImportJsonClicked(event, args) {
        App.Prompt.Show('#{manage-formwindow-options-importtitle}', {
            d: {
                component: 'TextArea',
                placeholder: '#{manage-formwindow-options-importplaceholder}'
            }
        }, '#{manage-formwindow-options-importbutton}').then((data) => {
            this._form.value = JSON.parse(data.d);
            return this.Dispatch('Changed', { component: this });
        });
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     * @async
     */
    async __thisWindowBeforeClosed(event, args) {
        if (this._form.changed) {
            try {
                await App.Confirm.Show('#{manage-formwindow-closeconfirm}', '#{manage-formwindow-closeconfirmtitle}');
                args.cancel = false;
                return true;
            } catch(e) {
                args.cancel = true;
                return true;
            }
        }
        args.cancel = false;
        return true;
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.UI.Event} event
     * @param {Object} args
     */
    __thisWindowClosed(event, args) {
        this._form.Clear();
    }

    /**
     * @ignore
     * @private
     * @param {Object} storage storage object
     * @param {Object} s parent storage object
     * @param {string} p parent field path
     * @returns {Object} modified storage object
     */
    _performChanges(storage, s, p) {
        Object.forEach(storage.fields, (name, field) => {
            field.storage = s ? s.name : storage.name;
            field.field = (p ? p + '.' : '') + name;
            if (field?.params?.security && Security) {
                Object.forEach(field.params.security, (name, value) => {
                    field[name] = Security.IsCommandAllowed(value);
                });
            }
            if (field.fields) {
                this._performChanges(field, storage, field.field);
            }
        });
        return storage;
    }

    /**
     * Show the form window
     * @param {string} title window title
     * @param {number} width window width
     * @param {Object|string} fieldBinding field binding object or store query string
     * @param {Object|string} dataBinding data binding object or store query string
     * @param {string} className additional class name for the window
     * @param {Object} fieldEvents field events object
     * @param {Function} saveCallback save callback function
     * @param {Function} cancelCallback cancel callback function
     * @returns {Promise} promise that resolves when the form is shown
     * @public
     */
    Show(title, width, fieldBinding, dataBinding, className = '', fieldEvents = {}, saveCallback, cancelCallback) {

        this._saveCallback = saveCallback;
        this._cancelCallback = cancelCallback;

        this.title = title;
        this.width = width;
        if (className) {
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
                    this._form.Focus();
                }).finally(() => {
                    App.Loading.Hide();
                });

        });

    }

    /**
     * Recreate the form with new fields and value
     * @param {Object} fields form fields object
     * @param {Object} value form value object
     * @public
     */
    ReCreateForm(fields, value) {

        this._form.Clear();
        this._form.fields = fields;

        Object.forEach(this._fieldEvents, (name, eventData) => {
            const component = this._form.Children(name);
            if (component) {
                component.AddHandler(eventData.event, eventData.handler);
            }
        });

        this._form.Focus();
        this._form.value = value;

    }

}