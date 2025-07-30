<?php

namespace Bga\Games\Azure\actions;

use Bga\Games\Azure\actions\ActionManager;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;

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

        $QiManager = new QiManager($this->game);
        $QiManager->discard($this->player_id, $domain_id);
    }

    public function validate(Space $Space): void
    {
        if (!$Space->isAvailable($this->player_id)) {
            throw new \BgaVisibleSystemException("space unavailable");
        }
    }
}
