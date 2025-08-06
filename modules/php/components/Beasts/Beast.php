<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;

class Beast extends BeastManager
{
    public int $id;
    public string $label;
    public int $space_id;
    public int $card_id;

    public function __construct(Game $game, int $domain_id)
    {
        parent::__construct($game);
        $this->id = $domain_id;

        $card = $this->game->getObjectFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} WHERE card_type_arg={$domain_id}");
        $this->space_id = (int) $card["type"];
        $this->card_id = (int) $card["id"];

        $info = $this->BEASTS[$domain_id];
        $this->label = $info["label"];
    }

    public function gainFavor(int $player_id): void
    {
        $Notif = new NotifManager($this->game);
        $Notif->all(
            "gainFavor",
            clienttranslate('${player_name} gains the favor of the ${beast_label}'),
            [
                "i18n" => ["beast_label"],
                "beast_label" => $this->label,
            ],
            $player_id,
        );
    }
}
