<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;

class StPlayerTurn extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function getArgs(): array
    {
        $player_id = (int) $this->game->getActivePlayerId();

        $SpaceManager = new SpaceManager($this->game);
        $selectableSpaces = $SpaceManager->getSelectable($player_id);

        $args = [
            "_private" => [
                "active" => ["selectableSpaces" => $selectableSpaces],
            ]
        ];

        return $args;
    }
}
