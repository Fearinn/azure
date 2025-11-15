<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\components\Beasts\BeastManager;
use Bga\Games\Azure\Game;

class StCheckBeasts extends StateManager
{
    private BeastManager $beastManager;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->beastManager = new BeastManager($game);
    }

    public function act(): void
    {
        $player_id = (int) $this->game->getActivePlayerId();

        $this->beastManager->checkBeasts($player_id);
    }
}
