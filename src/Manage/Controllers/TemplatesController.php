<?php


namespace App\Modules\Manage\Controllers;

use Colibri\App;
use Colibri\Exceptions\PermissionDeniedException;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\PayloadCopy;
use App\Modules\Security\Module as SecurityModule;
use Colibri\IO\FileSystem\Finder;
use Colibri\IO\FileSystem\Directory;
use Colibri\Web\Templates\PhpTemplate;

/**
 * Templates controller
 */
class TemplatesController extends WebController
{

    /**
     * Returns a templates config
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

        $finder = new Finder();
        $ret = [];
        foreach (App::$moduleManager->list as $name => $module) {
            $path = $module->modulePath . 'templates/web/';
            if (Directory::Exists($path)) {
                $files = $finder->FilesRecursive($path, '/.*\.php/');
                $ff = [];
                foreach ($files as $file) {
                    if (strstr($file->path, '/snippets') !== false) {
                        continue;
                    }
                    $f = $file->ToArray();
                    $f['path'] = str_replace($path, '', $f['path']);
                    $f['path'] = str_replace('.php', '', $f['path']);
                    $ff[] = $f;
                }
                $ret[$name] = $ff;
            }
        }

        return $this->Finish(200, 'ok', $ret);

    }

    /**
     * Returns a snippets from project
     * @param RequestCollection $get
     * @param RequestCollection $post
     * @param PayloadCopy|null $payload
     * @return object
     */
    public function Snippets(RequestCollection $get, RequestCollection $post, ? PayloadCopy $payload): object
    {
        if (!SecurityModule::$instance->current) {
            throw new PermissionDeniedException('Permission denied', 403);
        }

        $finder = new Finder();
        $ret = [];
        foreach (App::$moduleManager->list as $name => $module) {
            $path = $module->modulePath . 'templates/web/snippets/';
            if (Directory::Exists($path)) {
                $files = $finder->FilesRecursive($path, '/.*\.php/');
                $ff = [];
                foreach ($files as $file) {
                    $template = new PhpTemplate(str_replace('.php', '', $file->path));
                    $content = $template->Render(['params' => true]);
                    $params = json_decode($content);
                    $ff[] = ['text' => $file->filename, 'name' => $file->filename, 'options' => $params->options, 'fields' => $params->params];
                }
                $ret[$name] = $ff;
            }
        }

        return $this->Finish(200, 'ok', $ret);

    }


}