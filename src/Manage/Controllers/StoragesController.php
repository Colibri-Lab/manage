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

class StoragesController extends WebController
{

    
    public function Config(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {

        $result = [];
        $storages = Storages::Create();
        $list = $storages->GetStorages();
        foreach($list as $name => $storage) {
            $result[$name] = $storage->ToArray();
        }
        
        return $this->Finish(200, 'ok', $result);
        
    }

}
