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


    public function Config(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $result = [];
        foreach (App::$moduleManager->list as $module) {
            $config = $module->Config()->AsObject();
            if (!($config->visible ?? true)) {
                continue;
            }
            $result[] = (object) [
                'name' => $config->name,
                'desc' => $config->desc ?? '',
                'config' => $module->moduleConfigPath,
                'storages' => $module->moduleStoragesPath,
                'visible' => $config->visible ?? true
            ];
        }

        return $this->Finish(200, 'ok', $result);

    }

}