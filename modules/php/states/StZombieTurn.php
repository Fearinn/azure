<?php

namespace Bga\Games\Azure\states;

use Bga\Games\Azure\actions\ActBirdDiscard;
use Bga\Games\Azure\actions\ActGatherBountiful;
use Bga\Games\Azure\actions\ActPlaceGifted;
use Bga\Games\Azure\actions\ActPlaceStone;
use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\Space;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;


class StZombieTurn extends StateManager
{
    private readonly int $player_id;
    public function __construct(Game $game, int $player_id)
    {
        parent::__construct($game);
        $this->player_id = $player_id;
    }

    private function getGreedySpace($spaces): Space
    {
        $SpaceManager = new SpaceManager($this->game);

        $greedy_space_id = (int) $spaces[0]["id"];
        $GreedySpace = $SpaceManager->getById($greedy_space_id);

        foreach ($spaces as $space) {
            $space_id = (int) $space["id"];
            $Space = $SpaceManager->getById($space_id);

            $spaceBoons = $Space->qi + $Space->wisdom;
            $greedyBoons = $GreedySpace->qi + $GreedySpace->wisdom;

            if (
                $spaceBoons >
                $greedyBoons ||
                ($spaceBoons === $greedyBoons &&
                    $Space->getCost($this->player_id) < $GreedySpace->getCost($this->player_id))
            ) {
                $GreedySpace = $Space;
            }
        }

        return $GreedySpace;
    }

    public function act(string $stateName): void
    {
        if ($stateName === "playerTurn") {
            $StPlayerTurn = new StPlayerTurn($this->game);
            $args = $StPlayerTurn->getArgs($this->player_id);

            $selectableGifted = $args["_private"]["active"]["selectableGifted"];
            if ($selectableGifted) {
                $Space = $this->getGreedySpace($selectableGifted);
                $ActPlaceGifted = new ActPlaceGifted($this->game, $this->player_id);
                $ActPlaceGifted->act($Space->x, $Space->y);
                return;
            }

            $selectableSpaces = $args["_private"]["active"]["selectableSpaces"];

            if ($selectableSpaces) {
                $Space = $this->getGreedySpace($selectableSpaces);
                $ActPlaceStone = new ActPlaceStone($this->game, $this->player_id);
                $ActPlaceStone->act($Space->x, $Space->y);
            }
            return;
        }

        if ($stateName === "birdDiscard") {
            $ActBirdDiscard = new ActBirdDiscard($this->game);
            $QiManager = new QiManager($this->game);

            $qi = $QiManager->getHand($this->player_id);
            $qi = array_slice($qi, 0, 2);
            $ActBirdDiscard->act($qi);
            return;
        }

        if ($stateName === "gatherBountiful") {
            $StGatherBountiful = new StGatherBountiful($this->game);
            $args = $StGatherBountiful->getArgs();

            if ($args["boon"] === "mixed") {
                $ActGatherBountiful = new ActGatherBountiful($this->game, $this->player_id);
                $ActGatherBountiful->act("wisdom");
            }
            return;
        }
    }
}
