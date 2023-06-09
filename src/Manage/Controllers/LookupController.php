<?php

namespace App\Modules\Manage\Controllers;

use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Models\DataTable;
use Colibri\Data\DataAccessPoint;

/**
 * Lookup data controller
 */
class LookupController extends WebController
{

    /**
     * Returns a looked up data
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function Get(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {
        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }


        $lookup = $post->{'lookup'};
        $term = $post->{'term'};
        $paramField = $post->{'param'};
        if (isset($lookup['storage'])) {
            $storageLookup = $lookup['storage'];
            $storageName = $storageLookup['name'];
            $selectField = $storageLookup['select'] ?? '*';
            $titleField = $storageLookup['title'] ?? 'title';
            $valueField = $storageLookup['value'] ?? 'value';
            $groupField = $storageLookup['group'] ?? null;
            $dependsField = $storageLookup['depends'] ?? null;
            $orderField = strstr(($storageLookup['order'] ?: $titleField), '{') === false ? '{' . ($storageLookup['order'] ?: $titleField) . '}' : ($storageLookup['order'] ?? $titleField);

            $storage = Storages::Create()->Load($storageName);
            if (!$storage) {
                return $this->Finish(404, 'Not found');
            }

            $filter = [];
            $params = ['type' => DataAccessPoint::QueryTypeBigData, 'page' => 1, 'pagesize' => 1000, 'params' => []];
            if ($term) {
                $filter[] = '{' . $titleField . '} like [[term:string]]';
                $params['params']['term'] = '%' . $term . '%';
            }
            if ($dependsField && $paramField) {
                $filter[] = '{' . $dependsField . '}=[[depends:string]]';
                $params['params']['depends'] = $paramField;
            }
            $filter = !empty($filter) ? ' where ' . implode(' and ', $filter) : '';
            $dataTable = DataTable::LoadByQuery($storage, 'select ' . $selectField . ' from ' . $storage->table . $filter . ' order by ' . $orderField, $params);
            if (!$dataTable) {
                $ret = [];
            } else {
                $ret = [];
                foreach ($dataTable as $row) {
                    $r = [$titleField => $row->$titleField, $valueField => $row->$valueField];
                    if ($groupField) {
                        $r[$groupField] = $row->$groupField;
                    }
                    $ret[] = $r;
                }
            }
        }

        return $this->Finish(200, 'ok', $ret);

    }

}