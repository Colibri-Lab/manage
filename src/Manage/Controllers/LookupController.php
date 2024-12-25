<?php

namespace App\Modules\Manage\Controllers;

use Colibri\Common\StringHelper;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;
use Colibri\App;
use Colibri\Data\Storages\Storages;
use Colibri\Data\DataAccessPoint;
use Colibri\Data\Models\DataRow;
use Colibri\Data\Models\DataTable;

/**
 * Lookup data controller
 */
class LookupController extends WebController
{

    public function __construct(string|null $type = null)
    {
        parent::__construct($type);
        $this->_cache = true;
        $this->_lifetime = 600;
    }

    protected static function _replaceFields(string $value, string $table, DataAccessPoint $point): string
    {
        $res = preg_match_all('/\{([^\}]+)\}/', $value, $matches, \PREG_SET_ORDER);
        if ($res > 0) {
            foreach ($matches as $match) {
                if(preg_match('/[\s\":;]/', $match[0]) === 0) {
                    $value = str_replace(
                        $match[0],
                        $point->symbol . $table . '_' . $match[1] . $point->symbol,
                        $value
                    );
                }
            }
        }
        return $value;
    }

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
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $ret = [];
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
            $limit = $storageLookup['limit'] ?? null;
            $orderField = strstr(($storageLookup['order'] ?: $titleField), '{') === false ? '{' . ($storageLookup['order'] ?: $titleField) . '}' : ($storageLookup['order'] ?? $titleField);

            $storage = Storages::Create()->Load($storageName);
            if (!$storage) {
                return $this->Finish(404, 'Not found');
            }

            [$tableClass, $rowClass] = $storage->GetModelClasses();

            $filters = [];
           if ($dependsField && $paramField) {
                $filters[$dependsField] = $paramField;
            }
            $orderField = str_replace('{', '', $orderField);
            $orderField = str_replace('}', '', $orderField);
            $dataTable = $tableClass::LoadBy($limit ? 1 : -1, $limit ?: 1000, $term, $filters, $orderField, 'asc');
            if (!$dataTable) {
                $ret = [];
            } else {
                foreach ($dataTable as $row) {
                    if($selectField === '*') {
                        $ret[] = $row->ToArray(true);
                    } else {
                        $r = [$titleField => $row->$titleField, $valueField => $row->$valueField];
                        if ($groupField) {
                            $r[$groupField] = $row->$groupField;
                        }
                        $ret[] = $r;
                    }
                }
            }
        } elseif (isset($lookup['accesspoint'])) {

            $pointData = $lookup['accesspoint'];
            $point = App::$dataAccessPoints->Get($pointData['point']);
            $table = $pointData['table'];
            $fields = $pointData['fields'];
            $filter = $pointData['filter'];
            $order = $pointData['order'];
            $limit = $pointData['limit'];

            $sqlQuery = $point->CreateQuery('CreateSelect', [$table, $fields, $filter, $order]);
            $sqlQuery = self::_replaceFields($sqlQuery, $table, $point);
            $reader = $point->Query($sqlQuery, ['type' => DataAccessPoint::QueryTypeBigData, 'page' => 1, 'pagesize' => $limit ?: 1000]);
            $t = new DataTable($point, $reader);
            foreach($t as $d) {
                $ret[] = $d->ToArray(true);
            }

        }

        return $this->Finish(200, 'ok', $ret);

    }

}