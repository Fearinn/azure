<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * Azure implementation : © Matheus Gomes matheusgomesforwork@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * Azure game states description
 *
 */

use Bga\GameFramework\GameStateBuilder;
use Bga\GameFramework\StateType;

if (!defined("ST_PLAYER_TURN")) {
    define("ST_PLAYER_TURN", 2);
}

$machinestates = [
    ST_PLAYER_TURN => GameStateBuilder::create()
        ->name("playerTurn")
        ->description(clienttranslate('${actplayer} must place a stone'))
        ->descriptionmyturn(clienttranslate('${you} must place a stone'))
        ->type(StateType::ACTIVE_PLAYER)
        ->possibleactions([
            "act_placeStone",
        ])
        ->transitions([
            "placeStone" => 3,
        ])
        ->build(),

    3 => GameStateBuilder::create()
        ->name("nextPlayer")
        ->description("")
        ->type(StateType::GAME)
        ->action("stNextPlayer")
        ->updateGameProgression(true)
        ->transitions([
            "endScore" => 98,
            "nextPlayer" => 2,
        ])
        ->build(),

    98 => GameStateBuilder::endScore()->build(),
];
