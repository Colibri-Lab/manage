<?php


namespace App\Modules\Manage\Controllers;


use Colibri\App;
use Colibri\Events\EventsContainer;
use Colibri\Exceptions\PermissionDeniedException;
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
use Colibri\Data\DataAccessPoint;
use App\Modules\Security\Module as SecurityModule;

/**
 * Datapoint access controller
 */
class DataPointsController extends WebController
{

    /**
     * Returns an access points
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function Config(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {
        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $result = [];
        foreach (App::$dataAccessPoints->accessPoints->points as $name => $point) {
            /** @var $point DataAccessPoint */
            $result[$name] = $point;
        }

        return $this->Finish(200, 'ok', $result);

    }

}