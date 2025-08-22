<?php

namespace Bga\Games\Azure\components\Stones;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\notifications\NotifManager;
use Bga\Games\Azure\stats\StatManager;

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
            $stone_cards[] = ["type" => "common", "type_arg" => $player_id, "nbr" => 14];
        }

        $this->deck->createCards($stone_cards, "deck");

        foreach ($players as $player_id => $player) {
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='hand', card_location_arg={$player_id} 
            WHERE card_location='deck' AND card_type_arg={$player_id}");
        }

        $this->setupGifted();
    }

    public function checkBySpace(
        int $space_id,
        int $player_id = null
    ): bool {
        $sql = "SELECT COUNT(card_id) FROM {$this->dbTable} WHERE card_location='realm' AND card_location_arg={$space_id}";

        if ($player_id) {
            $sql .= " AND card_type_arg={$player_id}";
        }
        $count = $this->game->getUniqueValueFromDB($sql);

        return $count > 0;
    }

    public function place(
        int $player_id,
        int $x,
        int $y
    ): void {
        $Space = new Space($this->game, $x, $y);
        $space_id = $Space->id;

        $card_id = $this->game->getUniqueValueFromDB("SELECT card_id FROM {$this->dbTable} 
        WHERE card_location='hand' AND card_type_arg={$player_id} LIMIT 1");

        $this->deck->moveCard($card_id, "realm", $space_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "placeStone",
            clienttranslate('${player_name} places a common stone (${x}, ${y}) ${space_icon}'),
            [
                "preserve" => ["space_id"],
                "space_icon" => "",
                "x" => $x,
                "y" => $y,
                "space_id" => $space_id,
                "card" => $this->deck->getCard($card_id),

            ],
            $player_id
        );

        $StatManager = new StatManager($this->game);
        $StatManager->inc($player_id, STAT_STONES_PLACED);
    }

    public function remove(
        int $player_id,
        int $space_id
    ): void {
        $SpaceManager = new SpaceManager($this->game, $space_id);
        $Space = $SpaceManager->getById($space_id);

        $card_id = $this->game->getUniqueValueFromDB("SELECT card_id FROM {$this->dbTable} 
        WHERE card_location='realm' AND card_location_arg={$space_id} AND card_type_arg={$player_id} LIMIT 1");

        $this->deck->moveCard($card_id, "hand", $player_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "removeStone",
            clienttranslate('${player_name} removes a stone (${x}, ${y}) ${space_icon}'),
            [
                "preserve" => ["space_id"],
                "space_icon" => "",
                "x" => $Space->x,
                "y" => $Space->y,
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

    private function setupGifted(): void
    {
        $GiftedManager = new GiftedManager($this->game);
        if (!$GiftedManager->isEnabled()) {
            return;
        }

        $cards = [];
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $cards[] = ["type" => "gifted", "type_arg" => $player_id, "nbr" => 1];
        }

        $this->deck->createCards($cards, "deck");

        foreach ($players as $player_id => $player) {
            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='gifted', card_location_arg={$player_id} 
            WHERE card_location='deck' AND card_type_arg={$player_id}");
        }
    }

    public function getGifted(): array
    {
        $cards = $this->deck->getCardsOfType("gifted");
        return array_values($cards);
    }

    public function canPlayGifted(int $player_id): bool
    {
        return $this->deck->countCardsInLocation("gifted", $player_id) > 0;
    }

    public function placeGifted(
        int $player_id,
        int $x,
        int $y
    ): void {
        $Space = new Space($this->game, $x, $y);
        $space_id = $Space->id;

        $card_id = $this->game->getUniqueValueFromDB("SELECT card_id FROM {$this->dbTable} 
        WHERE card_location='gifted' AND card_type='gifted' AND card_type_arg={$player_id} LIMIT 1");

        $this->deck->moveCard($card_id, "realm", $space_id);

        $Notify = new NotifManager($this->game);
        $Notify->all(
            "placeStone",
            clienttranslate('${player_name} places a gifted stone (${x}, ${y}) ${space_icon}'),
            [
                "preserve" => ["space_id"],
                "space_icon" => "",
                "x" => $x,
                "y" => $y,
                "space_id" => $space_id,
                "card" => $this->deck->getCard($card_id),
            ],
            $player_id
        );

        $StatManager = new StatManager($this->game);
        $StatManager->inc($player_id, STAT_STONES_PLACED);
    }
}
