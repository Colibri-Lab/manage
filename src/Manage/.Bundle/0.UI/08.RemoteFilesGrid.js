App.Modules.Manage.UI.RemoteFilesGrid = class extends Colibri.UI.Grid {
 
    __renderBoundedValues(data) {

        if(!data) {
            data = [];
        }
        else if(!Array.isArray(data) && data instanceof Object) {
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