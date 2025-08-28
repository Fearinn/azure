<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;

class Tortoise extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 4);
    }

    public function check(int $player_id): void
    {
        if ($this->mustTakeFavor($player_id)) {
            $this->gainFavor($player_id);
        }
    }

    private function mustTakeFavor(int $player_id): bool
    {
        $favored_player_id = $this->getFavoredPlayer();

        if ($player_id === $favored_player_id) {
            return false;
        }

        $SpaceManager = new SpaceManager($this->game);
        $bondCount = $SpaceManager->countOccupiedSerpents($player_id);

        if ($bondCount < 2) {
            return false;
        }

        if (!$favored_player_id) {
            return true;
        }

        $favored_bondCount = $SpaceManager->countOccupiedSerpents($favored_player_id);

        if (
            $bondCount === $favored_bondCount
            && $this->checkFavoredStone($player_id, $favored_player_id)
        ) {
            return true;
        }

        return $bondCount > $favored_bondCount;
    }

    private function checkFavoredStone(int $player_id, int $opponent_id): bool
    {
        if ($this->globals->get(G_GIFTED_CARD) !== 4) {
            return false;
        }

        $StoneManager = new StoneManager($this->game);
        $space_id = $StoneManager->getGiftedSpace($player_id);

        if (!$space_id) {
            return false;
        }

        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($space_id);

        if (!$Space->isSerpent()) {
            return false;
        }

        $opponent_space_id = $StoneManager->getGiftedSpace($opponent_id);
        if (!$opponent_space_id) {
            return true;
        }

        $opponent_Space = $SpaceManager->getById($opponent_space_id);
        return !$opponent_Space->isSerpent();
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($this->space_id);

        $StoneManager = new StoneManager($this->game);
        $StoneManager->place($player_id, $Space->x, $Space->y);
    }

    public function loseFavor(): void
    {
        parent::loseFavor();

        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        $StoneManager = new StoneManager($this->game);
        $StoneManager->remove($player_id, $this->space_id);
    }
}
