<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Notif;
use Bga\Games\Azure\stats\StatManager;

class Beast extends BeastManager
{
    use Notif;
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
        $this->deck->moveCard($this->card_id, "favors", $player_id);

        $this->notifAll(
            "gainFavor",
            clienttranslate('${player_name} gains the favor of the ${beast_label}'),
            [
                "i18n" => ["beast_label"],
                "beast_label" => $this->label,
                "card" => $this->deck->getCard($this->card_id),
            ],
            $player_id,
        );

        $StatManager = new StatManager($this->game);
        $StatManager->inc($player_id, STAT_FAVORS_GAINED);
    }

    public function loseFavor(): void
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }


        $this->notifAll(
            "loseFavor",
            clienttranslate('${player_name} loses the favor of the ${beast_label}'),
            [
                "i18n" => ["beast_label"],
                "beast_label" => $this->label,
            ],
            $player_id,
        );
    }

    public function getFavoredPlayer(): int | null
    {
        $sql = "SELECT card_location_arg FROM {$this->dbTable} WHERE card_location='favors' AND card_id={$this->card_id}";
        $player_id = (int) $this->game->getUniqueValueFromDB($sql);
        return $player_id;
    }
}
