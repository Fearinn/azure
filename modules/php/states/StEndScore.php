<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\stats\StatManager;

class StEndScore extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        $QiManager = new QiManager($this->game);
        $StatManager = new StatManager($this->game);
        foreach ($players as $player_id => $player) {
            $handCount = $QiManager->getHandCount($player_id);
            $StatManager->initEndExclusive();
            $StatManager->inc($player_id, STAT_REMAINING_QI, $handCount);
        }

        $this->game->gamestate->nextState();
    }
}
