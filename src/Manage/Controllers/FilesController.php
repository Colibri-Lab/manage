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

class FilesController extends WebController
{

    
    public function ByGuid(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $storage = $post->storage;
        $field = $post->field;
        $guid = $post->guid;

        if(!$storage || !$field || !$guid) {
            return $this->Finish(400, 'Bad request', []);
        }

        $storage = Storages::Create()->Load($storage);
        $field = $storage->GetField($field);
        $params = $field->params;
    
        $remote = $params['remote'];
        $className = $remote['class'] ?? null;
        if(!$className) {
            return $this->Finish(400, 'Bad request', []);
        }

        $args = $remote['args'];
        $method1 = $remote['method'][0];

        $reflectionClass = new ReflectionClass($className);
        if(!$reflectionClass->hasMethod($method1)) {
            return $this->Finish(400, 'Bad request', []);
        }

        $classInstance = $reflectionClass->newInstanceArgs($args);
        try {
            $data = $classInstance->$method1($guid);
        }
        catch(\Throwable $e) {
            return $this->Finish(404, 'File not found', []);
        }

        return $this->Finish(200, 'file.stream', base64_encode($data));
    }

}
