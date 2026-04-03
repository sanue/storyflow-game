package com.storygame.game.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.storygame.game.model.Choice;
import com.storygame.game.model.StoryNode;
import com.storygame.game.repository.StoryNodeRepository;

@Component
public class StoryDataInitializer implements ApplicationRunner {

    private final StoryNodeRepository storyNodeRepository;
    private final ObjectMapper objectMapper;

    // 占位资源路径（当前实现用 WebAudio 也会播放占位声音，但仍保留结构字段）
    private static final String DEFAULT_BGM_URL = "/audio/bgm_long_placeholder.mp3";
    private static final String DEFAULT_CHOICE_IMAGE_URL = "/images/choice_placeholder.svg";
    private static final String DEFAULT_CHOICE_VOICE_URL = "/audio/choice_voice_placeholder.mp3";

    public StoryDataInitializer(StoryNodeRepository storyNodeRepository, ObjectMapper objectMapper) {
        this.storyNodeRepository = storyNodeRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean needsImport = storyNodeRepository.count() == 0;
        if (!needsImport) {
            // 兼容旧数据：如果新字段 type 缺失，就重新导入覆盖
            needsImport = storyNodeRepository.findById(StoryService.START_NODE_ID)
                    .map(StoryNode::getType)
                    .map(Objects::isNull)
                    .orElse(true);
        }

        if (!needsImport) {
            // 兼容旧数据：如果新字段 bgmUrl 缺失，也重新导入覆盖
            needsImport = storyNodeRepository.findById(StoryService.START_NODE_ID)
                    .map(StoryNode::getBgmUrl)
                    .map(Objects::isNull)
                    .orElse(true);
        }

        if (!needsImport) {
            return;
        }

        try (InputStream is = new ClassPathResource("story/story.json").getInputStream()) {
            RawStoryRoot rawRoot = objectMapper.readValue(is, RawStoryRoot.class);
            List<StoryNode> nodes = new ArrayList<>();
            if (rawRoot != null && rawRoot.nodes != null) {
                for (RawStoryNode raw : rawRoot.nodes) {
                    nodes.add(convert(raw));
                }
            }
            storyNodeRepository.saveAll(nodes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to import starter story JSON", e);
        }
    }

    private StoryNode convert(RawStoryNode raw) {
        StoryNode node = new StoryNode();
        node.setId(raw.id);
        node.setType(raw.type);
        node.setText(raw.content);
        node.setBgmUrl(DEFAULT_BGM_URL);
        node.setAutoNextNodeId(raw.autoNext);

        List<Choice> choices = new ArrayList<>();
        if (raw.choices != null) {
            for (RawChoice rawChoice : raw.choices) {
                Choice c = new Choice();
                c.setId(rawChoice.id);
                c.setLabel(rawChoice.text);
                c.setNextNodeId(rawChoice.nextNodeId);
                c.setImageUrl(DEFAULT_CHOICE_IMAGE_URL);
                c.setVoiceUrl(DEFAULT_CHOICE_VOICE_URL);
                c.setCondition(safeStringMap(rawChoice.condition));
                c.setEffect(safeIntegerMap(rawChoice.effect));
                choices.add(c);
            }
        }
        node.setChoices(choices);
        return node;
    }

    private Map<String, String> safeStringMap(Map<String, String> input) {
        return (input == null) ? new HashMap<>() : input;
    }

    private Map<String, Integer> safeIntegerMap(Map<String, Integer> input) {
        return (input == null) ? new HashMap<>() : input;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class RawStoryRoot {
        public List<RawStoryNode> nodes;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class RawStoryNode {
        public String id;
        public String type;
        public String content;
        @JsonProperty("auto_next")
        public String autoNext;
        public List<RawChoice> choices;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class RawChoice {
        public String id;
        public String text;
        @JsonProperty("next_node_id")
        public String nextNodeId;
        public Map<String, String> condition;
        public Map<String, Integer> effect;
    }
}

