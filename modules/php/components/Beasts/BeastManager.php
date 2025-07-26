<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\Game;
use Bga\Games\Azure\Subclass;

class BeastManager extends Subclass
{
    public function __construct(Game $game)
    {
        parent::__construct($game);
    }

    public function getMountains(): array
    {
        $realm = $this->globals->get(G_REALM);
        $mountains = [];

        foreach ($realm as $x => $column) {
            foreach ($column as $y => $space_id) {
                $space = (array) $this->SPACES[$space_id];
                $domain_id = (int) $space["domain"];
                $qi = (int) $space["qi"];
                $wisdom = (int) $space["wisdom"];

                if ($qi + $wisdom === 0) {
                    $mountains[] = [
                        "id" => $domain_id,
                        "space_id" => $space_id,
                        "x" => $x,
                        "y" => $y
                    ];
                }
            }
        }

        return $mountains;
    }
}
