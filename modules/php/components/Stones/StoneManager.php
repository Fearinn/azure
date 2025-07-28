<?php

namespace Bga\Games\Azure\components\Stones;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\Game;

class StoneManager extends CardManager
{
    public function __construct(Game $game)
    {
        parent::__construct(
            $game,
            $game->stone_cards,
            "stone"
        );
    }

    public function setup(): void
    {
        $stone_cards = [];
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $stone_cards[] = ["type" => "", "type_arg" => $player_id, "nbr" => 14];
        }

        $this->deck->createCards($stone_cards, "deck");

        foreach ($players as $player_id => $player) {
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='hand', card_location_arg={$player_id} 
            WHERE card_location='deck' AND card_type_arg={$player_id}");
        }
    }
}
