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
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\Azure;

use Bga\Games\Azure\components\Spaces\SpaceManager;

class Game extends \Bga\GameFramework\Table
{
    public array $COLORS;
    public array $DOMAINS;
    public array $BEASTS;

    public function __construct()
    {
        parent::__construct();

        require "material/material.inc.php";
        require "material/domains.inc.php";
        require "material/constants.inc.php";

        $SpaceManager = new SpaceManager($this);
        $SpaceManager->setup();

        $this->initGameStateLabels([]);
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {

        $current_player_id = (int) $this->getCurrentPlayerId();

        $gamedatas = [
            "players" => $this->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "realm" => $this->globals->get(G_REALM),
            "domainsOrder" => $this->globals->get(G_DOMAINS_ORDER),
            "domainsRotations" => $this->globals->get(G_DOMAINS_ROTATIONS),
            "domainsSides" => $this->globals->get(G_DOMAINS_SIDES),
        ];

        return $gamedatas;
    }

    protected function setupNewGame($players, $options = [])
    {
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();
    }

    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default: {
                        $this->gamestate->nextState("zombiePass");
                        break;
                    }
            }

            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}
