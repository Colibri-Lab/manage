<?php


/**
 * Backend manage module package
 *
 * @author Author Name <author.name@action-media.ru>
 * @copyright 2019 Colibri
 * @package App\Modules\Manage
 */
namespace App\Modules\Manage;

use Colibri\App;
use Colibri\Modules\Module as BaseModule;
use Colibri\Utils\Debug;
use Colibri\Utils\Menu\Item;
use Colibri\Events\EventsContainer;
use Colibri\IO\FileSystem\File;
use Colibri\Common\NoLangHelper;
use Colibri\Utils\Logs\Logger;
use OpenAI;
use OpenAI\Client;

/**
 * Backend manage module
 * @package App\Modules\Manage
 */
class Module extends BaseModule
{


    /**
     * Initializes the module
     * @return void
     */
    public function InitializeModule(): void
    {

        App::Instance()->HandleEvent(EventsContainer::BundleFile, function ($event, $args) {
            $file = new File($args->file);
            if (in_array($file->extension, ['html', 'js'])) {
                // компилируем html в javascript
                $args->content = NoLangHelper::ParseString($args->content);
            }
            return true;
        });

    }

    /**
     * Returns a topmost menu for backend
     */
    public function GetTopmostMenu(): Item|array |null
    {

        return null;

    }

    /**
     * Returns a permissions for module
     * @return array
     */
    public function GetPermissions(): array
    {

        $permissions = parent::GetPermissions();

        $permissions['manage'] = '#{manage-permissions}';

        return $permissions;
    }

    /**
     * Backups module data
     * @param Logger $logger
     * @param string $path
     * @return void
     */
    public function Backup(Logger $logger, string $path)
    {
        // Do nothing        
    }

    public function translateMultiLang(string $openaiApiKey, string $text, $language) {
        $client = OpenAI::client($openaiApiKey);
        
        // Преобразуем язык(и) в строку через запятую
        if (is_array($language)) {
            $languages = implode(',', $language);
        } else {
            $languages = $language;
        }

        try {
            $response = $client->chat()->create([
                'model' => 'gpt-5',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful translator.'],
                    ['role' => 'user', 'content' =>
                        "Translate {$text} to language {$languages}. Answer in JSON format, where key is the language, value is a translation. " .
                        "For example: {\"en\": \"...\", \"hy\": \"...\"}."
                    ]
                ],
            ]);

            $content = $response->choices[0]->message->content;

            return json_decode($content, true);
        } catch (Exception $e) {
            // Логируем ошибку
            error_log('Error during translation: ' . $e->getMessage());
            return null;
        }
    }
    
}