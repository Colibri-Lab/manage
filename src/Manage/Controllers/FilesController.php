<?php


namespace App\Modules\Manage\Controllers;


use Colibri\App;
use Colibri\Events\EventsContainer;
use Colibri\IO\FileSystem\File;
use Colibri\Utils\Cache\Bundle;
use Colibri\Utils\Debug;
use Colibri\Utils\ExtendedObject;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\Templates\PhpTemplate;
use Colibri\Web\View;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\OutputStyle;
use Colibri\Web\PayloadCopy;
use Colibri\Data\Storages\Storages;
use ReflectionClass;
use App\Modules\Security\Module as SecurityModule;
use FileServerApiClient\Client;
use FileServerApiClient\AdminClient;
use Colibri\Common\MimeType;
use Colibri\Common\DateHelper;
use App\Modules\Manage\Models\Fields\RemoteFileField;

class FilesController extends WebController
{

    
    public function ByGuid(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $bucket = $get->bucket;
        $guid = $get->guid;
        $type = $get->type;

        $file = new RemoteFileField(['bucket' => $bucket, 'guid' => $guid, 'ext' => $type]);
        $path = $file->Source();
        if(!$path) {
            return $this->Finish(404, 'File not exists');
        }
        return $this->Finish(200, $file->name, File::Read(App::$webRoot.$path), 'utf-8', ['Cache-Control' => 'Public', 'Expires' => DateHelper::ToDbString(time())]);

    }

}
