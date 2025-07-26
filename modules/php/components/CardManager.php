<?php

namespace Bga\Games\Azure\components;

use Bga\GameFramework\Components\Deck;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class CardManager extends Subclass
{
    public readonly Deck $deck;
    public readonly string $dbTable;

    public function __construct(
        Game $game,
        Deck $deck,
        string $dbTable
    ) {
        parent::__construct($game);
        $this->deck = $deck;
        $this->dbTable = $dbTable;
    }
}
