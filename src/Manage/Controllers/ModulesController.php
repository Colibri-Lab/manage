<?php

namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;

/**
 * Modules controller
 */
class ModulesController extends WebController
{

    /**
     * Returns a modules config
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function Config(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {

        if (!SecurityModule::Instance()->current) {
            throw new PermissionDeniedException('Permission denied', 403);
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