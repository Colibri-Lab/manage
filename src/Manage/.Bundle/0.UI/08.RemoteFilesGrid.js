App.Modules.Manage.UI.RemoteFilesGrid = class extends Colibri.UI.Grid {
 

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {

        if(!data) {
            data = [];
        }
        else if(Object.isObject(data)) {
            data = Object.values(data);
        }

        if(data.length == 0) {
            this.ClearAllRows();
        }

        let found = [];
        data.forEach((file) => {
            found.push('file' + file.guid);
            let row = this.FindRow('file' + file.guid);
            if(!row) {
                this.rows.Add('file' + file.guid, file);
            }
            else {
                row.value = file;
            }
        });

        this.ForEveryRow((name, row) => {
            if(found.indexOf(name) === -1) {
                row.Dispose();
            }
        });

        this.rows.title = '';

    }

    
}