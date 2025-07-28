<?php

namespace Bga\Games\Azure\components;

use Bga\GameFramework\Components\Deck;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class CardManager extends Subclass
{
    public readonly Deck $deck;
    public readonly string $dbTable;

    public function __construct(
        Game $game,
        Deck $deck,
        string $dbTable
    ) {
        parent::__construct($game);
        $this->deck = $deck;
        $this->dbTable = $dbTable;
    }

    public function getHand(int $player_id): array
    {
        $hand = $this->deck->getPlayerHand($player_id);
        return array_values($hand);
    }

    public function getHandCount(int $player_id): int
    {
        return $this->deck->countCardsInLocation("hand", $player_id);
    }

    public function getHandsCounts(): array
    {
        $handsCounts = [];
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $handsCounts[$player_id] = $this->deck->countCardsInLocation("hand", $player_id);
        }

        return $handsCounts;
    }
}
