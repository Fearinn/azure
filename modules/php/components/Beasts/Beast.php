<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\Game;

class Beast extends BeastManager
{
    public int $id;
    public string $tr_name;
    public int $mountain_id;

    public function __construct(Game $game, int $beast_id)
    {
        parent::__construct($game);
        $this->id = $beast_id;
        $info = $this->BEASTS;
        $this->tr_name = $info["tr_name"];
    }
}
