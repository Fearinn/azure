<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Qi\QiManager;
use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\components\Stones\StoneManager;
use Bga\Games\Azure\Game;

class Bird extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 3);
    }

    public function check(int $player_id): bool
    {
        if ($this->mustTakeFavor($player_id)) {
            return $this->bird_gainFavor($player_id);
        }

        return false;
    }

    private function mustTakeFavor(int $player_id): bool
    {
        $favored_player_id = $this->getFavoredPlayer();

        if ($player_id === $favored_player_id) {
            return false;
        }

        $SpaceManager = new SpaceManager($this->game);
        $bondCount = $SpaceManager->countOccupiedByDomain($player_id, 3);

        if ($bondCount < 2) {
            return false;
        }

        if (!$favored_player_id) {
            return true;
        }

        $favored_bondCount = $SpaceManager->countOccupiedByDomain($favored_player_id, 3);

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

        if ($Space->domain_id !== 3) {
            return false;
        }

        $opponent_space_id = $StoneManager->getGiftedSpace($opponent_id);
        if (!$opponent_space_id) {
            return true;
        }

        $opponent_Space = $SpaceManager->getById($opponent_space_id);
        return $opponent_Space->domain_id !== 3;
    }

    public function bird_gainFavor(int $player_id): bool
    {
        $pendingBird = $this->bird_loseFavor() ? $this->globals->get(G_PENDING_BIRD) : $player_id;
        parent::gainFavor($player_id);

        if (!$pendingBird) {
            $this->globals->set(G_PENDING_BIRD, $player_id);
            return true;
        }

        $this->execFavor($player_id);
        return false;
    }

    public function bird_loseFavor(): bool
    {
        $player_id = $this->getFavoredPlayer();

        if (!$player_id) {
            return false;
        }

        parent::loseFavor();

        $this->game->giveExtraTime($player_id);
        $this->game->gamestate->changeActivePlayer($player_id);
        return true;
    }

    public function execFavor(int $player_id): void
    {
        $QiManager = new QiManager($this->game);
        $QiManager->draw($player_id, 2);
    }
}
