App.Modules.Manage.UI.RemoteFile = class extends Colibri.UI.Forms.File {

    /**
     * Значение поля (выбранный файл)
     * @type {RemoteFile}
     */
     get value() {
        return this._value;
    }
    set value(value) {

        Manage.FilesByGuid(value.guid, this._fieldData.storage, this._fieldData.field, value.name, value.mimetype).then((file) => {
            this._value = file;
            this._showFile();
        });

    }

}
Colibri.UI.Forms.Field.RegisterFieldComponent('RemoteFile', 'App.Modules.Manage.UI.RemoteFile', 'Файл из удаленного хранилища')
