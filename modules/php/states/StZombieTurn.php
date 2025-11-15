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
    private SpaceManager $spaceManager;
    private QiManager $qiManager;
    private StPlayerTurn $stPlayerTurn;
    private ActPlaceGifted $actPlaceGifted;
    private ActPlaceStone $actPlaceStone;
    private ActBirdDiscard $actBirdDiscard;
    private StGatherBountiful $stGatherBountiful;
    private ActGatherBountiful $actGatherBountiful;

    public function __construct(Game $game, int $player_id)
    {
        parent::__construct($game);
        $this->player_id = $player_id;
        $this->spaceManager = new SpaceManager($game);
        $this->qiManager = new QiManager($game);
        $this->stPlayerTurn = new StPlayerTurn($game);
        $this->actPlaceGifted = new ActPlaceGifted($game);
        $this->actPlaceStone = new ActPlaceStone($game, $player_id);
        $this->actBirdDiscard = new ActBirdDiscard($game);
        $this->stGatherBountiful = new StGatherBountiful($game);
        $this->actGatherBountiful = new ActGatherBountiful($game, $player_id);
    }

    private function getGreedySpace($spaces): Space
    {
        $greedy_space_id = (int) $spaces[0]["id"];
        $GreedySpace = $this->spaceManager->getById($greedy_space_id);

        foreach ($spaces as $space) {
            $space_id = (int) $space["id"];
            $Space = $this->spaceManager->getById($space_id);

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
            $args = $this->stPlayerTurn->getArgs($this->player_id);

            $selectableGifted = $args["_private"]["active"]["selectableGifted"];
            if ($selectableGifted) {
                $Space = $this->getGreedySpace($selectableGifted);
                $this->actPlaceGifted->act($Space->x, $Space->y);
                return;
            }

            $selectableSpaces = $args["_private"]["active"]["selectableSpaces"];

            if ($selectableSpaces) {
                $Space = $this->getGreedySpace($selectableSpaces);
                $this->actPlaceStone->act($Space->x, $Space->y);
            }
            return;
        }

        if ($stateName === "birdDiscard") {
            $qi = $this->qiManager->getHand($this->player_id);
            $qi = array_slice($qi, 0, 2);
            $this->actBirdDiscard->act($qi);
            return;
        }

        if ($stateName === "gatherBountiful") {
            $args = $this->stGatherBountiful->getArgs();

            if ($args["boon"] === "mixed") {
                $this->actGatherBountiful->act("wisdom");
            }
            return;
        }
    }
}
