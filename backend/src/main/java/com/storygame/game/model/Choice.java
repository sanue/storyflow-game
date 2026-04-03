package com.storygame.game.model;

import java.util.HashMap;
import java.util.Map;

/**
 * 剧情选项（可嵌入 {@link StoryNode}）。
 */
public class Choice {

    private String id;
    private String label;
    /** 选择后跳转的下一节点 ID */
    private String nextNodeId;

    /**
     * 条件（最小实现）：{ "truth": ">=3", "resolve": "<=2" } 这种字符串表达式。
     * <p>为空/缺失表示恒成立。</p>
     */
    private Map<String, String> condition = new HashMap<>();

    /**
     * 效果：选择后把这些统计值做增量（可以认为是 i += effect[key]）。
     */
    private Map<String, Integer> effect = new HashMap<>();

    public Choice() {
    }

    public Choice(String id, String label, String nextNodeId) {
        this.id = id;
        this.label = label;
        this.nextNodeId = nextNodeId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getNextNodeId() {
        return nextNodeId;
    }

    public void setNextNodeId(String nextNodeId) {
        this.nextNodeId = nextNodeId;
    }

    public Map<String, String> getCondition() {
        return condition;
    }

    public void setCondition(Map<String, String> condition) {
        this.condition = condition;
    }

    public Map<String, Integer> getEffect() {
        return effect;
    }

    public void setEffect(Map<String, Integer> effect) {
        this.effect = effect;
    }
}
