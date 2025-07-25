<?php

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class Realm extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    private function rotateDomain(): void {}

    private function buildRealm(): void {}

    public function setup(): void {
        
    }
}
