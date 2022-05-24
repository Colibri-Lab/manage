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
use Colibri\IO\FileSystem\Finder;
use Colibri\IO\FileSystem\Directory;
use Colibri\Web\Templates\PhpTemplate;

class TemplatesController extends WebController
{

    
    public function Config(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }
        
        $finder = new Finder();
        $ret = [];
        foreach(App::$moduleManager->list as $name => $module) {
            $path = $module->modulePath.'templates/web/';
            if(Directory::Exists($path)) {
                $files = $finder->FilesRecursive($path, '/.*\.php/');
                $ff = [];
                foreach($files as $file) {
                    if(strstr($file->path, '/snippets') !== false) {
                        continue;
                    }
                    $f = $file->ToArray();
                    $f['path'] = str_replace($path, '', $f['path']);
                    $f['path'] = str_replace('.php', '', $f['path']);
                    $ff[] = $f;
                }
                $ret[$name]  = $ff;
            }
        }
        
        return $this->Finish(200, 'ok', $ret);

    }

    public function Snippets(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }
        
        $finder = new Finder();
        $ret = [];
        foreach(App::$moduleManager->list as $name => $module) {
            $path = $module->modulePath.'templates/web/snippets/';
            if(Directory::Exists($path)) {
                $files = $finder->FilesRecursive($path, '/.*\.php/');
                $ff = [];
                foreach($files as $file) {
                    $template = new PhpTemplate(str_replace('.php', '', $file->path));
                    $content = $template->Render(['params' => true]);
                    $params = json_decode($content);
                    $ff[] = ['text' => $file->filename, 'name' => $file->filename, 'options' => $params->options, 'fields' => $params->params];
                }
                $ret[$name]  = $ff;
            }
        }
        
        return $this->Finish(200, 'ok', $ret);

    }


}
