<?php

namespace Bga\Games\Azure;

use Bga\GameFramework\Db\Globals;

class Subclass
{
    public readonly Game $game;
    public readonly Globals $globals;
    public readonly array $QI;
    public readonly array $DOMAINS;
    public readonly array $BEASTS;
    public readonly array $SPACES;

    public function __construct(Game $game)
    {
        $this->game = $game;
        $this->globals = $this->game->globals;
        $this->DOMAINS = $this->game->DOMAINS;
        $this->BEASTS = $this->game->BEASTS;
        $this->SPACES = $this->game->SPACES;
        $this->QI = $this->game->QI;
    }
}
