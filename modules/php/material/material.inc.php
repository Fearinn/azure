<?php

$this->QI = [
    1 => [
        "name" => "azure",
        "label" => clienttranslate("Azure"),
    ],
    2 => [
        "name" => "white",
        "label" => clienttranslate("White"),
    ],
    3 => [
        "name" => "vermillion",
        "label" => clienttranslate("Vermillion"),
    ],
    4 => [
        "name" => "black",
        "label" => clienttranslate("Black"),
    ]
];

$this->BEASTS = [
    1 => [
        "animal" => "dragon",
        "label" => clienttranslate("Azure Dragon"),
        "guard" => clienttranslate("all stones horizontally and vertically in line with it, unless blocked by another mountain."),
        "favor" => clienttranslate("gain 3 wisdom."),
    ],
    2 => [
        "animal" => "tiger",
        "label" => clienttranslate("White Tiger"),
        "guard" => clienttranslate("all stones horizontally and vertically in line with it, unless blocked by another mountain."),
        "favor" => clienttranslate("gain 2 wisdom."),
    ],
    3 => [
        "animal" => "bird",
        "label" => clienttranslate("Vermillion Bird"),
        "guard" => clienttranslate("all stones in the Vermillion domain."),
        "favor" => clienttranslate("draw 2 cards from the hidden deck."),
    ],
    4 => [
        "animal" => "tortoise",
        "label" => clienttranslate("Black Tortoise"),
        "guard" => clienttranslate("all stones on serpent spaces in all domains."),
        "favor" => clienttranslate("place a common stone on its mountain.")
    ],
];

$this->MOUNTAINS = [
    1 => [
        1 => 1111,
        2 => 1221,
    ],
    2 => [
        1 => 2111,
        2 => 2221,
    ],
    3 => [
        1 => 3121,
        2 => 3222,
    ],
    4 => [
        1 => 4111,
        2 => 4221,
    ],
];

$this->SERPENTS = [
    1 => [
        1 => [1123, 1132],
        2 => [1213, 1232],
    ],
    2 => [
        1 => [2122, 2131],
        2 => [2223, 2231],
    ],
    3 => [
        1 => [3123],
        2 => [3212],
    ],
    4 => [
        1 => [4113, 4122, 4131],
        2 => [4211, 4223, 4232],
    ],
];

$this->GIFTED_CARDS = [
    1 => [
        "id" => 1,
        "cost" => 2,
        "label" => clienttranslate("Mighty"),
        "description" =>
        clienttranslate("Your gifted stone provides two bonds (instead of one) to all spaces horizontally and vertically in line with it, unless blocked by a mountain."),
    ],
    2 => [
        "id" => 2,
        "cost" => 2,
        "label" => clienttranslate("Perceptive"),
        "description" =>
        clienttranslate("Your gifted stone additionally provides one bond to all spaces diagonally in line with it, unless blocked by the center of a mountain."),
    ],
    3 => [
        "id" => 3,
        "cost" => 1,
        "label" => clienttranslate("Bountiful"),
        "description" =>
        clienttranslate("Your gifted stone allows you to take one additional boon of your choice, chosen from the boons in the space, when you play a common stone in any surrounding space (including diagonally adjacent spaces)."),
    ],
    4 => [
        "id" => 4,
        "cost" => 1,
        "label" => clienttranslate("Favored"),
        "description" =>
        clienttranslate("Your gifted stone lets you gain the favor of a Beast of a mountain that your gifted stone is guarding if you have the same number of stones guarding it as your opponent."),
    ]
];
