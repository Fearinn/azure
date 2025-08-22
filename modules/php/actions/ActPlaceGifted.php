<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Gifted\GiftedManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;
use Bga\Games\Azure\stats\StatManager;

class ActPlaceGifted extends ActionManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function act(int $x, int $y): void
    {
        $GiftedManager = new GiftedManager($this->game);
        $Space = new Space($this->game, $x, $y);
        $this->validate($Space, $GiftedManager);

        $domain_id = $Space->domain_id;

        $StoneManager = new StoneManager($this->game);
        $StoneManager->placeGifted($this->player_id, $x, $y);

        $extraCost = $GiftedManager->getExtraCost();
        $cost = $Space->getCost($this->player_id, $extraCost);

        $QiManager = new QiManager($this->game);
        $QiManager->discardByDomain($this->player_id, $cost, $domain_id);

        $Space->gatherBoons($this->player_id);

        $discount = $Space->baseCost + $extraCost - $cost;
        $StatManager = new StatManager($this->game);
        $StatManager->inc($this->player_id, STAT_DISCOUNTS_GAINED, $discount);

        $ScoreManager = new ScoreManager($this->game);
        if ($ScoreManager->getHigherScore() === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }

        $this->game->gamestate->nextState(TR_CHECK_BEASTS);
    }

    public function validate(
        Space $Space,
        GiftedManager $GiftedManager
    ): void {
        if (!$GiftedManager->canPlay($this->player_id)) {
            throw new \BgaVisibleSystemException("You can't place a gifted stone");
        }

        $extraCost = $GiftedManager->getExtraCost();

        if (!$Space->isSelectable(
            $this->player_id,
            $extraCost
        )) {
            throw new \BgaVisibleSystemException("space unavailable");
        }
    }
}
