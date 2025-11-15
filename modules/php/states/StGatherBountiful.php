<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\actions\ActGatherBountiful;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;

class StGatherBountiful extends StateManager
{
    private SpaceManager $spaceManager;
    private ActGatherBountiful $actGatherBountiful;

    public function __construct(Game $game)
    {
        parent::__construct($game);
        $this->spaceManager = new SpaceManager($game);
        $this->actGatherBountiful = new ActGatherBountiful($game);
    }

    public function getArgs(): array
    {
        $space_id = $this->globals->get(G_BOUNTIFUL_SPACE);
        $Space = $this->spaceManager->getById($space_id);

        $no_notify = $Space->qi === 0 || $Space->wisdom === 0;

        $boon = "mixed";
        if ($no_notify) {
            $boon = $Space->qi === 0 ? "wisdom" : "qi";
        }

        $args = [
            "space_icon" => "",
            "space_id" => $this->globals->get(G_BOUNTIFUL_SPACE),
            "boon" => $boon,
            "_no_notify" => $no_notify,
        ];

        return $args;
    }

    public function act(): void
    {
        $args = $this->getArgs();

        if ($args["_no_notify"]) {
            $this->actGatherBountiful->act($args["boon"]);
            return;
        }
    }
}
