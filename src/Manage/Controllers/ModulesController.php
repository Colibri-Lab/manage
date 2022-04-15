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
use Colibri\Utils\Config\Config;
use Colibri\Utils\Config\ConfigException;
use App\Modules\Security\Module as SecurityModule;

class ModulesController extends WebController
{

    
    public function Config(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {

        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }
        
        $result = [];
        foreach(App::$moduleManager->list as $module) {
            $config = $module->Config()->AsObject();
            if(!$config || !isset($config->visible)) {
                continue;
            }
            $result[] = (object)[
                'name' => $module->Config()->Query('name')->GetValue(), 
                'desc' => $module->Config()->Query('desc')->GetValue(), 
                'config' => $module->moduleConfigPath,
                'storages' => $module->moduleStoragesPath,
            ];
        }
        
        return $this->Finish(200, 'ok', $result);
        
    }

}
