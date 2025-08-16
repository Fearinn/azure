<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\stats\StatManager;

class ActPlaceStone extends ActionManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(int $x, int $y): void
    {
        $Space = new Space($this->game, $x, $y);
        $this->validate($Space);

        $domain_id = $Space->domain_id;

        $StoneManager = new StoneManager($this->game);
        $StoneManager->place($this->player_id, $x, $y);

        $cost = $Space->getCost($this->player_id);
        $QiManager = new QiManager($this->game);
        $QiManager->discardByDomain($this->player_id, $cost, $domain_id);

        $Space->gatherBoons($this->player_id);

        $discount = $Space->baseCost - $cost;
        $StatManager = new StatManager($this->game);
        $StatManager->inc($this->player_id, STAT_DISCOUNTS_GAINED, $discount);

        $ScoreManager = new ScoreManager($this->game);
        if ($ScoreManager->getHigherScore() === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }

        $this->game->gamestate->nextState(TR_CHECK_BEASTS);
    }

    public function validate(Space $Space): void
    {
        if (!$Space->isSelectable($this->player_id)) {
            throw new \BgaVisibleSystemException("space unavailable");
        }
    }
}
