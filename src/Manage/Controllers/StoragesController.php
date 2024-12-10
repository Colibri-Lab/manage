<?php


namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use Colibri\Data\Storages\Storages;
use App\Modules\Security\Module as SecurityModule;

/**
 * Storages controller
 */
class StoragesController extends WebController
{

    /**
     * Translates a field config
     * @param mixed $fields
     * @return mixed
     */
    private function _convertFields($fields)
    {
        /** @var \App\Modules\Lang\Module $langModule */
        $langModule = App::$moduleManager->Get('lang');

        foreach ($fields as $fieldName => $fieldArray) {

            if (isset($fieldArray['desc']) && is_string($fieldArray['desc']) && strstr($fieldArray['desc'], '#{') !== false) {
                // надо сконвертить
                $keys = $langModule->ParseAndGetKeys($fieldArray['desc']);
                $fieldArray['desc'] = $langModule->GetAsObject($keys[0]);
            }
            if (isset($fieldArray['group']) && is_string($fieldArray['group']) && strstr($fieldArray['group'], '#{') !== false) {
                // надо сконвертить
                $keys = $langModule->ParseAndGetKeys($fieldArray['group']);
                $fieldArray['group'] = $langModule->GetAsObject($keys[0]);
            }
            if (isset($fieldArray['note']) && is_string($fieldArray['note']) && strstr($fieldArray['note'], '#{') !== false) {
                // надо сконвертить
                $keys = $langModule->ParseAndGetKeys($fieldArray['note']);
                $fieldArray['note'] = $langModule->GetAsObject($keys[0]);
            }
            if (isset($fieldArray['values']) && is_array($fieldArray['values'])) {
                foreach ($fieldArray['values'] as $index => $val) {

                    if (!isset($val['type'])) {
                        $val['type'] = is_string($val['title']) ? 'text' : 'number';
                    }

                    if ($val['type'] === 'text' && isset($val['title']) && is_string($val['title']) && strstr($val['title'], '#{') !== false) {
                        // надо сконвертить
                        $keys = $langModule->ParseAndGetKeys($val['title']);
                        $val['title'] = $langModule->GetAsObject($keys[0]);
                    }

                    $fieldArray['values'][$index] = $val;
                }
            }

            if (isset($fieldArray['params']) && isset($fieldArray['params']['addlink']) && is_string($fieldArray['params']['addlink']) && strstr($fieldArray['params']['addlink'], '#{') !== false) {
                $keys = $langModule->ParseAndGetKeys($fieldArray['params']['addlink']);
                $fieldArray['params']['addlink'] = $langModule->GetAsObject($keys[0]);
            }

            if (isset($fieldArray['fields']) && is_array($fieldArray['fields']) && !empty($fieldArray['fields'])) {
                $fieldArray['fields'] = $this->_convertFields($fieldArray['fields']);
            }

            $fields[$fieldName] = $fieldArray;
        }
        return $fields;
    }

    /**
     * Returns a configuration of storages
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function Config(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {
        /** @var \App\Modules\Lang\Module $langModule */
        $langModule = App::$moduleManager->Get('lang');

        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $result = [];
        $storages = Storages::Create();
        $list = $storages->GetStorages();
        foreach ($list as $name => $storage) {
            $storageArray = $storage->ToArray();
            if ($langModule) {
                if (isset($storageArray['desc']) && is_string($storageArray['desc']) && strstr($storageArray['desc'], '#{') !== false) {
                    // надо сконвертить
                    $keys = $langModule->ParseAndGetKeys($storageArray['desc']);
                    $storageArray['desc'] = $langModule->GetAsObject($keys[0]);
                }
                if (isset($storageArray['group']) && is_string($storageArray['group']) && strstr($storageArray['group'], '#{') !== false) {
                    // надо сконвертить
                    $keys = $langModule->ParseAndGetKeys($storageArray['group']);
                    $storageArray['group'] = $langModule->GetAsObject($keys[0]);
                }

                $storageArray['fields'] = $this->_convertFields($storageArray['fields']);

            }
            $storageArray['dbms'] = $storage->accessPoint->dbms;
            $storageArray['allowedTypes'] = $storage->accessPoint->allowedTypes;
            $storageArray['hasIndexes'] = $storage->accessPoint->hasIndexes;
            $storageArray['fieldsHasPrefix'] = $storage->accessPoint->fieldsHasPrefix;
            $result[$name] = $storageArray;
        }

        return $this->Finish(200, 'ok', $result);

    }

}