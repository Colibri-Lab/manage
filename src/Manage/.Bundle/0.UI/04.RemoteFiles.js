App.Modules.Manage.UI.RemoteFiles = class extends Colibri.UI.Forms.File {

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
Colibri.UI.Forms.Field.RegisterFieldComponent('RemoteFiles', 'App.Modules.Manage.UI.RemoteFiles', 'Файл из удаленного хранилища')
