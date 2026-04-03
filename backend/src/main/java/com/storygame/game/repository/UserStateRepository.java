package com.storygame.game.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.storygame.game.model.UserState;

public interface UserStateRepository extends MongoRepository<UserState, String> {
}
