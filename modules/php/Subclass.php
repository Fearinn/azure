<?php

namespace Bga\Games\Azure;

use Bga\GameFramework\Db\Globals;

class Subclass
{
    public Game $game;
    public Globals $globals;
    public array $COLORS;
    public array $DOMAINS;
    public array $BEASTS;
    public array $SPACES;

    public function __construct(Game $game)
    {
        $this->game = $game;
        $this->globals = $this->game->globals;
        $this->DOMAINS = $this->game->DOMAINS;
        $this->BEASTS = $this->game->BEASTS;
        $this->SPACES = $this->game->SPACES;
    }
}
