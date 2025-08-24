<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\actions\ActGatherBountiful;
use Bga\Games\Azure\actions\ActPlaceStone;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;

class StGatherBountiful extends StateManager
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function getArgs(): array
    {
        $args = [
            "space_icon" => "",
            "space_id" => $this->globals->get(G_BOUNTIFUL_SPACE),
        ];

        return $args;
    }

    public function act(): void
    {
        $space_id = $this->globals->get(G_BOUNTIFUL_SPACE);
        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($space_id);

        $ActGatherBountiful = new ActGatherBountiful($this->game);

        if ($Space->qi === 0) {
            $ActGatherBountiful->act("wisdom");
        }

        if ($Space->wisdom === 0) {
            $ActGatherBountiful->act("qi");
        }
    }
}
