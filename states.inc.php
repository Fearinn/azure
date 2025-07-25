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

$machinestates = [
    2 => GameStateBuilder::create()
        ->name('playerTurn')
        ->description(clienttranslate('${actplayer} must play a card or pass'))
        ->descriptionmyturn(clienttranslate('${you} must play a card or pass'))
        ->type(StateType::ACTIVE_PLAYER)
        ->possibleactions([
            'actPlayCard',
            'actPass',
        ])
        ->transitions([
            'playCard' => 3,
            'pass' => 3,
        ])
        ->build(),

    3 => GameStateBuilder::create()
        ->name('nextPlayer')
        ->description('')
        ->type(StateType::GAME)
        ->action('stNextPlayer')
        ->updateGameProgression(true)
        ->transitions([
            'endScore' => 98,
            'nextPlayer' => 2,
        ])
        ->build(),

    98 => GameStateBuilder::endScore()->build(),
];
