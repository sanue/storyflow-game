package com.storygame.game.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.storygame.game.service.StoryService;
import com.storygame.game.service.StoryService.StoryNodeResponse;

@RestController
@RequestMapping("/api/story")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping("/start")
    public StoryNodeResponse start(@RequestBody(required = false) StartRequest request) {
        String userId = (request == null) ? StoryService.DEFAULT_USER_ID : request.userId();
        return storyService.start(userId);
    }

    @PostMapping("/choose")
    public StoryNodeResponse choose(@RequestBody ChooseRequest request) {
        return storyService.choose(request.userId(), request.fromNodeId(), request.choiceId());
    }

    @GetMapping("/current")
    public StoryNodeResponse current(@RequestParam String userId) {
        return storyService.current(userId);
    }

    public record StartRequest(String userId) {
    }

    public record ChooseRequest(String userId, String fromNodeId, String choiceId) {
    }
}

