


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
        this._store.AddPathLoader('manage.settings', 'Manage:Manage.Settings');
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

        this._store.Reload('manage.settings').then(settings => {
            if(!Colibri.Common.Cookie.Get(settings['lang-cookie-name'])) {
                this.ChangeLanguage(settings.lang.name, settings);
            }
        });


    }

    ChangeLanguage(lang, settings) {
        const s = settings ?? this._store.Query('manage.settings');
        Colibri.Common.Cookie.Set(s['lang-cookie-name'], lang, 365, '/', s['lang-cookie-domain']);
        Colibri.Common.Delay(100).then(() => {
            location.reload();
        });
    }

    get Store() {
        return this._store;
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


        this.Requests('FileManager.Files')?.Abort();
        let promise = Promise.resolve([]);
        if(path.indexOf('/files') === 0) {
            promise = this.Call('FileManager', 'Files', {path: path, term: searchTerm}, {}, true, 'FileManager.Files');
        }
        if(returnPromise) {
            return promise;
        }
        promise.then((response) => {
            this._store.Set('manage.files', response.result);
        }).catch((response) => {
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
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
        if(!bucket) {
            return;
        }
        this.Requests('RemoteFileServer.ListFiles')?.Abort();
        const promise = this.Call('RemoteFileServer', 'ListFiles', {bucket: bucket.name, term: term, page: page, pagesize: pagesize}, {}, true, 'RemoteFileServer.ListFiles');
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
            if(response.status > 0) {
                App.Notices.Add(new Colibri.UI.Notice(response.result));
            }
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

    get FilterWindow() {
        if(this._filterWindow) {
            return this._filterWindow;
        }

        this._filterWindow = new App.Modules.Manage.Windows.FilterWindow('filter-window', document.body);
        if(!this._filterWindow.isConnected) {
            this._filterWindow.ConnectTo(document.body);
        }

        return this._filterWindow;
    }


    get Store() {
        return this._store;
    }


}

Colibri.UI.FieldIcons = Object.assign(Colibri.UI.FieldIcons, {
    'App.Modules.Manage.UI.TinyMCETextArea': '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="24" height="24" rx="4" fill="#E0E0E0"/><path d="M17.1917 20L22 14L17.1917 8L16.0603 9.41177L19.7373 14L16.0603 18.5882L17.1917 20Z" fill="black"/><path d="M10.8083 8L6 14L10.8083 20L11.9397 18.5882L8.26274 14L11.9397 9.41177L10.8083 8Z" fill="black"/></svg>',
	'App.Modules.Manage.UI.RemoteFile': '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="24" height="24" rx="4" fill="#E0E0E0"/><path d="M14 5C9.0374 5 5 9.2617 5 14.5C5 19.7383 9.0374 24 14 24C18.9626 24 23 19.7383 23 14.5C23 9.2617 18.9626 5 14 5ZM21.0119 17.8928H18.8166C18.9874 17.0431 19.0954 16.1323 19.1302 15.1785H21.6873C21.6117 16.1401 21.3775 17.0545 21.0119 17.8928ZM6.9881 11.1072H9.18338C9.01256 11.9569 8.90456 12.8677 8.86982 13.8215H6.31272C6.38825 12.8599 6.62257 11.9455 6.9881 11.1072ZM11.4285 9.75H10.8907C11.4766 8.06383 12.358 6.8475 13.3572 6.47632V13.8215H10.157C10.1966 12.8647 10.3183 11.9491 10.5073 11.1072H11.4285C11.7837 11.1072 12.0715 10.8034 12.0715 10.4285C12.0715 10.0538 11.7837 9.75 11.4285 9.75ZM17.1093 9.75H14.6428V6.47632C15.642 6.8475 16.5234 8.06383 17.1093 9.75ZM6.31272 15.1785H8.86982C8.90456 16.1323 9.01256 17.0431 9.18338 17.8928H6.9881C6.62257 17.0545 6.38825 16.1401 6.31272 15.1785ZM10.157 15.1785H13.3572V17.8928H10.5073C10.3185 17.0509 10.1966 16.1353 10.157 15.1785ZM13.3572 19.25V22.5237C12.358 22.1524 11.4766 20.9362 10.8907 19.25H13.3572ZM14.6428 22.5237V19.25H17.1093C16.5234 20.9362 15.642 22.1524 14.6428 22.5237ZM14.6428 17.8928V11.1072H17.4927C17.6815 11.9491 17.8034 12.8647 17.8428 13.8215H16.5715C16.2163 13.8215 15.9285 14.1253 15.9285 14.5C15.9285 14.8747 16.2163 15.1785 16.5715 15.1785H17.843C17.8034 16.1353 17.6817 17.0509 17.4929 17.8928H14.6428ZM19.1302 13.8215C19.0954 12.8677 18.9874 11.9569 18.8166 11.1072H21.0119C21.3773 11.9455 21.6117 12.8599 21.6873 13.8215H19.1302ZM20.262 9.75H18.4752C18.1668 8.74385 17.7616 7.85781 17.2816 7.13172C18.4732 7.72547 19.4985 8.63172 20.262 9.75ZM10.7184 7.13172C10.2384 7.85771 9.83318 8.74376 9.52466 9.75H7.73798C8.50154 8.63172 9.52682 7.72547 10.7184 7.13172ZM7.73798 19.25H9.52466C9.83318 20.2562 10.2384 21.1422 10.7184 21.8682C9.52682 21.2745 8.50154 20.3683 7.73798 19.25ZM17.2816 21.8682C17.7616 21.1422 18.1668 20.2562 18.4752 19.25H20.2618C19.4985 20.3683 18.4732 21.2745 17.2816 21.8682Z" fill="black"/></svg>',
	'App.Modules.Manage.UI.RemoteFiles': '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="24" height="24" rx="4" fill="#E0E0E0"/><path d="M13.6667 15.5555C14.219 15.5555 14.6667 15.0912 14.6667 14.5185C14.6667 13.9457 14.219 13.4814 13.6667 13.4814C13.1144 13.4814 12.6667 13.9457 12.6667 14.5185C12.6667 15.0912 13.1144 15.5555 13.6667 15.5555Z" fill="#2E3A59"/><path d="M14.0001 20L13 19L10 23H22L17.0001 16L14.0001 20Z" fill="black"/><path d="M11 6C7.69158 6 5 8.69158 5 12C5 15.3084 7.69158 18 11 18C14.3084 18 17 15.3084 17 12C17 8.69158 14.3084 6 11 6ZM15.6746 14.1429H14.2111C14.3251 13.6062 14.3969 13.0309 14.4201 12.4285H16.1249C16.0745 13.0357 15.9183 13.6134 15.6746 14.1429ZM6.32541 9.8571H7.78894C7.67498 10.3938 7.60308 10.9691 7.57983 11.5715H5.87515C5.9255 10.9643 6.08171 10.3866 6.32541 9.8571ZM9.28565 9H8.92715C9.31775 7.93506 9.9053 7.16683 10.5715 6.93241V11.5715H8.438C8.4644 10.9671 8.54555 10.3888 8.6714 9.8571H9.28565C9.52235 9.8571 9.71435 9.66525 9.71435 9.42855C9.71435 9.19185 9.52235 9 9.28565 9ZM13.0728 9H11.4285V6.93241C12.0947 7.16683 12.6822 7.93506 13.0728 9ZM5.87515 12.4285H7.57983C7.60308 13.0309 7.67498 13.6062 7.78894 14.1429H6.32541C6.08171 13.6134 5.9255 13.0357 5.87515 12.4285ZM8.438 12.4285H10.5715V14.1429H8.6714C8.54555 13.6112 8.4644 13.0329 8.438 12.4285ZM10.5715 15V17.0676C9.9053 16.8331 9.31775 16.065 8.92715 15H10.5715ZM11.4285 17.0676V15H13.0728C12.6822 16.065 12.0947 16.8331 11.4285 17.0676ZM11.4285 14.1429V9.8571H13.3286C13.4544 10.3888 13.5356 10.9671 13.5619 11.5715H12.7144C12.4777 11.5715 12.2856 11.7633 12.2856 12C12.2856 12.2367 12.4777 12.4285 12.7144 12.4285H13.562C13.5356 13.0329 13.4544 13.6112 13.3286 14.1429H11.4285ZM14.4201 11.5715C14.3969 10.9691 14.3251 10.3938 14.2111 9.8571H15.6746C15.9182 10.3866 16.0745 10.9643 16.1249 11.5715H14.4201ZM15.1747 9H13.9835C13.7779 8.36454 13.5078 7.80493 13.1877 7.34635C13.9821 7.72135 14.6657 8.29371 15.1747 9ZM8.81225 7.34635C8.49215 7.80487 8.22215 8.36448 8.0165 9H6.82534C7.33438 8.29371 8.01785 7.72135 8.81225 7.34635ZM6.82534 15H8.0165C8.22215 15.6354 8.49215 16.195 8.81225 16.6536C8.01785 16.2786 7.33438 15.7063 6.82534 15ZM13.1877 16.6536C13.5078 16.1952 13.7779 15.6356 13.9835 15H15.1747C14.6657 15.7063 13.9821 16.2786 13.1877 16.6536Z" fill="black"/></svg>',
	'App.Modules.Manage.UI.File': '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="24" height="24" rx="4" fill="#E0E0E0"/><path d="M15.7736 17.3695C15.7736 17.041 15.5072 16.7748 15.1788 16.7748H5.59472C5.26631 16.7748 5 17.041 5 17.3695C5 17.6979 5.26631 17.9641 5.59472 17.9641H15.1788C15.5072 17.9641 15.7736 17.6979 15.7736 17.3695Z" fill="black"/><path d="M9.23466 7.48291H8.59521V8.12208H9.23466V7.48291Z" fill="black"/><path d="M12.1782 10.4266H11.5391V11.0659H12.1782V10.4266Z" fill="black"/><path d="M12.1782 13.3702H11.5391V14.0095H12.1782V13.3702Z" fill="black"/><path d="M9.23466 13.3702H8.59521V14.0095H9.23466V13.3702Z" fill="black"/><path d="M14.6611 5.59472C14.6611 5.26635 14.3949 5 14.0665 5H6.70727C6.37884 5 6.11255 5.26635 6.11255 5.59472V15.9819H14.6611V5.59472ZM10.0672 14.4258C10.0672 14.6557 9.88091 14.842 9.65096 14.842H8.17916C7.94915 14.842 7.76279 14.6557 7.76279 14.4258V12.9538C7.76279 12.724 7.94915 12.5377 8.17916 12.5377H9.65096C9.88091 12.5377 10.0672 12.724 10.0672 12.9538V14.4258ZM10.0672 11.482C10.0672 11.7121 9.88091 11.8984 9.65096 11.8984H8.17916C7.94915 11.8984 7.76279 11.7121 7.76279 11.482V10.0102C7.76279 9.78026 7.94915 9.59396 8.17916 9.59396H9.65096C9.88091 9.59396 10.0672 9.78026 10.0672 10.0102V11.482ZM10.0672 8.53841C10.0672 8.76821 9.88091 8.95466 9.65096 8.95466H8.17916C7.94915 8.95466 7.76279 8.76821 7.76279 8.53841V7.06653C7.76279 6.83666 7.94915 6.65024 8.17916 6.65024H9.65096C9.88091 6.65024 10.0672 6.83666 10.0672 7.06653V8.53841ZM13.011 14.4258C13.011 14.6557 12.8245 14.842 12.5946 14.842H11.1228C10.8928 14.842 10.7065 14.6557 10.7065 14.4258V12.9538C10.7065 12.724 10.8928 12.5377 11.1228 12.5377H12.5946C12.8245 12.5377 13.011 12.724 13.011 12.9538V14.4258ZM13.011 11.482C13.011 11.7121 12.8245 11.8984 12.5946 11.8984H11.1228C10.8928 11.8984 10.7065 11.7121 10.7065 11.482V10.0102C10.7065 9.78026 10.8928 9.59396 11.1228 9.59396H12.5946C12.8245 9.59396 13.011 9.78026 13.011 10.0102V11.482ZM13.011 8.53841C13.011 8.76821 12.8245 8.95466 12.5946 8.95466H11.1228C10.8928 8.95466 10.7065 8.76821 10.7065 8.53841V7.06653C10.7065 6.83666 10.8928 6.65024 11.1228 6.65024H12.5946C12.8245 6.65024 13.011 6.83666 13.011 7.06653V8.53841Z" fill="black"/><path d="M9.23466 10.4266H8.59521V11.0659H9.23466V10.4266Z" fill="black"/><path d="M12.1782 7.48291H11.5391V8.12208H12.1782V7.48291Z" fill="black"/><path d="M22.8011 17.7703L20.594 15.8032C20.3686 15.602 20.0282 15.6022 19.8028 15.803L17.5957 17.7701C17.4689 17.8829 17.3966 18.0446 17.3966 18.2141V21.6145C17.3966 21.9428 17.6629 22.2092 17.9912 22.2092H22.4054C22.7338 22.2092 23 21.9428 23 21.6145V18.2141C23 18.0446 22.9277 17.8831 22.8011 17.7703Z" fill="black"/><path d="M18.9062 14.4845C18.709 14.6819 18.709 15.002 18.9062 15.1994C19.1038 15.3968 19.4237 15.3968 19.6213 15.1994C19.9393 14.8811 20.4571 14.8811 20.7751 15.1994C20.8739 15.2981 21.0032 15.3474 21.1327 15.3474C21.262 15.3474 21.3914 15.2981 21.4901 15.1994C21.6875 15.002 21.6875 14.6819 21.4901 14.4845C20.7776 13.7723 19.6187 13.7723 18.9062 14.4845Z" fill="black"/><path d="M17.8786 13.3351C17.6812 13.5325 17.6812 13.8526 17.8786 14.05C18.076 14.2472 18.3961 14.2472 18.5935 14.0498C19.0222 13.6213 19.5922 13.385 20.1984 13.385C20.8047 13.385 21.3747 13.6211 21.8032 14.0498C21.9021 14.1485 22.0314 14.1979 22.1607 14.1979C22.2901 14.1979 22.4194 14.1485 22.5181 14.05C22.7155 13.8526 22.7155 13.5325 22.5181 13.3351C21.8986 12.7153 21.0747 12.374 20.1984 12.374C19.3221 12.374 18.4983 12.7153 17.8786 13.3351Z" fill="black"/><path d="M16.0288 7.58686H19.359V10.9171C19.359 11.2454 19.6254 11.5118 19.9537 11.5118C20.2822 11.5118 20.5485 11.2454 20.5485 10.9171V6.9922C20.5485 6.66383 20.2822 6.39746 19.9537 6.39746H16.0288C15.7005 6.39746 15.4341 6.66383 15.4341 6.9922C15.4342 7.32056 15.7005 7.58686 16.0288 7.58686Z" fill="black"/><path d="M16.0288 20.5509H12.6985V19.1834C12.6985 18.8549 12.4323 18.5886 12.1039 18.5886C11.7754 18.5886 11.5092 18.8549 11.5092 19.1834V21.1457C11.5092 21.4742 11.7754 21.7404 12.1039 21.7404H16.0288C16.3572 21.7404 16.6236 21.4742 16.6236 21.1457C16.6234 20.8173 16.3572 20.5509 16.0288 20.5509Z" fill="black"/></svg>',
	'App.Modules.Manage.UI.Files': '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="24" height="24" rx="4" fill="#E0E0E0"/><path d="M5 5H6.63636V23H5V5Z" fill="black"/><path d="M21.3636 5H23V23H21.3636V5Z" fill="black"/><path d="M5 6.63636V5H23V6.63636H5Z" fill="black"/><path d="M5 23V21.3636H23V23H5Z" fill="black"/><path d="M14.9675 16.0535C14.9675 15.8744 14.8221 15.7291 14.643 15.7291H9.41533C9.2362 15.7291 9.09094 15.8744 9.09094 16.0535C9.09094 16.2326 9.2362 16.3779 9.41533 16.3779H14.643C14.8221 16.3779 14.9675 16.2326 14.9675 16.0535Z" fill="black"/><path d="M11.4008 10.6609H11.052V11.0095H11.4008V10.6609Z" fill="black"/><path d="M13.0063 12.2666H12.6577V12.6153H13.0063V12.2666Z" fill="black"/><path d="M13.0063 13.8722H12.6577V14.2209H13.0063V13.8722Z" fill="black"/><path d="M11.4008 13.8722H11.052V14.2209H11.4008V13.8722Z" fill="black"/><path d="M14.3606 9.63091C14.3606 9.4518 14.2154 9.30652 14.0363 9.30652H10.0221C9.84301 9.30652 9.69775 9.4518 9.69775 9.63091V15.2966H14.3606V9.63091ZM11.8548 14.4478C11.8548 14.5733 11.7532 14.6749 11.6278 14.6749H10.825C10.6995 14.6749 10.5979 14.5733 10.5979 14.4478V13.645C10.5979 13.5196 10.6995 13.418 10.825 13.418H11.6278C11.7532 13.418 11.8548 13.5196 11.8548 13.645V14.4478ZM11.8548 12.8422C11.8548 12.9677 11.7532 13.0693 11.6278 13.0693H10.825C10.6995 13.0693 10.5979 12.9677 10.5979 12.8422V12.0394C10.5979 11.9139 10.6995 11.8123 10.825 11.8123H11.6278C11.7532 11.8123 11.8548 11.9139 11.8548 12.0394V12.8422ZM11.8548 11.2366C11.8548 11.3619 11.7532 11.4636 11.6278 11.4636H10.825C10.6995 11.4636 10.5979 11.3619 10.5979 11.2366V10.4337C10.5979 10.3083 10.6995 10.2066 10.825 10.2066H11.6278C11.7532 10.2066 11.8548 10.3083 11.8548 10.4337V11.2366ZM13.4605 14.4478C13.4605 14.5733 13.3588 14.6749 13.2334 14.6749H12.4306C12.3052 14.6749 12.2036 14.5733 12.2036 14.4478V13.645C12.2036 13.5196 12.3052 13.418 12.4306 13.418H13.2334C13.3588 13.418 13.4605 13.5196 13.4605 13.645V14.4478ZM13.4605 12.8422C13.4605 12.9677 13.3588 13.0693 13.2334 13.0693H12.4306C12.3052 13.0693 12.2036 12.9677 12.2036 12.8422V12.0394C12.2036 11.9139 12.3052 11.8123 12.4306 11.8123H13.2334C13.3588 11.8123 13.4605 11.9139 13.4605 12.0394V12.8422ZM13.4605 11.2366C13.4605 11.3619 13.3588 11.4636 13.2334 11.4636H12.4306C12.3052 11.4636 12.2036 11.3619 12.2036 11.2366V10.4337C12.2036 10.3083 12.3052 10.2066 12.4306 10.2066H13.2334C13.3588 10.2066 13.4605 10.3083 13.4605 10.4337V11.2366Z" fill="black"/><path d="M11.4008 12.2666H11.052V12.6153H11.4008V12.2666Z" fill="black"/><path d="M13.0063 10.6609H12.6577V11.0095H13.0063V10.6609Z" fill="black"/><path d="M18.8006 16.2722L17.5967 15.1992C17.4737 15.0895 17.2881 15.0896 17.1651 15.1991L15.9612 16.2721C15.8921 16.3336 15.8527 16.4218 15.8527 16.5143V18.369C15.8527 18.5481 15.9979 18.6934 16.177 18.6934H18.5847C18.7638 18.6934 18.9091 18.5481 18.9091 18.369V16.5143C18.9091 16.4218 18.8696 16.3337 18.8006 16.2722Z" fill="black"/><path d="M16.6762 14.48C16.5686 14.5876 16.5686 14.7622 16.6762 14.8699C16.7839 14.9776 16.9584 14.9776 17.0662 14.8699C17.2396 14.6963 17.5221 14.6963 17.6955 14.8699C17.7494 14.9237 17.82 14.9507 17.8906 14.9507C17.9611 14.9507 18.0317 14.9237 18.0856 14.8699C18.1932 14.7622 18.1932 14.5876 18.0856 14.48C17.6969 14.0915 17.0648 14.0915 16.6762 14.48Z" fill="black"/><path d="M16.1157 13.8529C16.008 13.9606 16.008 14.1352 16.1157 14.2429C16.2233 14.3505 16.3979 14.3505 16.5056 14.2428C16.7394 14.0091 17.0504 13.8802 17.381 13.8802C17.7117 13.8802 18.0226 14.009 18.2564 14.2428C18.3103 14.2966 18.3808 14.3236 18.4513 14.3236C18.5219 14.3236 18.5925 14.2966 18.6463 14.2429C18.754 14.1352 18.754 13.9606 18.6463 13.8529C18.3084 13.5149 17.859 13.3287 17.381 13.3287C16.903 13.3287 16.4537 13.5149 16.1157 13.8529Z" fill="black"/><path d="M15.1066 10.7176H16.9231V12.5341C16.9231 12.7132 17.0684 12.8585 17.2475 12.8585C17.4267 12.8585 17.5719 12.7132 17.5719 12.5341V10.3932C17.5719 10.2141 17.4267 10.0688 17.2475 10.0688H15.1066C14.9275 10.0688 14.7822 10.2141 14.7822 10.3932C14.7823 10.5724 14.9275 10.7176 15.1066 10.7176Z" fill="black"/><path d="M15.1066 17.7889H13.2901V17.0429C13.2901 16.8637 13.1449 16.7185 12.9658 16.7185C12.7866 16.7185 12.6414 16.8637 12.6414 17.0429V18.1133C12.6414 18.2924 12.7866 18.4377 12.9658 18.4377H15.1066C15.2857 18.4377 15.431 18.2924 15.431 18.1133C15.4309 17.9342 15.2857 17.7889 15.1066 17.7889Z" fill="black"/></svg>',
});

const Manage = new App.Modules.Manage();

