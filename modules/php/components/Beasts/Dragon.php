<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\components\Wisdom\WisdomManager;
use Bga\Games\Azure\Game;

class Dragon extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 1);
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
        $Space = $SpaceManager->getById($this->space_id);

        $bondCount = $Space->countBonds($player_id, true);

        if ($bondCount < 2) {
            return false;
        }

        if (!$favored_player_id) {
            return true;
        }

        $favored_bondCount = $Space->countBonds($favored_player_id, true);

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
        $Space = $SpaceManager->getById($this->space_id);
        $orthogonalRelations = $Space->getOrthogonalRelations();

        if (!in_array($space_id, $orthogonalRelations)) {
            return false;
        }

        $opponent_space_id = $StoneManager->getGiftedSpace($opponent_id);
        if (!$opponent_space_id) {
            return true;
        }

        return !in_array($opponent_space_id, $orthogonalRelations);
    }

    public function gainFavor(int $player_id): void
    {
        $this->loseFavor();
        parent::gainFavor($player_id);

        $WisdomManager = new WisdomManager($this->game);
        $WisdomManager->inc($player_id, 3);
    }

    public function loseFavor(): void
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return;
        }

        parent::loseFavor();

        $WisdomManager = new WisdomManager($this->game);
        $WisdomManager->dec($player_id, 3);
    }
}
