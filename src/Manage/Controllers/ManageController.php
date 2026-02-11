<?php

namespace App\Modules\Manage\Controllers;

use Colibri\App;
use App\Modules\Manage\Module;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use Colibri\Web\RequestCollection;
use InvalidArgumentException;

/**
 * Manage main controller
 * @author self
 * @package App\Modules\Manage\Controllers
 */
class ManageController extends WebController
{

    /**
     * Manage settings
     * @param RequestCollection $get данные GET
     * @param RequestCollection $post данные POST
     * @param mixed $payload данные payload обьекта переданного через POST/PUT
     * @return object
     */
    public function Settings(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload = null): object
    {

        $result = [];
        $message = 'Result message';
        $code = 200;
            
        return $this->Finish(
            $code,
            $message,
            Module::Instance()->GetSettings(),
            'utf-8'
        );

    }


    
}