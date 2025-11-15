<?php

namespace Bga\Games\Azure;

trait Notif
{
    private function getGame(): Game
    {
        return $this instanceof Game ? $this : $this->game;
    }

    private function decoratePlayerName(string $message, array &$args): void
    {
        $game = $this->getGame();
        
        if (
            isset($args["player_id"]) &&
            !isset($args["player_name"]) &&
            str_contains($message, '${player_name}')
        ) {
            $args["player_name"] = $game->getPlayerNameById($args["player_id"]);
        }

        for ($i = 2; $i <= 6; $i++) {
            if (
                isset($args["player_id{$i}"]) &&
                !isset($args["player_name{$i}"]) &&
                str_contains($message, "{player_name{$i}")
            ) {
                $args["player_name{$i}"] = $game->getPlayerNameById($args["player_id{$i}"]);
            }
        }
    }

    public function addDecorators(): void
    {
        $game = $this->getGame();
        $game->notify->addDecorator(
            function (
                string $message,
                array $args
            ) use ($game): array {
                $this->decoratePlayerName($message, $args);
                return $args;
            }
        );
    }

    public function notifAll(string $name, string $message, array $args = [], int $player_id = null): void
    {
        if ($player_id) {
            $args["player_id"] = $player_id;
        }

        $game = $this->getGame();
        $game->notify->all(
            $name,
            $message,
            $args,
        );
    }

    public function notifPlayer(int $player_id, string $name, string $message, array $args = []): void
    {
        $args["player_id"] = $player_id;

        $game = $this->getGame();
        $game->notify->player(
            $player_id,
            $name,
            $message,
            $args,
        );
    }
}