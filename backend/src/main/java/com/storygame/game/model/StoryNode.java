package com.storygame.game.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 剧情节点（存储在 `story_nodes` 集合）。
 */
@Document(collection = "story_nodes")
public class StoryNode {

    @Id
    private String id;
    /**
     * 节点类型：text / choice / ending
     * <p>用于前端展示策略，也用于后端自动跳转。</p>
     */
    private String type;
    /**
     * 背景音乐占位（全局长音乐）。
     * <p>当前实现里由前端用 WebAudio 生成占位音乐，因此此字段主要用于结构预留。</p>
     */
    private String bgmUrl;
    private String text;
    /**
     * 自动跳转到的下一个节点 id（只在 type=text 时常用）。
     */
    private String autoNextNodeId;
    private List<Choice> choices = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBgmUrl() {
        return bgmUrl;
    }

    public void setBgmUrl(String bgmUrl) {
        this.bgmUrl = bgmUrl;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getAutoNextNodeId() {
        return autoNextNodeId;
    }

    public void setAutoNextNodeId(String autoNextNodeId) {
        this.autoNextNodeId = autoNextNodeId;
    }

    public List<Choice> getChoices() {
        return choices;
    }

    public void setChoices(List<Choice> choices) {
        this.choices = choices;
    }
}
