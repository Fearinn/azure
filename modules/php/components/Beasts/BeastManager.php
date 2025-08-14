<?php

namespace Bga\Games\Azure\components\Beasts;

use Bga\Games\Azure\components\CardManager;
use Bga\Games\Azure\Game;
use Bga\Games\Azure\score\ScoreManager;

class BeastManager extends CardManager
{
    public function __construct(Game $game)
    {
        parent::__construct(
            $game,
            $game->beast_cards,
            "beast"
        );
    }

    public function setup(): void
    {
        $beastCards = [];
        foreach ($this->BEASTS as $domain_id => $beast) {
            $beastCards[] = ["type" => "", "type_arg" => $domain_id, "nbr" => 1];
        }

        $this->deck->createCards($beastCards, "realm");

        $domainSides = $this->globals->get(G_DOMAINS_SIDES);

        foreach ($this->MOUNTAINS as $domain_id => $domain) {
            $side = $domainSides[$domain_id];
            $space_id = $domain[$side];

            $this->game->DbQuery("UPDATE {$this->dbTable} SET card_type='{$space_id}', card_location_arg={$space_id}
            WHERE card_location='realm' AND card_type_arg={$domain_id}");
        }
    }

    public function getPlaced(): array
    {
        $cards = $this->deck->getCardsInLocation("realm");
        return array_values($cards);
    }

    public function getActive(): array
    {
        $cards = $this->deck->getCardsInLocation("favors");
        return array_values($cards);
    }

    public function checkBeasts(int $player_id): void
    {
        $Tortoise = new Tortoise($this->game);
        $Tortoise->check($player_id);

        $ScoreManager = new ScoreManager($this->game);

        $Dragon = new Dragon($this->game);
        $Dragon->check($player_id);

        if ($ScoreManager->getHigherScore() === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }

        $Tiger = new Tiger($this->game);
        $Tiger->check($player_id);

        if ($ScoreManager->getHigherScore() === 25) {
            $this->game->gamestate->nextState(TR_END_GAME);
            return;
        }

        $Bird = new Bird($this->game);
        if ($Bird->check($player_id)) {
            $this->game->gamestate->nextState(TR_BIRD_DISCARD);
            return;
        };
    }
}
