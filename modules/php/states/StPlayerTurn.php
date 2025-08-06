<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;

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

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();
        $args = $this->getArgs();

        if (!$args["_private"]["active"]["selectableSpaces"] || true) {
            $ScoreManager = new ScoreManager($this->game);
            $ScoreManager->setScore($player_id, -1);

            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }
    }
}
