<?php


namespace App\Modules\Manage;

class Installer
{

    /**
     *
     * @param PackageEvent $event
     * @return void
     */
    public static function PostPackageInstall($event)
    {

        print_r('Установка и настройка модуля Colibri Manage Module'."\n");

        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir').'/';
        $configDir = './config/';

        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }

        $mode = 'dev';
        $appYamlContent = file_get_contents($configDir.'app.yaml');
        if(preg_match('/mode: (\w+)/', $appYamlContent, $matches) >=0 ) {
            $mode = $matches[1];
        }

        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;

        // копируем конфиг
        print_r('Копируем файл конфигурации'."\n");
        $configPath = $path.'/src/Manage/config-template/module-'.$mode.'.yaml';
        $configTargetPath = $configDir.'manage.yaml';
        if(file_exists($configTargetPath)) {
            print_r('Файл конфигурации найден, пропускаем настройку'."\n");
            return;
        }
        if($mode === 'local') {
            symlink($configPath, $configTargetPath);
        }
        else {
            copy($configPath, $configTargetPath);
        }

        // нужно прописать в модули
        $modulesTargetPath = $configDir.'modules.yaml';
        $modulesConfigContent = file_get_contents($modulesTargetPath);
        if(strstr($modulesConfigContent, '- name: Manage') !== false) {
            print_r('Модуль сконфигурирован, пропускаем'."\n");
            return;
        }

        $modulesConfigContent = $modulesConfigContent.'
  - name: Manage
    entry: \Manage\Module
    enabled: true
    config: include(/config/manage.yaml)';
        file_put_contents($modulesTargetPath, $modulesConfigContent);

        print_r('Установка скриптов'."\n");
        $scriptsPath = $path.'/src/Manage/bin/';
        $binDir = './bin/';

        if($mode === 'local') {
            symlink($scriptsPath.'manage-migrate.sh', $binDir.'manage-migrate.sh');
            symlink($scriptsPath.'manage-models-generate.sh', $binDir.'manage-models-generate.sh');
        }
        else {
            copy($scriptsPath.'manage-migrate.sh', $binDir.'manage-migrate.sh');
            copy($scriptsPath.'manage-models-generate.sh', $binDir.'manage-models-generate.sh');
        }
        print_r('Установка ресурсов'."\n");
        $resPath = $path.'/src/Manage/web/res/';
        $resDir = './web/res/';

        if($mode === 'local') {
            symlink($resPath.'/codemirror/', $resDir.'/codemirror/');
            symlink($resPath.'/tinymce/', $resDir.'/tinymce/');
        }
        else {
            shell_exec('cp -R '.$resPath.'/codemirror/ '.$resDir.'/codemirror/');
            shell_exec('cp -R '.$resPath.'/tinymce/ '.$resDir.'/tinymce/');
        }
        print_r('Установка завершена'."\n");

    }
}
