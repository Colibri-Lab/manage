


App.Modules.Manage = class extends Colibri.Modules.Module {

    /** @constructor */
    constructor() {
        super('Manage');
    }

    InitializeModule() {
        super.InitializeModule();

        console.log('Initializing module Manage');

        this._formWindow = null;

        this._store = App.Store.AddChild('app.manage', {}, this);
        this._store.AddPathLoader('manage.storages', () => this.Storages(true));
        this._store.AddPathLoader('manage.datapoints', () => this.DataPoints(true));
        this._store.AddPathLoader('manage.modules', () => this.Modules(true));
        this._store.AddPathLoader('manage.templates', () => this.Templates(true));
        this._store.AddPathLoader('manage.snippets', () => this.Snippets(true));
        this._store.AddPathLoader('manage.folders', () => this.Folders('', true));
        this._store.AddPathLoader('manage.files', () => this.Files('', '', true));
        this._store.AddPathLoader('manage.remotebuckets', () => this.RemoteBuckets(true));
        this._store.AddPathLoader('manage.remotefiles', () => this.RemoteFiles(null, '', 1, 1, true));
        this._store.AddHandler('StoreLoaderCrushed', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });
        this.AddHandler('CallError', (event, args) => {
            if(args.status === 403) {
                location.reload();
            }
        });

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

    FileByGuid(name, guid, bucket, type) {
        return new Promise((resolve, reject) => {
            this.Call('Files', 'ByGuid', {guid: guid, bucket: bucket, type: type}).then((response) => {
                if(response.status === 200) {
                    // response.result - base64 of file
                    const mimetype = Colibri.Common.MimeType.ext2type(type);
                    const file = Base2File(response.result, name, mimetype, false)
                    resolve(file);
                }
            });
        });
    }

    OpenFileByGuid(guid, bucket, type) {
        window.open('/modules/manage/files/by-guid.stream?guid=' + guid + '&bucket=' + bucket + '&type=' + type);
    }

    Storages(returnPromise = false) {
        const promise = this.Call('Storages', 'Config', {__raw: 1});
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

    Templates(returnPromise = false) {
        const promise = this.Call('Templates', 'Config');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.templates', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    Snippets(returnPromise = false) {
        const promise = this.Call('Templates', 'Snippets');
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.snippets', response.result);
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

    Folders(path = '', returnPromise = false) {
        const promise = this.Call('FileManager', 'Folders', {path: path})
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.folders', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    Files(path = '', searchTerm = '', returnPromise = false) {
        const promise = this.Call('FileManager', 'Files', {path: path, term: searchTerm})
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.files', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    CreateFolder(path) {
        this.Call('FileManager', 'CreateFolder', {path: path})
            .then((response) => {
                let folders = this._store.Query('manage.folders');
                if(!Array.isArray(folders)) {
                    folders = [];
                }
                folders.push(response.result);
                this._store.Set('manage.folders', folders);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RenameFolder(pathFrom, pathTo) {
        this.Call('FileManager', 'RenameFolder', {pathFrom: pathFrom, pathTo: pathTo})
            .then((response) => {
                this._store.Set('manage.folders', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoveFolder(path) {
        this.Call('FileManager', 'RemoveFolder', {path: path})
            .then((response) => {
                this._store.Set('manage.folders', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RenameFile(path, nameFrom, nameTo) {
        this.Call('FileManager', 'RenameFile', {path: path, nameFrom: nameFrom, nameTo: nameTo})
            .then((response) => {
                this._store.Set('manage.files', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoveFile(path) {
        this.Call('FileManager', 'RemoveFile', {path: path})
            .then((response) => {
                this._store.Set('manage.files', response.result);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    UploadFiles(path, files) {
        this.Call('FileManager', 'UploadFiles', {path: path, files: files}, {}, true, 'UploadFiles')
            .then((response) => {
                let files = this._store.Query('manage.files');
                if(!Array.isArray(files)) {
                    files = [];
                }
                files = files.concat(response.result);
                this._store.Set('manage.files', files);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoteBuckets(returnPromise = false) {
        const promise = this.Call('RemoteFileServer', 'ListBuckets')
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.remotebuckets', response.result);
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }

    RemoteFiles(bucket, term = null, page = 1, pagesize = 20, returnPromise = false) {
        const promise = this.Call('RemoteFileServer', 'ListFiles', {bucket: bucket.name, term: term, page: page, pagesize: pagesize})
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            if(page == 1) {
                this._store.Set('manage.remotefiles', response.result);
            }
            else if(Array.isArray(response.result)) {
                let data = this._store.Query('manage.remotefiles');
                if(!data || !Array.isArray(data)) {
                    data = [];
                }
                data = data.concat(response.result);
                this._store.Set('manage.remotefiles', data);
            }
        }).catch((response) => {
            App.Notices.Add(new Colibri.UI.Notice(response.result));
        });
    }
    
    CreateBucket(bucket) {
        this.Call('RemoteFileServer', 'CreateBucket', {bucket: bucket})
            .then((response) => {
                let folders = this._store.Query('manage.remotebuckets');
                folders.push(response.result);
                this._store.Set('manage.remotebuckets', folders);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    RemoveBucket(bucket) {
        this.Call('RemoteFileServer', 'RemoveBucket', {bucket: bucket.name})
            .then((response) => {
                let folders = this._store.Query('manage.remotebuckets');
                folders = folders.filter(f => f.token != bucket.token);
                this._store.Set('manage.remotebuckets', folders);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }


    UploadFilesToRemote(bucket, files) {
        this.Call('RemoteFileServer', 'UploadFiles', {bucket: bucket.token, bucketname: bucket.name, files: files}, {}, true, 'UploadFiles')
            .then((response) => {
                let files = this._store.Query('manage.remotefiles');
                if(!Array.isArray(files)) {
                    files = [];
                }
                files = files.concat(response.result);
                this._store.Set('manage.remotefiles', files);
            }).catch((response) => {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            });
    }

    DeleteFilesFromRemote(bucket, files) {
        this.Call('RemoteFileServer', 'RemoveFile', {bucket: bucket.token, files: files})
            .then((response) => {
                let fs = this._store.Query('manage.remotefiles');
                let newFiles = [];
                for(const f of fs) {
                    if(files.indexOf(f.guid) === -1) {
                        newFiles.push(f);
                    }
                };
                this._store.Set('manage.remotefiles', newFiles);
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
Colibri.UI.FieldIcons['App.Modules.Manage.UI.RemoteFile'] = '<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4.76414H7C5.897 4.76414 5 5.61883 5 6.66981V20.0094C5 21.0604 5.897 21.9151 7 21.9151H21C22.103 21.9151 23 21.0604 23 20.0094V6.66981C23 5.61883 22.103 4.76414 21 4.76414ZM7 20.0094V6.66981H21L21.002 20.0094H7Z" fill="#2E3A59"/><path d="M14 8C11.243 8 9 10.243 9 13C9 15.757 11.243 18 14 18C16.757 18 19 15.757 19 13C19 10.243 16.757 8 14 8ZM17.8955 14.7857H16.6759C16.7708 14.3385 16.8308 13.8591 16.8501 13.3571H18.2707C18.2287 13.8632 18.0986 14.3445 17.8955 14.7857ZM10.1045 11.2143H11.3241C11.2292 11.6615 11.1692 12.1409 11.1499 12.6429H9.72929C9.77125 12.1368 9.90143 11.6555 10.1045 11.2143ZM12.5714 10.5H12.2726C12.5981 9.61254 13.0878 8.97237 13.6429 8.77701V12.6429H11.865C11.887 12.1393 11.9546 11.6574 12.0596 11.2143H12.5714C12.7687 11.2143 12.9286 11.0544 12.9286 10.8571C12.9286 10.6599 12.7687 10.5 12.5714 10.5ZM15.7274 10.5H14.3571V8.77701C14.9122 8.97237 15.4019 9.61254 15.7274 10.5ZM9.72929 13.3571H11.1499C11.1692 13.8591 11.2292 14.3385 11.3241 14.7857H10.1045C9.90143 14.3445 9.77125 13.8632 9.72929 13.3571ZM11.865 13.3571H13.6429V14.7857H12.0596C11.9547 14.3426 11.887 13.8607 11.865 13.3571ZM13.6429 15.5V17.223C13.0878 17.0276 12.5981 16.3875 12.2726 15.5H13.6429ZM14.3571 17.223V15.5H15.7274C15.4019 16.3875 14.9122 17.0276 14.3571 17.223ZM14.3571 14.7857V11.2143H15.9404C16.0453 11.6574 16.113 12.1393 16.1349 12.6429H15.4286C15.2313 12.6429 15.0714 12.8028 15.0714 13C15.0714 13.1972 15.2313 13.3571 15.4286 13.3571H16.135C16.113 13.8607 16.0454 14.3426 15.9405 14.7857H14.3571ZM16.8501 12.6429C16.8308 12.1409 16.7708 11.6615 16.6759 11.2143H17.8955C18.0985 11.6555 18.2287 12.1368 18.2707 12.6429H16.8501ZM17.4789 10.5H16.4862C16.3149 9.97045 16.0898 9.50411 15.8231 9.12196C16.4851 9.43446 17.0547 9.91143 17.4789 10.5ZM12.1769 9.12196C11.9102 9.50406 11.6851 9.9704 11.5137 10.5H10.5211C10.9453 9.91143 11.5149 9.43446 12.1769 9.12196ZM10.5211 15.5H11.5137C11.6851 16.0296 11.9102 16.4959 12.1769 16.878C11.5149 16.5655 10.9453 16.0886 10.5211 15.5ZM15.8231 16.878C16.0898 16.4959 16.3149 16.0296 16.4862 15.5H17.4788C17.0547 16.0886 16.4851 16.5655 15.8231 16.878Z" fill="#2E3A59"/></svg>';
Colibri.UI.FieldIcons['App.Modules.Manage.UI.RemoteFiles'] = '<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4.76414H7C5.897 4.76414 5 5.61883 5 6.66981V20.0094C5 21.0604 5.897 21.9151 7 21.9151H21C22.103 21.9151 23 21.0604 23 20.0094V6.66981C23 5.61883 22.103 4.76414 21 4.76414ZM7 20.0094V6.66981H21L21.001 13.3396L21.002 20.0094H7Z" fill="#2E3A59"/><path d="M14.6667 17L14 16.3333L12 19H20L16.6667 14.3333L14.6667 17Z" fill="#2E3A59"/><path d="M13.6667 15C14.219 15 14.6667 14.5523 14.6667 14C14.6667 13.4477 14.219 13 13.6667 13C13.1144 13 12.6667 13.4477 12.6667 14C12.6667 14.5523 13.1144 15 13.6667 15Z" fill="#2E3A59"/><path d="M12 8C9.79439 8 8 9.79439 8 12C8 14.2056 9.79439 16 12 16C14.2056 16 16 14.2056 16 12C16 9.79439 14.2056 8 12 8ZM15.1164 13.4286H14.1407C14.2167 13.0708 14.2646 12.6873 14.2801 12.2857H15.4166C15.383 12.6905 15.2789 13.0756 15.1164 13.4286ZM8.88361 10.5714H9.85929C9.78332 10.9292 9.73539 11.3127 9.71989 11.7143H8.58343C8.617 11.3095 8.72114 10.9244 8.88361 10.5714ZM10.8571 10H10.6181C10.8785 9.29004 11.2702 8.77789 11.7143 8.62161V11.7143H10.292C10.3096 11.3114 10.3637 10.9259 10.4476 10.5714H10.8571C11.0149 10.5714 11.1429 10.4435 11.1429 10.2857C11.1429 10.1279 11.0149 10 10.8571 10ZM13.3819 10H12.2857V8.62161C12.7298 8.77789 13.1215 9.29004 13.3819 10ZM8.58343 12.2857H9.71989C9.73539 12.6873 9.78332 13.0708 9.85929 13.4286H8.88361C8.72114 13.0756 8.617 12.6905 8.58343 12.2857ZM10.292 12.2857H11.7143V13.4286H10.4476C10.3637 13.0741 10.3096 12.6886 10.292 12.2857ZM11.7143 14V15.3784C11.2702 15.2221 10.8785 14.71 10.6181 14H11.7143ZM12.2857 15.3784V14H13.3819C13.1215 14.71 12.7298 15.2221 12.2857 15.3784ZM12.2857 13.4286V10.5714H13.5524C13.6363 10.9259 13.6904 11.3114 13.7079 11.7143H13.1429C12.9851 11.7143 12.8571 11.8422 12.8571 12C12.8571 12.1578 12.9851 12.2857 13.1429 12.2857H13.708C13.6904 12.6886 13.6363 13.0741 13.5524 13.4286H12.2857ZM14.2801 11.7143C14.2646 11.3127 14.2167 10.9292 14.1407 10.5714H15.1164C15.2788 10.9244 15.383 11.3095 15.4166 11.7143H14.2801ZM14.7831 10H13.989C13.8519 9.57636 13.6719 9.20329 13.4585 8.89757C13.9881 9.14757 14.4438 9.52914 14.7831 10ZM10.5415 8.89757C10.3281 9.20325 10.1481 9.57632 10.011 10H9.21689C9.55625 9.52914 10.0119 9.14757 10.5415 8.89757ZM9.21689 14H10.011C10.1481 14.4236 10.3281 14.7967 10.5415 15.1024C10.0119 14.8524 9.55625 14.4709 9.21689 14ZM13.4585 15.1024C13.6719 14.7968 13.8519 14.4237 13.989 14H14.7831C14.4438 14.4709 13.9881 14.8524 13.4585 15.1024Z" fill="#2E3A59"/></svg>';
Colibri.UI.FieldIcons['App.Modules.Manage.UI.File'] = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H5V25H3V3Z" fill="black"/><path d="M23 3H25V25H23V3Z" fill="black"/><path d="M3 5V3H25V5L3 5Z" fill="black"/><path d="M3 25L3 23L25 23V25H3Z" fill="black"/><path d="M15.1824 16.5099C15.1824 16.2909 15.0048 16.1134 14.7859 16.1134H8.39648C8.17754 16.1134 8 16.2909 8 16.5099C8 16.7288 8.17754 16.9063 8.39648 16.9063H14.7859C15.0048 16.9063 15.1824 16.7288 15.1824 16.5099Z" fill="black"/><path d="M10.8231 9.91879H10.3968V10.3449H10.8231V9.91879Z" fill="black"/><path d="M12.7855 11.8813H12.3594V12.3075H12.7855V11.8813Z" fill="black"/><path d="M12.7855 13.8437H12.3594V14.2699H12.7855V13.8437Z" fill="black"/><path d="M10.8231 13.8437H10.3968V14.2699H10.8231V13.8437Z" fill="black"/><path d="M14.4407 8.66004C14.4407 8.44113 14.2632 8.26356 14.0443 8.26356H9.13814C8.91919 8.26356 8.74166 8.44113 8.74166 8.66004V15.5848H14.4407V8.66004ZM11.3781 14.5474C11.3781 14.7007 11.2539 14.8249 11.1006 14.8249H10.1194C9.96606 14.8249 9.84182 14.7007 9.84182 14.5474V13.5661C9.84182 13.4129 9.96606 13.2887 10.1194 13.2887H11.1006C11.2539 13.2887 11.3781 13.4129 11.3781 13.5661V14.5474ZM11.3781 12.5849C11.3781 12.7383 11.2539 12.8625 11.1006 12.8625H10.1194C9.96606 12.8625 9.84182 12.7383 9.84182 12.5849V11.6037C9.84182 11.4504 9.96606 11.3262 10.1194 11.3262H11.1006C11.2539 11.3262 11.3781 11.4504 11.3781 11.6037V12.5849ZM11.3781 10.6225C11.3781 10.7757 11.2539 10.9 11.1006 10.9H10.1194C9.96606 10.9 9.84182 10.7757 9.84182 10.6225V9.64125C9.84182 9.488 9.96606 9.36372 10.1194 9.36372H11.1006C11.2539 9.36372 11.3781 9.488 11.3781 9.64125V10.6225ZM13.3406 14.5474C13.3406 14.7007 13.2163 14.8249 13.063 14.8249H12.0818C11.9285 14.8249 11.8043 14.7007 11.8043 14.5474V13.5661C11.8043 13.4129 11.9285 13.2887 12.0818 13.2887H13.063C13.2163 13.2887 13.3406 13.4129 13.3406 13.5661V14.5474ZM13.3406 12.5849C13.3406 12.7383 13.2163 12.8625 13.063 12.8625H12.0818C11.9285 12.8625 11.8043 12.7383 11.8043 12.5849V11.6037C11.8043 11.4504 11.9285 11.3262 12.0818 11.3262H13.063C13.2163 11.3262 13.3406 11.4504 13.3406 11.6037V12.5849ZM13.3406 10.6225C13.3406 10.7757 13.2163 10.9 13.063 10.9H12.0818C11.9285 10.9 11.8043 10.7757 11.8043 10.6225V9.64125C11.8043 9.488 11.9285 9.36372 12.0818 9.36372H13.063C13.2163 9.36372 13.3406 9.488 13.3406 9.64125V10.6225Z" fill="black"/><path d="M10.8231 11.8813H10.3968V12.3075H10.8231V11.8813Z" fill="black"/><path d="M12.7855 9.91879H12.3594V10.3449H12.7855V9.91879Z" fill="black"/><path d="M19.8674 16.7771L18.396 15.4657C18.2457 15.3316 18.0188 15.3317 17.8685 15.4656L16.3971 16.777C16.3126 16.8522 16.2644 16.96 16.2644 17.073V19.3399C16.2644 19.5588 16.4419 19.7364 16.6608 19.7364H19.6036C19.8225 19.7364 20 19.5588 20 19.3399V17.073C20 16.96 19.9518 16.8523 19.8674 16.7771Z" fill="black"/><path d="M17.2709 14.5866C17.1394 14.7182 17.1394 14.9316 17.2709 15.0632C17.4026 15.1948 17.6159 15.1948 17.7476 15.0632C17.9596 14.851 18.3048 14.851 18.5168 15.0632C18.5827 15.129 18.6689 15.1619 18.7552 15.1619C18.8414 15.1619 18.9277 15.129 18.9935 15.0632C19.1251 14.9316 19.1251 14.7182 18.9935 14.5866C18.5185 14.1118 17.7459 14.1118 17.2709 14.5866Z" fill="black"/><path d="M16.5857 13.8203C16.4541 13.9519 16.4541 14.1653 16.5857 14.2969C16.7173 14.4284 16.9307 14.4284 17.0623 14.2968C17.3481 14.0111 17.7281 13.8536 18.1322 13.8536C18.5364 13.8536 18.9164 14.011 19.2021 14.2968C19.268 14.3626 19.3542 14.3955 19.4404 14.3955C19.5267 14.3955 19.6129 14.3626 19.6787 14.2969C19.8103 14.1653 19.8103 13.9519 19.6787 13.8203C19.2657 13.4071 18.7164 13.1796 18.1322 13.1796C17.548 13.1796 16.9988 13.4071 16.5857 13.8203Z" fill="black"/><path d="M15.3526 9.98816H17.5727V12.2083C17.5727 12.4272 17.7503 12.6048 17.9692 12.6048C18.1882 12.6048 18.3657 12.4272 18.3657 12.2083V9.59172C18.3657 9.37281 18.1882 9.19523 17.9692 9.19523H15.3526C15.1337 9.19523 14.9561 9.37281 14.9561 9.59172C14.9562 9.81063 15.1337 9.98816 15.3526 9.98816Z" fill="black"/><path d="M15.3526 18.6308H13.1324V17.7191C13.1324 17.5001 12.9549 17.3226 12.736 17.3226C12.517 17.3226 12.3395 17.5001 12.3395 17.7191V19.0273C12.3395 19.2463 12.517 19.4238 12.736 19.4238H15.3526C15.5715 19.4238 15.7491 19.2463 15.7491 19.0273C15.749 18.8084 15.5715 18.6308 15.3526 18.6308Z" fill="black"/></svg>';
Colibri.UI.FieldIcons['App.Modules.Manage.UI.Files'] = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H5V25H3V3Z" fill="black"/><path d="M23 3H25V25H23V3Z" fill="black"/><path d="M3 5V3H25V5L3 5Z" fill="black"/><path d="M3 25L3 23L25 23V25H3Z" fill="black"/><path d="M15.1824 16.5099C15.1824 16.2909 15.0048 16.1134 14.7859 16.1134H8.39648C8.17754 16.1134 8 16.2909 8 16.5099C8 16.7288 8.17754 16.9063 8.39648 16.9063H14.7859C15.0048 16.9063 15.1824 16.7288 15.1824 16.5099Z" fill="black"/><path d="M10.8231 9.91879H10.3968V10.3449H10.8231V9.91879Z" fill="black"/><path d="M12.7855 11.8813H12.3594V12.3075H12.7855V11.8813Z" fill="black"/><path d="M12.7855 13.8437H12.3594V14.2699H12.7855V13.8437Z" fill="black"/><path d="M10.8231 13.8437H10.3968V14.2699H10.8231V13.8437Z" fill="black"/><path d="M14.4407 8.66004C14.4407 8.44113 14.2632 8.26356 14.0443 8.26356H9.13814C8.91919 8.26356 8.74166 8.44113 8.74166 8.66004V15.5848H14.4407V8.66004ZM11.3781 14.5474C11.3781 14.7007 11.2539 14.8249 11.1006 14.8249H10.1194C9.96606 14.8249 9.84182 14.7007 9.84182 14.5474V13.5661C9.84182 13.4129 9.96606 13.2887 10.1194 13.2887H11.1006C11.2539 13.2887 11.3781 13.4129 11.3781 13.5661V14.5474ZM11.3781 12.5849C11.3781 12.7383 11.2539 12.8625 11.1006 12.8625H10.1194C9.96606 12.8625 9.84182 12.7383 9.84182 12.5849V11.6037C9.84182 11.4504 9.96606 11.3262 10.1194 11.3262H11.1006C11.2539 11.3262 11.3781 11.4504 11.3781 11.6037V12.5849ZM11.3781 10.6225C11.3781 10.7757 11.2539 10.9 11.1006 10.9H10.1194C9.96606 10.9 9.84182 10.7757 9.84182 10.6225V9.64125C9.84182 9.488 9.96606 9.36372 10.1194 9.36372H11.1006C11.2539 9.36372 11.3781 9.488 11.3781 9.64125V10.6225ZM13.3406 14.5474C13.3406 14.7007 13.2163 14.8249 13.063 14.8249H12.0818C11.9285 14.8249 11.8043 14.7007 11.8043 14.5474V13.5661C11.8043 13.4129 11.9285 13.2887 12.0818 13.2887H13.063C13.2163 13.2887 13.3406 13.4129 13.3406 13.5661V14.5474ZM13.3406 12.5849C13.3406 12.7383 13.2163 12.8625 13.063 12.8625H12.0818C11.9285 12.8625 11.8043 12.7383 11.8043 12.5849V11.6037C11.8043 11.4504 11.9285 11.3262 12.0818 11.3262H13.063C13.2163 11.3262 13.3406 11.4504 13.3406 11.6037V12.5849ZM13.3406 10.6225C13.3406 10.7757 13.2163 10.9 13.063 10.9H12.0818C11.9285 10.9 11.8043 10.7757 11.8043 10.6225V9.64125C11.8043 9.488 11.9285 9.36372 12.0818 9.36372H13.063C13.2163 9.36372 13.3406 9.488 13.3406 9.64125V10.6225Z" fill="black"/><path d="M10.8231 11.8813H10.3968V12.3075H10.8231V11.8813Z" fill="black"/><path d="M12.7855 9.91879H12.3594V10.3449H12.7855V9.91879Z" fill="black"/><path d="M19.8674 16.7771L18.396 15.4657C18.2457 15.3316 18.0188 15.3317 17.8685 15.4656L16.3971 16.777C16.3126 16.8522 16.2644 16.96 16.2644 17.073V19.3399C16.2644 19.5588 16.4419 19.7364 16.6608 19.7364H19.6036C19.8225 19.7364 20 19.5588 20 19.3399V17.073C20 16.96 19.9518 16.8523 19.8674 16.7771Z" fill="black"/><path d="M17.2709 14.5866C17.1394 14.7182 17.1394 14.9316 17.2709 15.0632C17.4026 15.1948 17.6159 15.1948 17.7476 15.0632C17.9596 14.851 18.3048 14.851 18.5168 15.0632C18.5827 15.129 18.6689 15.1619 18.7552 15.1619C18.8414 15.1619 18.9277 15.129 18.9935 15.0632C19.1251 14.9316 19.1251 14.7182 18.9935 14.5866C18.5185 14.1118 17.7459 14.1118 17.2709 14.5866Z" fill="black"/><path d="M16.5857 13.8203C16.4541 13.9519 16.4541 14.1653 16.5857 14.2969C16.7173 14.4284 16.9307 14.4284 17.0623 14.2968C17.3481 14.0111 17.7281 13.8536 18.1322 13.8536C18.5364 13.8536 18.9164 14.011 19.2021 14.2968C19.268 14.3626 19.3542 14.3955 19.4404 14.3955C19.5267 14.3955 19.6129 14.3626 19.6787 14.2969C19.8103 14.1653 19.8103 13.9519 19.6787 13.8203C19.2657 13.4071 18.7164 13.1796 18.1322 13.1796C17.548 13.1796 16.9988 13.4071 16.5857 13.8203Z" fill="black"/><path d="M15.3526 9.98816H17.5727V12.2083C17.5727 12.4272 17.7503 12.6048 17.9692 12.6048C18.1882 12.6048 18.3657 12.4272 18.3657 12.2083V9.59172C18.3657 9.37281 18.1882 9.19523 17.9692 9.19523H15.3526C15.1337 9.19523 14.9561 9.37281 14.9561 9.59172C14.9562 9.81063 15.1337 9.98816 15.3526 9.98816Z" fill="black"/><path d="M15.3526 18.6308H13.1324V17.7191C13.1324 17.5001 12.9549 17.3226 12.736 17.3226C12.517 17.3226 12.3395 17.5001 12.3395 17.7191V19.0273C12.3395 19.2463 12.517 19.4238 12.736 19.4238H15.3526C15.5715 19.4238 15.7491 19.2463 15.7491 19.0273C15.749 18.8084 15.5715 18.6308 15.3526 18.6308Z" fill="black"/></svg>';

const Manage = new App.Modules.Manage();

