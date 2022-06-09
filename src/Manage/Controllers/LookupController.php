<?php


namespace App\Modules\Manage\Controllers;


use Colibri\App;
use Colibri\IO\FileSystem\File;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;
use Colibri\Common\DateHelper;
use App\Modules\Manage\Models\Fields\RemoteFileField;
use Colibri\Data\Storages\Storages;
use Colibri\Data\Storages\Models\DataTable;
use Colibri\Data\DataAccessPoint;

class LookupController extends WebController
{

    
    public function Get(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        
        $lookup = $post->lookup;
        $term = $post->term;
        if(isset($lookup['storage'])) {
            $storageLookup = $lookup['storage'];
            $storageName = $storageLookup['name'];
            $titleField = $storageLookup['title'] ?? 'title';
            $valueField = $storageLookup['value'] ?? 'value';

            $storage = Storages::Create()->Load($storageName);
            if(!$storage) {
                return $this->Finish(404, 'Not found');
            }

            $filter = '';
            $params = ['type' => DataAccessPoint::QueryTypeBigData, 'page' => 1, 'pagesize' => 1000];
            if($term) {
                $filter = ' where {'.$titleField.'} like [[term:string]]';
                $params['params'] = ['term' => '%'.$term.'%'];
            }
            $dataTable = DataTable::LoadByQuery($storage, 'select * from '.$storage->name.$filter, $params);

            $ret = [];
            foreach($dataTable as $row) {
                $ret[] = [$titleField => $row->$titleField, $valueField => $row->$valueField];
            }
        }

        return $this->Finish(200, 'ok', $ret);

    }

}
