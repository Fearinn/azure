<?php

namespace Bga\Games\Azure\components\Stones;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;

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

    public function countBySpace(int $space_id): int
    {
        return $this->deck->countCardsInLocation("realm", $space_id);
    }

    public function place(int $player_id, int $x, int $y): void
    {
        $Space = new Space($this->game, $x, $y);
        $space_id = $Space->id;

        $card_id = $this->game->getUniqueValueFromDB("SELECT card_id FROM {$this->dbTable} WHERE card_location='hand' AND card_type_arg={$player_id} LIMIT 1");
        $this->deck->moveCard($card_id, "realm", $space_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "placeStone",
            clienttranslate('${player_name} places a stone at (${x}, ${y})'),
            [
                "x" => $x,
                "y" => $y,
                "space_id" => $space_id,
                "card" => $this->deck->getCard($card_id),
            ],
            $player_id
        );
    }

    public function getPlaced(): array
    {
        $placedStones = $this->deck->getCardsInLocation("realm");
        return array_values($placedStones);
    }
}
