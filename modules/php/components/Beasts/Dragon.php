<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\Spaces\SpaceManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;

class Dragon extends Beast
{
    public function __construct(Game $game)
    {
        parent::__construct($game, 1);
    }

    public function check(int $player_id): void
    {
        $SpaceManager = new SpaceManager($this->game);
        $Space = $SpaceManager->getById($this->space_id);

        $bondsCount = $Space->countBonds($player_id);

        if ($bondsCount >= 2) {
            $this->gainFavor($player_id);
        }
    }

    public function gainFavor(int $player_id): void
    {
        parent::gainFavor($player_id);

        $ScoreManager = new ScoreManager($this->game);
        $ScoreManager->incScore($player_id, 3);
    }
}
