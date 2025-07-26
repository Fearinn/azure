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

    public function getBeasts(): array
    {
        $realm = $this->globals->get(G_REALM);
        $locations = [];

        foreach ($realm as $x => $column) {
            foreach ($column as $y => $space_id) {
                [$domain_id, $side, $space_x, $space_y] = str_split((string) $space_id);
                $space = $this->DOMAINS[$domain_id]["sides"][$side][$space_x][$space_y];

                if ($space["qi"] + $space["wisdom"] === 0) {
                    $locations[] = ["id" => (int) $domain_id, "space_id" => $space_id, "x" => $x, "y" => $y];
                }
            }
        }

        return $locations;
    }
}
