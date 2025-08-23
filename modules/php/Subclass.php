<?php

namespace Bga\Games\Azure;

use Bga\GameFramework\Db\Globals;
use GameState;

class Subclass
{
    protected readonly Game $game;
    protected readonly Globals $globals;
    protected readonly array $QI;
    protected readonly array $DOMAINS;
    protected readonly array $BEASTS;
    protected readonly array $MOUNTAINS;
    protected readonly array $SPACES;
    protected readonly array $SERPENTS;
    protected readonly array $GIFTED_CARDS;

    public function __construct(Game $game)
    {
        $this->game = $game;
        $this->globals = $this->game->globals;
        $this->DOMAINS = $this->game->DOMAINS;
        $this->BEASTS = $this->game->BEASTS;
        $this->MOUNTAINS = $this->game->MOUNTAINS;
        $this->SPACES = $this->game->SPACES;
        $this->QI = $this->game->QI;
        $this->SERPENTS = $this->game->SERPENTS;
        $this->GIFTED_CARDS = $this->game->GIFTED_CARDS;
    }
}
