package com.storygame.game.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.storygame.game.model.StoryNode;

public interface StoryNodeRepository extends MongoRepository<StoryNode, String> {
}
