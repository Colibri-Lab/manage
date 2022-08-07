<?php


namespace App\Modules\Manage\Controllers;


use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use Colibri\Data\Storages\Storages;
use App\Modules\Security\Module as SecurityModule;

class StoragesController extends WebController
{

    
    public function Config(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $result = [];
        $storages = Storages::Create();
        $list = $storages->GetStorages();
        foreach($list as $name => $storage) {
            $result[$name] = $storage->ToArray();
        }
        
        return $this->Finish(200, 'ok', $result);
        
    }

}
