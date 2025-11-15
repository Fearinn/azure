<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\stats\StatManager;

class StEndScore extends StateManager
{
    private QiManager $qiManager;
    private StatManager $statManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->qiManager = new QiManager($game);
        $this->statManager = new StatManager($game);
    }

    public function act(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        $this->statManager->initEndExclusive();

        foreach ($players as $player_id => $player) {
            $handCount = $this->qiManager->getHandCount($player_id);
            $this->statManager->inc($player_id, STAT_REMAINING_QI, $handCount);
        }

        $this->game->gamestate->nextState();
    }
}
