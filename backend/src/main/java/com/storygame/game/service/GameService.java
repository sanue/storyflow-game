package com.storygame.game.service;

import org.springframework.stereotype.Service;

import com.storygame.game.repository.StoryNodeRepository;
import com.storygame.game.repository.UserStateRepository;

@Service
public class GameService {

    private final StoryNodeRepository storyNodeRepository;
    private final UserStateRepository userStateRepository;

    public GameService(StoryNodeRepository storyNodeRepository, UserStateRepository userStateRepository) {
        this.storyNodeRepository = storyNodeRepository;
        this.userStateRepository = userStateRepository;
    }

    /** 占位：后续实现剧情加载、选项提交等 */
    public long countStoryNodes() {
        return storyNodeRepository.count();
    }

    public long countUserStates() {
        return userStateRepository.count();
    }
}
